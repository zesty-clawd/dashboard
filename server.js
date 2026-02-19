import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const app = express();

const PORT = Number(process.env.PORT || 3000);
const MEMORY_DIR = process.env.MEMORY_DIR || '/data/memory';
const STICKERS_DIR = process.env.STICKERS_DIR || '/data/stickers';
const DIARIES_DIR = process.env.DIARIES_DIR || path.join(MEMORY_DIR, 'diaries');
const CRON_DIR = process.env.CRON_DIR || '/data/cron';
const CRON_JOBS_FILE = path.join(CRON_DIR, 'jobs.json');
const CRON_RUNS_DIR = path.join(CRON_DIR, 'runs');
const DEFAULT_DISCORD_DM_TARGET = process.env.DISCORD_DM_TARGET || 'channel:1466010122227548170';
const execFileAsync = promisify(execFile);

app.use(cors());
app.use(express.json());

function memoryPath(filename) {
  return path.join(MEMORY_DIR, filename);
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonFile(filePath, data) {
  const serialized = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, serialized, 'utf8');
}

async function readCronJobs() {
  const data = await readJsonFile(CRON_JOBS_FILE);
  return {
    version: data.version || 1,
    jobs: Array.isArray(data.jobs) ? data.jobs : [],
  };
}

async function writeCronJobs(data) {
  await writeJsonFile(CRON_JOBS_FILE, data);
}

function touchJob(job) {
  const now = Date.now();
  return {
    ...job,
    createdAtMs: job.createdAtMs || now,
    updatedAtMs: now,
  };
}

async function runBlogwatcher(args) {
  const { stdout } = await execFileAsync('blogwatcher', args, {
    cwd: '/app',
    maxBuffer: 1024 * 1024 * 4,
  });
  return stdout;
}

function parseBlogwatcherBlogs(raw) {
  const lines = raw.split(/\r?\n/);
  const blogs = [];
  let current = null;

  for (const line of lines) {
    const nameMatch = line.match(/^\s{2}(.+?)\s*$/);
    const urlMatch = line.match(/^\s{4}URL:\s*(.+)$/);
    const feedMatch = line.match(/^\s{4}Feed:\s*(.+)$/);
    const scannedMatch = line.match(/^\s{4}Last scanned:\s*(.+)$/);

    if (nameMatch && !line.includes('URL:') && !line.includes('Feed:') && !line.includes('Last scanned:')) {
      if (current) blogs.push(current);
      current = { name: nameMatch[1].trim(), url: '', feed: '', lastScanned: '' };
      continue;
    }

    if (!current) continue;
    if (urlMatch) current.url = urlMatch[1].trim();
    if (feedMatch) current.feed = feedMatch[1].trim();
    if (scannedMatch) current.lastScanned = scannedMatch[1].trim();
  }

  if (current) blogs.push(current);
  return blogs.filter((blog) => blog.name);
}

function parseBlogwatcherArticles(raw) {
  const lines = raw.split(/\r?\n/);
  const articles = [];
  let current = null;
  let mode = 'unread';

  for (const line of lines) {
    if (line.startsWith('All articles')) mode = 'all';
    if (line.startsWith('Unread articles')) mode = 'unread';

    const idTitleMatch = line.match(/^\s*\[(\d+)\]\s*\[(new|read)\]\s*(.+)$/);
    if (idTitleMatch) {
      if (current) articles.push(current);
      current = {
        id: Number(idTitleMatch[1]),
        status: idTitleMatch[2],
        title: idTitleMatch[3].trim(),
        blog: '',
        url: '',
        published: '',
        mode,
      };
      continue;
    }

    if (!current) continue;

    const blogMatch = line.match(/^\s*Blog:\s*(.+)$/);
    const urlMatch = line.match(/^\s*URL:\s*(.+)$/);
    const publishedMatch = line.match(/^\s*Published:\s*(.+)$/);

    if (blogMatch) current.blog = blogMatch[1].trim();
    if (urlMatch) current.url = urlMatch[1].trim();
    if (publishedMatch) current.published = publishedMatch[1].trim();
  }

  if (current) articles.push(current);
  return articles;
}

// Stickers: serve files directly
app.use('/stickers', express.static(STICKERS_DIR));

// API: quests
app.get('/api/quests', async (req, res) => {
  try {
    const data = await readJsonFile(memoryPath('quests.json'));
    res.json(data);
  } catch (error) {
    console.error('Error reading quests.json:', error);
    res.status(500).json({ error: 'Failed to read quests data' });
  }
});

// API: health
app.get('/api/health', async (req, res) => {
  try {
    const data = await readJsonFile(memoryPath('heartbeat-state.json'));
    res.json(data);
  } catch (error) {
    console.error('Error reading heartbeat-state.json:', error);
    res.status(500).json({ error: 'Failed to read health data' });
  }
});

// API: karma
app.get('/api/karma', async (req, res) => {
  try {
    const health = await readJsonFile(memoryPath('heartbeat-state.json'));
    res.json({ karma: health.last_moltbook_karma || 0 });
  } catch (error) {
    console.error('Error reading karma data:', error);
    res.status(500).json({ error: 'Failed to read karma data' });
  }
});

async function getDiaryFiles() {
  const files = await fs.readdir(DIARIES_DIR);
  return files
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort((a, b) => b.localeCompare(a));
}

function parseDiaryEntries(raw) {
  const lines = raw.split(/\r?\n/);
  return lines
    .filter((line) => /^- \*\*\d{1,2}:\d{2} (AM|PM)\*\*:/.test(line.trim()))
    .map((line) => {
      const clean = line.replace(/^-\s*/, '');
      const markerEnd = clean.indexOf(': ');
      if (markerEnd === -1) {
        return { time: 'N/A', text: clean };
      }

      const timeMarker = clean.slice(0, markerEnd).replace(/\*\*/g, '');
      const text = clean.slice(markerEnd + 2).trim();
      return { time: timeMarker, text };
    });
}

// API: diary available dates
app.get('/api/diary/dates', async (req, res) => {
  try {
    const diaryFiles = await getDiaryFiles();
    const dates = diaryFiles.map((file) => file.replace('.md', ''));
    return res.json({ dates });
  } catch (error) {
    console.error('Error reading diary dates:', error);
    return res.status(500).json({ error: 'Failed to read diary dates' });
  }
});

// API: diary entries by date (default: latest day)
app.get('/api/diary', async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(requestedLimit) ? null : Math.max(1, Math.min(requestedLimit, 500));

    const requestedDate = (req.query.date || '').toString().trim();
    const diaryFiles = await getDiaryFiles();

    if (diaryFiles.length === 0) {
      return res.json({ file: null, date: null, entries: [] });
    }

    const requestedFile = requestedDate ? `${requestedDate}.md` : diaryFiles[0];
    const targetFile = diaryFiles.includes(requestedFile) ? requestedFile : diaryFiles[0];

    const raw = await fs.readFile(path.join(DIARIES_DIR, targetFile), 'utf8');
    const parsedEntries = parseDiaryEntries(raw);
    const entries = limit ? parsedEntries.slice(-limit).reverse() : parsedEntries.reverse();

    return res.json({
      file: targetFile,
      date: targetFile.replace('.md', ''),
      entries,
      totalEntries: parsedEntries.length,
    });
  } catch (error) {
    console.error('Error reading diary:', error);
    return res.status(500).json({ error: 'Failed to read diary entries' });
  }
});

// API: stickers list
app.get('/api/stickers', async (req, res) => {
  try {
    const files = await fs.readdir(STICKERS_DIR);

    const stickers = files
      .filter((file) => /\.(gif|png|jpg|jpeg)$/i.test(file))
      .map((file, index) => ({
        id: index + 1,
        name: file.replace(/\.[^/.]+$/, ''),
        filename: file,
        url: `/stickers/${file}`,
      }));

    res.json(stickers);
  } catch (error) {
    console.error('Error reading stickers:', error);
    res.status(500).json({ error: 'Failed to read stickers' });
  }
});

// API: cron jobs
app.get('/api/cron/jobs', async (req, res) => {
  try {
    const data = await readCronJobs();
    const jobs = data.jobs.sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    return res.json({ version: data.version, jobs });
  } catch (error) {
    console.error('Error reading cron jobs:', error);
    return res.status(500).json({ error: 'Failed to read cron jobs' });
  }
});

app.post('/api/cron/jobs', async (req, res) => {
  try {
    const jobInput = req.body?.job;
    if (!jobInput || typeof jobInput !== 'object') {
      return res.status(400).json({ error: 'job is required' });
    }

    const data = await readCronJobs();
    const newJob = touchJob({
      id: crypto.randomUUID(),
      enabled: true,
      wakeMode: 'next-heartbeat',
      ...jobInput,
    });

    data.jobs.push(newJob);
    await writeCronJobs(data);
    return res.status(201).json({ job: newJob });
  } catch (error) {
    console.error('Error creating cron job:', error);
    return res.status(500).json({ error: 'Failed to create cron job' });
  }
});

app.put('/api/cron/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body?.patch;

    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({ error: 'patch is required' });
    }

    const data = await readCronJobs();
    const index = data.jobs.findIndex((job) => job.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const merged = {
      ...data.jobs[index],
      ...patch,
      schedule: patch.schedule ? patch.schedule : data.jobs[index].schedule,
      payload: patch.payload ? patch.payload : data.jobs[index].payload,
      delivery: patch.delivery ? patch.delivery : data.jobs[index].delivery,
    };

    data.jobs[index] = touchJob(merged);
    await writeCronJobs(data);
    return res.json({ job: data.jobs[index] });
  } catch (error) {
    console.error('Error updating cron job:', error);
    return res.status(500).json({ error: 'Failed to update cron job' });
  }
});

app.post('/api/cron/jobs/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body || {};

    const data = await readCronJobs();
    const index = data.jobs.findIndex((job) => job.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const nextEnabled = typeof enabled === 'boolean' ? enabled : !Boolean(data.jobs[index].enabled);
    data.jobs[index] = touchJob({ ...data.jobs[index], enabled: nextEnabled });

    await writeCronJobs(data);
    return res.json({ job: data.jobs[index] });
  } catch (error) {
    console.error('Error toggling cron job:', error);
    return res.status(500).json({ error: 'Failed to toggle cron job' });
  }
});

app.delete('/api/cron/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readCronJobs();
    const before = data.jobs.length;
    data.jobs = data.jobs.filter((job) => job.id !== id);

    if (data.jobs.length === before) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await writeCronJobs(data);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    return res.status(500).json({ error: 'Failed to delete cron job' });
  }
});

// API: cron job runs/history
app.get('/api/cron/runs', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const files = await fs.readdir(CRON_RUNS_DIR);
    const runs = [];

    const jobsData = await readCronJobs();
    const jobMap = new Map(jobsData.jobs.map((j) => [j.id, j.name]));

    for (const file of files) {
      if (!file.endsWith('.jsonl')) continue;
      const filePath = path.join(CRON_RUNS_DIR, file);
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.trim().split('\n');

      let lastLine = {};
      try {
        lastLine = lines.length > 0 ? JSON.parse(lines[lines.length - 1]) : {};
      } catch {
        continue;
      }

      runs.push({
        jobId: lastLine.jobId || file.replace('.jsonl', ''),
        jobName: jobMap.get(lastLine.jobId) || lastLine.jobId || 'Unknown Job',
        runId: lastLine.sessionId || '',
        status: lastLine.status || 'unknown',
        summary: lastLine.summary || '',
        durationMs: lastLine.durationMs || 0,
        runAtMs: lastLine.runAtMs || stat.mtimeMs,
        finishedAtMs: lastLine.finishedAtMs || (lastLine.runAtMs + (lastLine.durationMs || 0)),
      });
    }

    runs.sort((a, b) => b.runAtMs - a.runAtMs);
    return res.json({ runs: runs.slice(0, limit) });
  } catch (error) {
    console.error('Error reading cron runs:', error);
    return res.status(500).json({ error: 'Failed to read cron runs' });
  }
});

// API: RSS blogs (blogwatcher)
app.get('/api/rss/blogs', async (_req, res) => {
  try {
    const stdout = await runBlogwatcher(['blogs']);
    const blogs = parseBlogwatcherBlogs(stdout);
    return res.json({ blogs });
  } catch (error) {
    console.error('Error listing blogwatcher blogs:', error);
    return res.status(500).json({ error: 'Failed to list blogs' });
  }
});

app.post('/api/rss/blogs', async (req, res) => {
  try {
    const { name, url } = req.body || {};
    if (!name || !url) {
      return res.status(400).json({ error: 'name and url are required' });
    }

    await runBlogwatcher(['add', String(name), String(url)]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error adding blog:', error);
    return res.status(500).json({ error: 'Failed to add blog' });
  }
});

app.put('/api/rss/blogs/:name', async (req, res) => {
  try {
    const oldName = req.params.name;
    const { name, url } = req.body || {};
    if (!name || !url) {
      return res.status(400).json({ error: 'name and url are required' });
    }

    if (oldName !== name) {
      await runBlogwatcher(['remove', oldName]);
      await runBlogwatcher(['add', String(name), String(url)]);
    } else {
      await runBlogwatcher(['remove', oldName]);
      await runBlogwatcher(['add', oldName, String(url)]);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error editing blog:', error);
    return res.status(500).json({ error: 'Failed to edit blog' });
  }
});

app.delete('/api/rss/blogs/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await runBlogwatcher(['remove', name]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error removing blog:', error);
    return res.status(500).json({ error: 'Failed to remove blog' });
  }
});

app.get('/api/rss/articles', async (req, res) => {
  try {
    const args = ['articles'];
    if (req.query.all === '1' || req.query.all === 'true') args.push('--all');
    if (req.query.blog) args.push('--blog', String(req.query.blog));

    const stdout = await runBlogwatcher(args);
    const articles = parseBlogwatcherArticles(stdout);
    const limit = Number(req.query.limit) || 200;
    return res.json({ articles: articles.slice(0, Math.max(1, Math.min(limit, 1000))) });
  } catch (error) {
    console.error('Error listing articles:', error);
    return res.status(500).json({ error: 'Failed to list articles' });
  }
});

app.post('/api/rss/articles/:id/read', async (req, res) => {
  try {
    await runBlogwatcher(['read', String(req.params.id)]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error marking article read:', error);
    return res.status(500).json({ error: 'Failed to mark article read' });
  }
});

app.post('/api/rss/articles/:id/unread', async (req, res) => {
  try {
    await runBlogwatcher(['unread', String(req.params.id)]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error marking article unread:', error);
    return res.status(500).json({ error: 'Failed to mark article unread' });
  }
});

app.post('/api/rss/read-all', async (req, res) => {
  try {
    const args = ['read-all', '--yes'];
    if (req.body?.blog) args.push('--blog', String(req.body.blog));
    const stdout = await runBlogwatcher(args);
    return res.json({ ok: true, output: stdout });
  } catch (error) {
    console.error('Error marking all read:', error);
    return res.status(500).json({ error: 'Failed to mark all read' });
  }
});

app.post('/api/rss/scan', async (req, res) => {
  try {
    const args = ['scan'];
    if (req.body?.blogName) args.push(String(req.body.blogName));
    if (req.body?.workers) args.push('--workers', String(req.body.workers));
    if (req.body?.silent) args.push('--silent');

    const stdout = await runBlogwatcher(args);
    return res.json({ ok: true, output: stdout, command: `blogwatcher ${args.join(' ')}` });
  } catch (error) {
    console.error('Error scanning blogs:', error);
    return res.status(500).json({ error: 'Failed to scan blogs' });
  }
});

app.post('/api/rss/scan-summary-discord', async (req, res) => {
  try {
    const target = (req.body?.target || DEFAULT_DISCORD_DM_TARGET).toString().trim();
    if (!target) {
      return res.status(400).json({ error: 'Discord target is required' });
    }

    const now = Date.now();
    const at = new Date(now + 15 * 1000).toISOString();
    const job = touchJob({
      id: crypto.randomUUID(),
      name: `RSS scan+summary -> Discord ${target}`,
      description: 'Scan RSS and send digest to Discord DM',
      enabled: true,
      schedule: { kind: 'at', at },
      sessionTarget: 'isolated',
      wakeMode: 'now',
      payload: {
        kind: 'agentTurn',
        timeoutSeconds: 1200,
        message:
          'Run `blogwatcher scan` first. Then read latest unread items via `blogwatcher articles` and send a concise Traditional Chinese digest (5-10 bullets, grouped by topic) to the specified Discord user. Include top items and why they matter. IMPORTANT: You MUST send the message to Discord user ' + target + ' even if it is not your default channel.',
      },
      delivery: {
        mode: 'announce',
        channel: 'discord',
        to: target,
        bestEffort: true,
      },
    });

    const data = await readCronJobs();
    data.jobs.push(job);
    await writeCronJobs(data);

    return res.status(201).json({ ok: true, job });
  } catch (error) {
    console.error('Error creating rss scan+summary job:', error);
    return res.status(500).json({ error: 'Failed to queue scan+summary job' });
  }
});

// Static frontend
app.use(express.static('dist'));

// SPA fallback
app.get('*', async (req, res) => {
  res.sendFile(path.resolve('dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Dashboard server running on http://localhost:${PORT}`);
  console.log(`MEMORY_DIR=${MEMORY_DIR}`);
  console.log(`DIARIES_DIR=${DIARIES_DIR}`);
  console.log(`STICKERS_DIR=${STICKERS_DIR}`);
  console.log(`CRON_DIR=${CRON_DIR}`);
});

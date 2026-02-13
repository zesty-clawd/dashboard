// Service to handle data fetching for the dashboard

class DataService {
  constructor() {
    this.basePath = '/api';
  }

  async fetchQuestStats() {
    try {
      const response = await fetch('/api/quests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quest stats:', error);
      return {
        active: [],
        completed: []
      };
    }
  }

  async fetchHealthStatus() {
    try {
      const response = await fetch('/api/health');
      return await response.json();
    } catch (error) {
      console.error('Error fetching health status:', error);
      return {
        last_check_summary: 'System operational',
        reported_alerts: []
      };
    }
  }

  async fetchMoltbookKarma() {
    try {
      const response = await fetch('/api/karma');
      const data = await response.json();
      return data.karma || 0;
    } catch (error) {
      console.error('Error fetching Moltbook karma:', error);
      return 0;
    }
  }

  async fetchStickers() {
    try {
      const response = await fetch('/api/stickers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stickers:', error);
      return [];
    }
  }

  async fetchDiary({ date, limit } = {}) {
    try {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (typeof limit === 'number') params.set('limit', String(limit));

      const query = params.toString();
      const response = await fetch(`/api/diary${query ? `?${query}` : ''}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching diary:', error);
      return { file: null, date: null, entries: [], totalEntries: 0 };
    }
  }

  async fetchDiaryDates() {
    try {
      const response = await fetch('/api/diary/dates');
      return await response.json();
    } catch (error) {
      console.error('Error fetching diary dates:', error);
      return { dates: [] };
    }
  }

  async fetchCronJobs() {
    try {
      const response = await fetch('/api/cron/jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching cron jobs:', error);
      return { jobs: [] };
    }
  }

  async createCronJob(job) {
    const response = await fetch('/api/cron/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job }),
    });
    if (!response.ok) throw new Error('Failed to create cron job');
    return response.json();
  }

  async updateCronJob(id, patch) {
    const response = await fetch(`/api/cron/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch }),
    });
    if (!response.ok) throw new Error('Failed to update cron job');
    return response.json();
  }

  async toggleCronJob(id, enabled) {
    const response = await fetch(`/api/cron/jobs/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!response.ok) throw new Error('Failed to toggle cron job');
    return response.json();
  }

  async deleteCronJob(id) {
    const response = await fetch(`/api/cron/jobs/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete cron job');
    return response.json();
  }

  async fetchRssBlogs() {
    const response = await fetch('/api/rss/blogs');
    if (!response.ok) throw new Error('Failed to fetch RSS blogs');
    return response.json();
  }

  async createRssBlog({ name, url }) {
    const response = await fetch('/api/rss/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    });
    if (!response.ok) throw new Error('Failed to create RSS blog');
    return response.json();
  }

  async updateRssBlog(oldName, { name, url }) {
    const response = await fetch(`/api/rss/blogs/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    });
    if (!response.ok) throw new Error('Failed to update RSS blog');
    return response.json();
  }

  async deleteRssBlog(name) {
    const response = await fetch(`/api/rss/blogs/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete RSS blog');
    return response.json();
  }

  async scanRssNow() {
    const response = await fetch('/api/rss/scan', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to scan RSS feeds');
    return response.json();
  }
}

export default new DataService();
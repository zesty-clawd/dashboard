import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2, Power, PowerOff, RefreshCcw, Clock3 } from 'lucide-react';
import dataService from '../utils/dataService';

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isoToLocalDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return formatDateKey(d);
};

const isoToLocalTime = (isoString) => {
  if (!isoString) return '09:00';
  const d = new Date(isoString);
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
};

const buildAtIso = (date, time) => {
  if (!date) return null;
  const [hh = '09', mm = '00'] = (time || '09:00').split(':');
  return `${date}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00+08:00`;
};

const defaultForm = {
  name: '',
  description: '',
  agentId: 'main',
  enabled: true,
  scheduleKind: 'at',
  atDate: formatDateKey(new Date()),
  atTime: '09:00',
  cronExpr: '0 9 * * *',
  tz: 'Asia/Taipei',
  everyMs: 3600000,
  sessionTarget: 'isolated',
  payloadKind: 'agentTurn',
  timeoutSeconds: 1200,
  deliveryMode: 'announce',
  deliveryChannel: '',
  deliveryTo: '',
  deliveryBestEffort: true,
  wakeMode: 'next-heartbeat',
  message: '',
};

const CronCalendarCard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setError('');
    try {
      const data = await dataService.fetchCronJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      setError('載入 cron jobs 失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const oneShotJobs = useMemo(
    () => jobs.filter((job) => job.schedule?.kind === 'at' && job.schedule?.at),
    [jobs],
  );

  const recurringJobs = useMemo(
    () => jobs.filter((job) => job.schedule?.kind !== 'at'),
    [jobs],
  );

  const jobsByDate = useMemo(() => {
    const map = new Map();
    oneShotJobs.forEach((job) => {
      const key = isoToLocalDate(job.schedule.at);
      if (!key) return;
      const arr = map.get(key) || [];
      arr.push(job);
      map.set(key, arr);
    });
    return map;
  }, [oneShotJobs]);

  const selectedDayJobs = jobsByDate.get(selectedDate) || [];

  const monthMatrix = useMemo(() => {
    const year = monthAnchor.getFullYear();
    const month = monthAnchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [monthAnchor]);

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, atDate: selectedDate });
  };

  const startEdit = (job) => {
    setEditingId(job.id);
    setForm({
      name: job.name || '',
      description: job.description || '',
      agentId: job.agentId || 'main',
      enabled: Boolean(job.enabled),
      scheduleKind: job.schedule?.kind || 'at',
      atDate: isoToLocalDate(job.schedule?.at) || selectedDate,
      atTime: isoToLocalTime(job.schedule?.at),
      cronExpr: job.schedule?.expr || '0 9 * * *',
      tz: job.schedule?.tz || 'Asia/Taipei',
      everyMs: job.schedule?.everyMs || 3600000,
      sessionTarget: job.sessionTarget || 'isolated',
      payloadKind: job.payload?.kind || 'agentTurn',
      timeoutSeconds: job.payload?.timeoutSeconds || 1200,
      deliveryMode: job.delivery?.mode || 'announce',
      deliveryChannel: job.delivery?.channel || '',
      deliveryTo: job.delivery?.to || '',
      deliveryBestEffort:
        typeof job.delivery?.bestEffort === 'boolean' ? job.delivery.bestEffort : true,
      wakeMode: job.wakeMode || 'next-heartbeat',
      message: job.payload?.message || job.payload?.text || '',
    });
  };

  const composeJobPayload = () => {
    const sessionTarget = form.sessionTarget;
    const payloadKind = sessionTarget === 'main' ? 'systemEvent' : 'agentTurn';

    let schedule;
    if (form.scheduleKind === 'cron') {
      schedule = { kind: 'cron', expr: form.cronExpr, tz: form.tz || 'Asia/Taipei' };
    } else if (form.scheduleKind === 'every') {
      schedule = { kind: 'every', everyMs: Number(form.everyMs) || 3600000 };
    } else {
      schedule = { kind: 'at', at: buildAtIso(form.atDate, form.atTime) };
    }

    const payload =
      payloadKind === 'systemEvent'
        ? { kind: 'systemEvent', text: form.message }
        : {
            kind: 'agentTurn',
            message: form.message,
            timeoutSeconds: Number(form.timeoutSeconds) || 1200,
          };

    const delivery = {
      mode: form.deliveryMode || 'announce',
    };

    if (form.deliveryChannel.trim()) delivery.channel = form.deliveryChannel.trim();
    if (form.deliveryTo.trim()) delivery.to = form.deliveryTo.trim();
    if (typeof form.deliveryBestEffort === 'boolean') delivery.bestEffort = form.deliveryBestEffort;

    return {
      name: form.name,
      description: form.description,
      agentId: form.agentId || 'main',
      enabled: Boolean(form.enabled),
      schedule,
      sessionTarget,
      wakeMode: form.wakeMode || 'next-heartbeat',
      payload,
      delivery,
    };
  };

  const saveJob = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = composeJobPayload();
      if (editingId) {
        await dataService.updateCronJob(editingId, payload);
      } else {
        await dataService.createCronJob(payload);
      }
      await loadJobs();
      resetForm();
    } catch (err) {
      setError('儲存失敗，請檢查欄位格式');
    } finally {
      setSaving(false);
    }
  };

  const removeJob = async (id) => {
    if (!window.confirm('確定要刪除這個 cron job？')) return;
    try {
      await dataService.deleteCronJob(id);
      await loadJobs();
      if (editingId === id) resetForm();
    } catch (err) {
      setError('刪除失敗');
    }
  };

  const toggleJob = async (job) => {
    try {
      await dataService.toggleCronJob(job.id, !job.enabled);
      await loadJobs();
    } catch (err) {
      setError('切換啟用狀態失敗');
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-cyan-400" size={20} />
          <h2 className="text-xl font-semibold">Cron 日曆排程</h2>
          <span className="text-xs text-slate-400">({jobs.length} jobs)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadJobs}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 text-sm flex items-center gap-1"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm flex items-center gap-1"
          >
            <Plus size={14} />
            新增 Job
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">{error}</p>}

      {loading ? (
        <p className="text-slate-400 text-sm">載入 cron jobs...</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  className="px-2 py-1 text-sm rounded border border-slate-600 hover:bg-slate-700"
                  onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1))}
                >
                  ←
                </button>
                <h3 className="font-medium">
                  {monthAnchor.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
                </h3>
                <button
                  type="button"
                  className="px-2 py-1 text-sm rounded border border-slate-600 hover:bg-slate-700"
                  onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1))}
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthMatrix.flat().map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="h-14 rounded-lg bg-slate-900/40" />;
                  const key = formatDateKey(day);
                  const count = (jobsByDate.get(key) || []).length;
                  const selected = key === selectedDate;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`h-14 rounded-lg border text-left p-2 transition ${
                        selected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/70 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{day.getDate()}</div>
                        {count > 0 && <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />}
                      </div>
                      {count > 0 && <div className="text-[11px] text-cyan-300">有 {count} 筆一次性</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
              <h3 className="font-medium mb-2">{selectedDate} 的一次性排程</h3>
              {selectedDayJobs.length === 0 ? (
                <p className="text-sm text-slate-400">這一天沒有 at 類型的排程。</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayJobs.map((job) => (
                    <div key={job.id} className="rounded-lg border border-slate-700 p-3 bg-slate-950/50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-100">{job.name || '(未命名)'}</p>
                          {job.description ? <p className="text-xs text-slate-400">{job.description}</p> : null}
                          <p className="text-xs text-slate-500">{job.schedule?.at} · wake: {job.wakeMode || 'next-heartbeat'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 rounded hover:bg-slate-700" onClick={() => startEdit(job)}>
                            <Pencil size={14} />
                          </button>
                          <button className="p-2 rounded hover:bg-slate-700" onClick={() => toggleJob(job)}>
                            {job.enabled ? <Power size={14} className="text-emerald-400" /> : <PowerOff size={14} className="text-slate-500" />}
                          </button>
                          <button className="p-2 rounded hover:bg-rose-500/20" onClick={() => removeJob(job.id)}>
                            <Trash2 size={14} className="text-rose-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
              <h3 className="font-medium mb-2">循環排程（cron / every）</h3>
              {recurringJobs.length === 0 ? (
                <p className="text-sm text-slate-400">目前沒有循環排程。</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recurringJobs.map((job) => (
                    <div key={job.id} className="rounded-lg border border-slate-700 p-3 bg-slate-950/50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-100">{job.name || '(未命名)'}</p>
                          {job.description ? <p className="text-xs text-slate-400">{job.description}</p> : null}
                          <p className="text-xs text-slate-500">
                            {job.schedule?.kind === 'cron'
                              ? `cron: ${job.schedule?.expr} (${job.schedule?.tz || 'UTC'})`
                              : `every: ${job.schedule?.everyMs || 0} ms`}
                            {` · wake: ${job.wakeMode || 'next-heartbeat'}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 rounded hover:bg-slate-700" onClick={() => startEdit(job)}>
                            <Pencil size={14} />
                          </button>
                          <button className="p-2 rounded hover:bg-slate-700" onClick={() => toggleJob(job)}>
                            {job.enabled ? <Power size={14} className="text-emerald-400" /> : <PowerOff size={14} className="text-slate-500" />}
                          </button>
                          <button className="p-2 rounded hover:bg-rose-500/20" onClick={() => removeJob(job.id)}>
                            <Trash2 size={14} className="text-rose-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-3">
            <h3 className="font-medium">{editingId ? '編輯 Cron Job' : '新增 Cron Job'}</h3>

            <label className="text-xs text-slate-400 block">
              名稱
              <input
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>

            <label className="text-xs text-slate-400 block">
              Description
              <input
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-400 block">
                Agent
                <input
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  value={form.agentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, agentId: e.target.value }))}
                />
              </label>

              <label className="text-xs text-slate-400 block">
                Session
                <select
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  value={form.sessionTarget}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sessionTarget: e.target.value,
                      payloadKind: e.target.value === 'main' ? 'systemEvent' : 'agentTurn',
                    }))
                  }
                >
                  <option value="isolated">isolated</option>
                  <option value="main">main</option>
                </select>
              </label>
            </div>

            <label className="text-xs text-slate-400 block">
              排程類型
              <select
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                value={form.scheduleKind}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduleKind: e.target.value }))}
              >
                <option value="at">at（單次）</option>
                <option value="cron">cron（固定時程）</option>
                <option value="every">every（固定間隔）</option>
              </select>
            </label>

            {form.scheduleKind === 'at' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-400 block">
                  日期
                  <input
                    type="date"
                    className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                    value={form.atDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, atDate: e.target.value }))}
                  />
                </label>
                <label className="text-xs text-slate-400 block">
                  時間
                  <input
                    type="time"
                    className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                    value={form.atTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, atTime: e.target.value }))}
                  />
                </label>
              </div>
            )}

            {form.scheduleKind === 'cron' && (
              <>
                <label className="text-xs text-slate-400 block">
                  Cron 表達式
                  <input
                    className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                    value={form.cronExpr}
                    onChange={(e) => setForm((prev) => ({ ...prev, cronExpr: e.target.value }))}
                  />
                </label>
                <label className="text-xs text-slate-400 block">
                  時區
                  <input
                    className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                    value={form.tz}
                    onChange={(e) => setForm((prev) => ({ ...prev, tz: e.target.value }))}
                  />
                </label>
              </>
            )}

            {form.scheduleKind === 'every' && (
              <label className="text-xs text-slate-400 block">
                everyMs
                <input
                  type="number"
                  min="1000"
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  value={form.everyMs}
                  onChange={(e) => setForm((prev) => ({ ...prev, everyMs: Number(e.target.value) }))}
                />
              </label>
            )}

            <label className="text-xs text-slate-400 block">
              訊息內容
              <textarea
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm min-h-[90px]"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
            </label>

            {form.sessionTarget === 'isolated' && (
              <label className="text-xs text-slate-400 block">
                Timeout (seconds)
                <input
                  type="number"
                  min="30"
                  step="30"
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  value={form.timeoutSeconds}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, timeoutSeconds: Number(e.target.value) || 1200 }))
                  }
                />
              </label>
            )}

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-400 block">
                Delivery Mode
                <select
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  value={form.deliveryMode}
                  onChange={(e) => setForm((prev) => ({ ...prev, deliveryMode: e.target.value }))}
                >
                  <option value="announce">announce</option>
                  <option value="none">none</option>
                </select>
              </label>

              <label className="text-xs text-slate-400 block">
                Wake Mode
                <select
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  value={form.wakeMode}
                  onChange={(e) => setForm((prev) => ({ ...prev, wakeMode: e.target.value }))}
                >
                  <option value="next-heartbeat">next-heartbeat</option>
                  <option value="now">now</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-400 block">
                Delivery Channel
                <input
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  placeholder="例如 discord"
                  value={form.deliveryChannel}
                  onChange={(e) => setForm((prev) => ({ ...prev, deliveryChannel: e.target.value }))}
                />
              </label>

              <label className="text-xs text-slate-400 block">
                Delivery To
                <input
                  className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                  placeholder="例如 channel:123"
                  value={form.deliveryTo}
                  onChange={(e) => setForm((prev) => ({ ...prev, deliveryTo: e.target.value }))}
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                啟用
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.deliveryBestEffort}
                  onChange={(e) => setForm((prev) => ({ ...prev, deliveryBestEffort: e.target.checked }))}
                />
                Best effort
              </label>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={saveJob}
                disabled={saving || !form.name || !form.message}
                className="flex-1 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500"
              >
                {saving ? '儲存中…' : editingId ? '更新 Job' : '建立 Job'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded border border-slate-600 hover:bg-slate-700"
              >
                清除
              </button>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock3 size={12} />
              main 會使用 systemEvent；isolated 會使用 agentTurn。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronCalendarCard;

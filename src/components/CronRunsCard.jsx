import React, { useEffect, useState } from 'react';
import { Clock3, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import dataService from '../utils/dataService';

const CronRunsCard = ({ limit = 20, compact = false }) => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRuns = async () => {
    try {
      const data = await dataService.fetchCronRuns(limit);
      setRuns(data.runs || []);
    } catch (err) {
      console.error('Failed to load runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
    const interval = setInterval(loadRuns, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms) => {
    if (!ms) return '-';
    const secs = Math.round(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remainSecs}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  const formatTime = (ms) => {
    if (!ms) return '-';
    const d = new Date(ms);
    return d.toLocaleString('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status) => {
    if (status === 'ok') return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (status === 'error' || status === 'failed') return <XCircle size={14} className="text-rose-400" />;
    return <Loader2 size={14} className="text-amber-400 animate-spin" />;
  };

  const getStatusLabel = (status) => {
    if (status === 'ok') return '完成';
    if (status === 'error' || status === 'failed') return '失敗';
    return '執行中';
  };

  const getStatusColor = (status) => {
    if (status === 'ok') return 'bg-emerald-500/10 border-emerald-500/30';
    if (status === 'error' || status === 'failed') return 'bg-rose-500/10 border-rose-500/30';
    return 'bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className={`bg-slate-800 rounded-2xl border border-slate-700 space-y-4 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock3 className="text-cyan-400" size={compact ? 16 : 20} />
          <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold`}>
            {compact ? '最近紀錄' : '任務執行紀錄'}
          </h2>
          <span className="text-xs text-slate-400">({runs.length})</span>
        </div>
        <button
          type="button"
          onClick={loadRuns}
          className="p-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 text-xs"
        >
          {compact ? <RefreshCw size={14} /> : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">載入中...</p>
      ) : runs.length === 0 ? (
        <p className="text-slate-400 text-sm">尚無執行紀錄</p>
      ) : (
        <div className={`space-y-2 overflow-y-auto pr-1 ${compact ? 'max-h-[600px]' : 'max-h-[400px]'}`}>
          {runs.map((run, idx) => (
            <div
              key={run.jobId + idx}
              className={`rounded-lg border p-3 ${getStatusColor(run.status)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">
                      {getStatusLabel(run.status)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDuration(run.durationMs)}
                    </span>
                  </div>
                  {!compact && run.summary && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {run.summary.slice(0, 200)}
                      {run.summary.length > 200 ? '...' : ''}
                    </p>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 whitespace-nowrap">
                  {formatTime(run.runAtMs)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CronRunsCard;

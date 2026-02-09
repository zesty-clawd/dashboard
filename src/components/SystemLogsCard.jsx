import React, { useState, useEffect } from 'react';
import { Activity, Terminal, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';

const SystemLogsCard = () => {
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', message: 'Initializing Dashboard...', time: '02:47:00' },
    { id: 2, type: 'success', message: 'System components loaded successfully', time: '02:47:01' },
    { id: 3, type: 'info', message: 'Connecting to Zesty Core...', time: '02:47:02' },
    { id: 4, type: 'success', message: 'Connection established', time: '02:47:03' },
    { id: 5, type: 'info', message: 'Fetching quest data...', time: '02:47:04' },
    { id: 6, type: 'info', message: 'Loading collection book...', time: '02:47:05' },
    { id: 7, type: 'success', message: 'Dashboard ready - All systems operational', time: '02:47:06' },
  ]);

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    // Simulate real-time logs
    const logTypes = ['info', 'success', 'warning'];
    const messages = [
      'Quest progress updated',
      'Karma synchronized',
      'Health check completed',
      'New alert detected',
      'Database connection refreshed',
      'API call successful',
      'Data synchronization complete',
      'System heartbeat received'
    ];

    const addLog = () => {
      const type = logTypes[Math.floor(Math.random() * logTypes.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const time = now.toTimeString().slice(0, 8);

      const newLog = {
        id: Date.now(),
        type,
        message,
        time
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10));
    };

    // Add a new log every 5-10 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        addLog();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={14} />;
      case 'warning':
        return <AlertCircle className="text-orange-400" size={14} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={14} />;
      default:
        return <Info className="text-blue-400" size={14} />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-orange-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-green-400" size={20} />
          <h2 className="text-xl font-semibold">Live Signals</h2>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Terminal className="text-slate-400" size={16} />
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`text-xs px-2 py-1 rounded ${
              isLive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {isLive ? 'Monitoring' : 'Paused'}
          </button>
        </div>
      </div>

      <div className="bg-black/30 rounded-xl p-4 font-mono text-xs space-y-2 overflow-hidden">
        <div className="flex items-center gap-2 text-slate-500 mb-2 pb-2 border-b border-slate-700">
          <Clock size={14} />
          <span>Real-time event stream</span>
        </div>
        
        {logs.slice(0, 8).map((log) => (
          <div key={log.id} className="flex items-start gap-2 animate-fade-in">
            <span className="text-slate-500 shrink-0">[{log.time}]</span>
            <span className={getLogColor(log.type)}>
              {getLogIcon(log.type)}
            </span>
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogsCard;
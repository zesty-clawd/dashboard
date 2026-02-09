import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import dataService from '../utils/dataService';

const HealthStatusCard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dataService.fetchHealthStatus();
        setHealthData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-green-400" size={20} />
          <h2 className="text-xl font-semibold">System Health</h2>
        </div>
        <div className="animate-pulse">
          <p className="text-slate-400">Loading system status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-red-400" size={20} />
          <h2 className="text-xl font-semibold">System Health</h2>
        </div>
        <div className="text-red-400">Error loading health data: {error}</div>
      </div>
    );
  }

  // Calculate health status based on alerts
  const hasCriticalAlerts = healthData.reported_alerts && healthData.reported_alerts.length > 0;
  const healthStatus = hasCriticalAlerts ? 'warning' : 'healthy';
  
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        {healthStatus === 'healthy' ? (
          <CheckCircle className="text-green-400" size={20} />
        ) : (
          <AlertTriangle className="text-orange-400" size={20} />
        )}
        <h2 className="text-xl font-semibold">System Health</h2>
        <span className={`ml-auto text-xs px-2 py-1 rounded ${
          healthStatus === 'healthy' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          {healthStatus === 'healthy' ? 'Optimal' : 'Attention Needed'}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-slate-400">Last Check:</p>
        <p className="text-slate-200">{healthData.last_heartbeat_check || 'N/A'}</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-slate-400">Status:</p>
        <p className="text-slate-200">{healthData.last_check_summary || 'System operational'}</p>
      </div>
      
      {hasCriticalAlerts && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-red-400" size={16} />
            <p className="text-sm font-medium text-red-400">Recent Alerts ({healthData.reported_alerts.length})</p>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {healthData.reported_alerts.slice(0, 3).map((alert, index) => (
              <p key={index} className="text-xs text-red-300 truncate">{alert}</p>
            ))}
            {healthData.reported_alerts.length > 3 && (
              <p className="text-xs text-slate-500">+{healthData.reported_alerts.length - 3} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatusCard;
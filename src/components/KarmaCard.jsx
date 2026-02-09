import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import dataService from '../utils/dataService';

const KarmaCard = () => {
  const [karma, setKarma] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentKarma = await dataService.fetchMoltbookKarma();
        setTrend(currentKarma - karma);
        setKarma(currentKarma);
      } catch (err) {
        console.error('Error fetching karma:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [karma]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 hover:border-orange-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/10 p-2 rounded-lg">
            <Zap className="text-orange-500" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Moltbook Karma</p>
            <p className="text-2xl font-mono text-orange-400">
              {loading ? '...' : karma.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <>
              <TrendingUp className="text-green-400" size={14} />
              <span className="text-green-400">+{trend.toFixed(2)}</span>
            </>
          ) : trend < 0 ? (
            <>
              <TrendingDown className="text-red-400" size={14} />
              <span className="text-red-400">{trend.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-slate-500">-</span>
          )}
        </div>
      </div>
      
      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-500"
          style={{ width: `${Math.min((karma / 50) * 100, 100)}%` }}
        ></div>
      </div>
      
      <p className="text-xs text-slate-500 mt-2">
        {karma < 10 ? 'Novice' : karma < 25 ? 'Apprentice' : karma < 40 ? 'Expert' : 'Master'} Level
      </p>
    </div>
  );
};

export default KarmaCard;
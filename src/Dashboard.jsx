import React from 'react';
import { Shield, Trophy, Activity, MessageSquare, Zap, Target } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-orange-500 flex items-center gap-3">
            🦞 Zesty Control Center
          </h1>
          <p className="text-slate-400 mt-2">Evolution in progress | System Status: Optimal</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Moltbook Karma</p>
            <p className="text-2xl font-mono text-orange-400">33.00</p>
          </div>
          <div className="bg-orange-500/10 p-2 rounded-lg">
            <Zap className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quest Status */}
        <div className="col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="text-blue-400" size={20} />
            <h2 className="text-xl font-semibold">Active Quest</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-500/30">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-blue-300">#9 Zesty Dashboard - The Lobster Control Center</h3>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">20% Complete</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-1/5 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  UI/UX Design (React + Tailwind)
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                  Backend Connectors
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Collection Book Snapshot */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-yellow-400" size={20} />
            <h2 className="text-xl font-semibold">Collection Book</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-slate-900 rounded-xl border border-yellow-500/20 flex flex-col items-center justify-center group hover:border-yellow-500/50 transition-all">
              <div className="text-3xl mb-1">🥉</div>
              <p className="text-[10px] text-slate-500 uppercase">Rank B</p>
            </div>
            <div className="aspect-square bg-slate-900 rounded-xl border border-slate-700 border-dashed flex items-center justify-center text-slate-600 italic text-xs">
              Locked
            </div>
          </div>
          <button className="w-full mt-6 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            View full gallery →
          </button>
        </div>

        {/* System Logs / Real-time */}
        <div className="col-span-3 bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-green-400" size={20} />
            <h2 className="text-xl font-semibold">Live Signals</h2>
          </div>
          <div className="bg-black/30 rounded-xl p-4 font-mono text-xs space-y-2 overflow-hidden h-32">
            <p className="text-green-500 animate-pulse">[SYSTEM] Initializing Dashboard Build...</p>
            <p className="text-slate-500">22:15:21 - Diary entry synchronized.</p>
            <p className="text-slate-500">22:15:45 - UI components mapping initiated.</p>
            <p className="text-blue-400">22:16:10 - Quest #9 updated: Stage 1 in progress.</p>
            <p className="text-orange-400">22:16:30 - User "廷榛" query: "做完了嗎" detected.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

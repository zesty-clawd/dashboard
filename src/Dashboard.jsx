import React, { useState, useEffect } from 'react';
import { Zap, Activity, Target, Trophy, Menu, X } from 'lucide-react';
import HealthStatusCard from './components/HealthStatusCard';
import KarmaCard from './components/KarmaCard';
import QuestStatsCard from './components/QuestStatsCard';
import CollectionBookCard from './components/CollectionBookCard';
import SystemLogsCard from './components/SystemLogsCard';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-TW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700 lg:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            🦞 Zesty
          </h1>
          <p className="text-slate-500 text-sm mt-1">Control Center</p>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Activity size={20} />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Target size={20} />
            <span>Quests</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Trophy size={20} />
            <span>Collection</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Zap size={20} />
            <span>Karma</span>
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-lg">
              🦞
            </div>
            <div>
              <p className="font-medium text-sm">廷榛</p>
              <p className="text-xs text-slate-500">Master Level</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                控制中心
              </h1>
              <p className="text-slate-400 mt-1">{formatDate(currentTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono text-orange-400">
                {formatTime(currentTime)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Asia/Taipei</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KarmaCard />
            
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-green-400" size={20} />
                <span className="text-sm text-slate-400">System Status</span>
              </div>
              <p className="text-2xl font-bold text-green-400">Online</p>
              <p className="text-xs text-slate-500 mt-1">All services operational</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-400" size={20} />
                <span className="text-sm text-slate-400">Active Quests</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">4</p>
              <p className="text-xs text-slate-500 mt-1">In progress</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="text-yellow-400" size={20} />
                <span className="text-sm text-slate-400">Collected</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">4</p>
              <p className="text-xs text-slate-500 mt-1">Stickers earned</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <HealthStatusCard />
              <SystemLogsCard />
            </div>

            <div className="space-y-6">
              <QuestStatsCard />
              <CollectionBookCard />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 p-6 mt-8">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <p>🦞 Zesty Dashboard v1.0.0</p>
            <p>Quest #9 - The Lobster Control Center</p>
          </div>
        </footer>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Zap, Activity, Target, Trophy, Menu, X, BookOpen, CalendarDays, Rss, History } from 'lucide-react';
import HealthStatusCard from './components/HealthStatusCard';
import KarmaCard from './components/KarmaCard';
import QuestStatsCard from './components/QuestStatsCard';
import CollectionBookCard from './components/CollectionBookCard';
import SystemLogsCard from './components/SystemLogsCard';
import DiaryCard from './components/DiaryCard';
import CronCalendarCard from './components/CronCalendarCard';
import CronRunsCard from './components/CronRunsCard';
import RssFeedsCard from './components/RssFeedsCard';
import dataService from './utils/dataService';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity },
  { key: 'quests', label: 'Quests', icon: Target },
  { key: 'collection', label: 'Collection', icon: Trophy },
  { key: 'karma', label: 'Karma', icon: Zap },
  { key: 'diary', label: 'Diary', icon: BookOpen },
  { key: 'cron', label: 'Cron', icon: CalendarDays },
  { key: 'cronRuns', label: '執行紀錄', icon: History },
  { key: 'rss', label: 'RSS', icon: Rss },
];

const viewMeta = {
  dashboard: { title: '控制中心', subtitle: '全域總覽與系統狀態' },
  quests: { title: 'Quests', subtitle: '任務進度、逾期追蹤與成就狀態' },
  collection: { title: 'Collection', subtitle: '貼圖蒐藏簿與獎勵檢視' },
  karma: { title: 'Karma', subtitle: 'Moltbook 聲望與近期動態' },
  diary: { title: 'Diary', subtitle: 'Zesty 的日記即時同步' },
  cron: { title: 'Cron Scheduler', subtitle: '以日曆方式管理排程（新增、編輯、刪除、停用/啟用）' },
  cronRuns: { title: 'Cron 執行紀錄', subtitle: '查看定時任務的執行歷史與結果' },
  rss: { title: 'RSS Sources', subtitle: '管理 blogwatcher 的 RSS 來源（新增、編輯、移除）' },
};

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeQuestCount, setActiveQuestCount] = useState(0);
  const [stickerCount, setStickerCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hashView = window.location.hash.replace('#', '');
    if (hashView && navItems.some((item) => item.key === hashView)) {
      setActiveView(hashView);
    }
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      const [questStats, stickers] = await Promise.all([
        dataService.fetchQuestStats(),
        dataService.fetchStickers(),
      ]);
      setActiveQuestCount(questStats?.active?.length || 0);
      setStickerCount(stickers?.length || 0);
    };

    loadSummary();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-TW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleNavClick = (viewKey) => {
    setActiveView(viewKey);
    window.history.replaceState(null, '', `#${viewKey}`);
    setSidebarOpen(false);
  };

  const renderDashboardView = () => (
    <>
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
          <p className="text-2xl font-bold text-blue-400">{activeQuestCount}</p>
          <p className="text-xs text-slate-500 mt-1">In progress</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-400" size={20} />
            <span className="text-sm text-slate-400">Collected</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stickerCount}</p>
          <p className="text-xs text-slate-500 mt-1">Stickers earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <HealthStatusCard />
          <SystemLogsCard />
        </div>

        <div className="space-y-6">
          <QuestStatsCard />
          <CollectionBookCard />
          <DiaryCard />
        </div>
      </div>
    </>
  );

  const renderQuestsView = () => (
    <div className="space-y-6">
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
        <p className="text-orange-300 text-sm">
          任務頁是獨立功能頁，不再只是同頁捲動。這裡會聚焦 quest 狀態與後續 watchdog 擴充。
        </p>
      </div>
      <QuestStatsCard />
      <SystemLogsCard />
    </div>
  );

  const renderCollectionView = () => (
    <div className="space-y-6">
      <CollectionBookCard />
    </div>
  );

  const renderKarmaView = () => (
    <div className="space-y-6">
      <KarmaCard />
      <HealthStatusCard />
      <SystemLogsCard />
    </div>
  );

  const renderDiaryView = () => (
    <div className="space-y-6">
      <DiaryCard />
    </div>
  );

  const renderCronView = () => (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3">
        <CronCalendarCard />
      </div>
      <div>
        <CronRunsCard compact={true} limit={15} />
      </div>
    </div>
  );

  const renderCronRunsView = () => (
    <div className="space-y-6">
      <CronRunsCard />
    </div>
  );

  const renderRssView = () => (
    <div className="space-y-6">
      <RssFeedsCard />
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'quests':
        return renderQuestsView();
      case 'collection':
        return renderCollectionView();
      case 'karma':
        return renderKarmaView();
      case 'diary':
        return renderDiaryView();
      case 'cron':
        return renderCronView();
      case 'cronRuns':
        return renderCronRunsView();
      case 'rss':
        return renderRssView();
      case 'dashboard':
      default:
        return renderDashboardView();
    }
  };

  const currentMeta = viewMeta[activeView] || viewMeta.dashboard;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700 lg:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`
        fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      >
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">🦞 Zesty</h1>
          <p className="text-slate-500 text-sm mt-1">Control Center</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleNavClick(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                key === activeView
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className={key === activeView ? 'font-medium' : ''}>{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-lg">
              🦞
            </div>
            <div>
              <p className="font-medium text-sm">廷榛</p>
              <p className="text-xs text-slate-500">Partner Mode</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">{currentMeta.title}</h1>
              <p className="text-slate-400 mt-1">{currentMeta.subtitle}</p>
              <p className="text-slate-500 text-sm mt-1">{formatDate(currentTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono text-orange-400">{formatTime(currentTime)}</p>
              <p className="text-xs text-slate-500 mt-1">Asia/Taipei</p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">{renderActiveView()}</div>

        <footer className="border-t border-slate-800 p-6 mt-8">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <p>🦞 Zesty Dashboard v1.1.0</p>
            <p>Quest #9 - The Lobster Control Center</p>
          </div>
        </footer>
      </main>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
      )}
    </div>
  );
};

export default Dashboard;

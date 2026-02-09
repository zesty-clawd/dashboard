import React, { useState, useEffect } from 'react';
import { Target, Circle, CheckCircle2, Clock } from 'lucide-react';
import dataService from '../utils/dataService';

const QuestStatsCard = () => {
  const [questsData, setQuestsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dataService.fetchQuestStats();
        setQuestsData(data);
      } catch (err) {
        console.error('Error fetching quest stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll every 20 seconds
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = (quest) => {
    if (!quest.stages || quest.stages.length === 0) return 0;
    const completed = quest.stages.filter(stage => stage.done).length;
    return (completed / quest.stages.length) * 100;
  };

  const getQuestStatusColor = (progress) => {
    if (progress === 100) return 'text-green-400';
    if (progress > 50) return 'text-blue-400';
    return 'text-yellow-400';
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-blue-400" size={20} />
          <h2 className="text-xl font-semibold">Quest Progress</h2>
        </div>
        <div className="animate-pulse">
          <p className="text-slate-400">Loading quest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="text-blue-400" size={20} />
          <h2 className="text-xl font-semibold">Quest Progress</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-slate-400">
            Active: <span className="text-white">{questsData?.active?.length || 0}</span>
          </span>
          <span className="text-slate-400">
            Completed: <span className="text-green-400">{questsData?.completed?.length || 0}</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {questsData?.active?.map((quest) => {
          const progress = calculateProgress(quest);
          return (
            <div 
              key={quest.id} 
              className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-blue-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-200">{quest.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  progress === 100 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {progress.toFixed(0)}% Complete
                </span>
              </div>
              
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full transition-all duration-500 ${
                    progress === 100 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="space-y-1">
                {quest.stages?.slice(0, 3).map((stage, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {stage.done ? (
                      <CheckCircle2 className="text-green-400" size={14} />
                    ) : (
                      <Circle className="text-slate-600" size={14} />
                    )}
                    <span className={stage.done ? 'text-slate-400 line-through' : 'text-slate-300'}>
                      {stage.name}
                    </span>
                  </div>
                ))}
                {quest.stages?.length > 3 && (
                  <p className="text-xs text-slate-500 pl-6">
                    +{quest.stages.length - 3} more stages
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {questsData?.active?.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Clock className="mx-auto mb-2" size={32} />
            <p>No active quests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestStatsCard;
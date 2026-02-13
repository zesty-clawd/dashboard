import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Clock, CalendarDays } from 'lucide-react';
import dataService from '../utils/dataService';

const DiaryCard = () => {
  const [diary, setDiary] = useState({ file: null, date: null, entries: [], totalEntries: 0 });
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDiary = useCallback(
    async (date) => {
      const payload = await dataService.fetchDiary({ date });
      setDiary(payload);
      if (payload?.date) {
        setSelectedDate(payload.date);
      }
    },
    [],
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        const datesResult = await dataService.fetchDiaryDates();
        const availableDates = datesResult?.dates || [];
        setDates(availableDates);

        const defaultDate = availableDates[0] || '';
        await loadDiary(defaultDate);
      } catch (error) {
        console.error('Error loading diary card:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [loadDiary]);

  useEffect(() => {
    if (!selectedDate) return;

    const interval = setInterval(() => {
      loadDiary(selectedDate);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedDate, loadDiary]);

  const handleDateChange = async (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    setLoading(true);
    await loadDiary(date);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-fuchsia-400" size={20} />
          <h2 className="text-xl font-semibold">Diary Feed</h2>
          <span className="text-xs text-slate-500">({diary.totalEntries || 0} entries)</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="text-slate-400" size={16} />
          <select
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
          >
            {dates.length === 0 ? (
              <option value="">No diary file</option>
            ) : (
              dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading diary entries...</p>
      ) : diary?.entries?.length ? (
        <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
          {diary.entries.map((entry, index) => (
            <div key={`${entry.time}-${index}`} className="bg-slate-900/60 rounded-xl p-3 border border-slate-700">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Clock size={12} />
                <span>{entry.time}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{entry.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">這一天目前還沒有 diary 記錄。</p>
      )}
    </div>
  );
};

export default DiaryCard;

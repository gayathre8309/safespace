import React, { useState, useMemo } from 'react';
import type { Mood, MoodEntry } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const moods: { mood: Mood; emoji: string; color: string }[] = [
  { mood: 'Happy', emoji: '😄', color: '#4ade80' },
  { mood: 'Okay', emoji: '🙂', color: '#60a5fa' },
  { mood: 'Sad', emoji: '😢', color: '#818cf8' },
  { mood: 'Angry', emoji: '😠', color: '#f87171' },
  { mood: 'Anxious', emoji: '😟', color: '#facc15' },
];

const getPast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const MoodTracker: React.FC = () => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
    // Mock some previous data
    { date: getPast7Days()[0], mood: 'Happy' },
    { date: getPast7Days()[1], mood: 'Okay' },
    { date: getPast7Days()[3], mood: 'Sad' },
    { date: getPast7Days()[4], mood: 'Happy' },
  ]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = moodHistory.find(entry => entry.date === todayStr);

  const handleMoodSelect = (mood: Mood) => {
    const newEntry: MoodEntry = { date: todayStr, mood };
    const updatedHistory = moodHistory.filter(entry => entry.date !== todayStr);
    setMoodHistory([...updatedHistory, newEntry]);
  };

  const chartData = useMemo(() => {
    const pastDays = getPast7Days();
    const moodValueMap: Record<Mood, number> = { 'Anxious': 1, 'Angry': 2, 'Sad': 3, 'Okay': 4, 'Happy': 5 };

    return pastDays.map(date => {
        const entry = moodHistory.find(h => h.date === date);
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        if (entry) {
            const moodConfig = moods.find(m => m.mood === entry.mood);
            return { name: day, mood: moodValueMap[entry.mood], color: moodConfig?.color || '#ccc' };
        }
        return { name: day, mood: 0, color: '#e5e7eb' };
    });
  }, [moodHistory]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-slate-800">How are you feeling today?</h2>
        <p className="mt-2 text-slate-500">Tracking your mood helps you understand your emotions better.</p>
        <div className="mt-6 flex justify-center space-x-2 sm:space-x-4">
          {moods.map(({ mood, emoji }) => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              className={`p-3 sm:p-4 rounded-full text-3xl sm:text-4xl transition-all duration-200 transform hover:scale-110 ${
                todayEntry?.mood === mood ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-100'
              }`}
              aria-label={`Select mood: ${mood}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {todayEntry && (
          <div className="mt-4 transition-opacity duration-500" key={todayEntry.mood}>
            {['Sad', 'Angry', 'Anxious'].includes(todayEntry.mood) ? (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center animate-fade-in">
                <p className="text-indigo-700">
                  It's brave to share how you feel. Remember, it's okay not to be okay.
                </p>
                <p className="mt-2 text-sm text-indigo-600">
                  Help is always available if you need to talk to someone. You are not alone.
                </p>
              </div>
            ) : (
              <p className="text-blue-600 font-semibold animate-fade-in">
                Thanks for sharing! It's great that you're feeling {todayEntry.mood.toLowerCase()} today.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Your Week in Moods</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                formatter={(value, name, props) => {
                    const moodConfig = moods.find(m => m.color === props.payload.color);
                    return [moodConfig ? moodConfig.mood : 'Not logged', 'Mood'];
                }}
              />
              <Bar dataKey="mood" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
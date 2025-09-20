
import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { FlaggedContent } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


const FlaggedContentCard: React.FC<{ content: FlaggedContent }> = ({ content }) => {
  const severityStyles = {
    High: 'border-red-500 bg-red-50',
    Medium: 'border-amber-500 bg-amber-50',
  };
  const severityText = {
    High: 'text-red-600',
    Medium: 'text-amber-600',
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${severityStyles[content.severity]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-slate-800">Source: {content.sourceApp}</p>
          <p className="text-slate-600 my-2 italic">"{content.text}"</p>
        </div>
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${severityStyles[content.severity]} ${severityText[content.severity]}`}>
          {content.severity.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-right">
        {new Date(content.timestamp).toLocaleString()}
      </p>
    </div>
  );
};

const FlaggedContentDashboard: React.FC = () => {
  const { flaggedContent, alertThreshold, setAlertThreshold } = useAuth();
  
  const filteredContent = flaggedContent.filter(content => 
    alertThreshold === 'High' ? content.severity === 'High' : true
  );

  const chartData = useMemo(() => {
    const weeks = ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'];
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    return weeks.map((weekLabel, index) => {
        const weekEnd = now - (index * oneWeek);
        const weekStart = weekEnd - oneWeek;
        
        const count = flaggedContent.filter(item => {
            const itemTime = item.timestamp;
            return itemTime > weekStart && itemTime <= weekEnd;
        }).length;

        return { name: weekLabel, incidents: count };
    }).reverse();
  }, [flaggedContent]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Flagged Content Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Review flagged messages from across apps and manage your alert settings.
        </p>
      </div>

       <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Weekly Summary</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Bar dataKey="incidents" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Alert Settings</h2>
        <div className="flex items-center space-x-4">
          <label className="text-slate-600">Notify me for:</label>
          <div className="flex bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setAlertThreshold('Medium')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                alertThreshold === 'Medium' ? 'bg-blue-500 text-white shadow' : 'text-slate-600'
              }`}
            >
              Medium & High Severity
            </button>
            <button
              onClick={() => setAlertThreshold('High')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                alertThreshold === 'High' ? 'bg-red-500 text-white shadow' : 'text-slate-600'
              }`}
            >
              High Severity Only
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Flagged Content Log</h2>
        {filteredContent.length > 0 ? (
          <div className="space-y-4">
            {filteredContent.map((content) => (
              <FlaggedContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-slate-500">No content to report based on your settings.</p>
            <p className="text-sm text-slate-400">Everything seems to be safe and sound!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlaggedContentDashboard;

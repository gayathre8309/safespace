
import React from 'react';

interface CircleCardProps {
  name: string;
  members: number;
  icon: string;
  bgColor: string;
}

const CircleCard: React.FC<CircleCardProps> = ({ name, members, icon, bgColor }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1 cursor-pointer">
      <div className={`p-4 rounded-full ${bgColor}`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-lg">{name}</h3>
        <p className="text-slate-500 text-sm">{members} members</p>
      </div>
      <div className="flex-grow text-right">
        <span className="text-blue-500 font-semibold">&rarr;</span>
      </div>
    </div>
  );
};

const SafeCircles: React.FC = () => {
  const circles = [
    { name: 'Family', members: 5, icon: '👨‍👩‍👧‍👦', bgColor: 'bg-green-100' },
    { name: 'Basketball Team', members: 12, icon: '🏀', bgColor: 'bg-orange-100' },
    { name: 'Class 7B', members: 25, icon: '📚', bgColor: 'bg-blue-100' },
    { name: 'Close Friends', members: 8, icon: '🌟', bgColor: 'bg-yellow-100' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Safe Circles</h1>
        <p className="mt-2 text-slate-500">
          Connect and chat securely with your trusted groups.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {circles.map((circle) => (
          <CircleCard key={circle.name} {...circle} />
        ))}
         <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-2xl flex items-center justify-center text-center text-slate-500 hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-colors">
            <div>
                <div className="text-4xl">+</div>
                <h3 className="font-bold mt-2">Create New Circle</h3>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SafeCircles;

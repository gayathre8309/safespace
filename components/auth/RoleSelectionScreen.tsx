
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import Logo from '../shared/Logo';

const RoleSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    // In a real app, this would be associated with the user's account.
    // For this demo, we'll use a placeholder email.
    const email = role === 'Child' ? 'newchild@example.com' : 'newparent@example.com';
    login(email, role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 text-center">
        <Logo />
        <h2 className="text-2xl font-bold text-slate-800">
          Choose Your Role
        </h2>
        <p className="text-slate-500">
          This helps us tailor your SafeSpace+ experience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <button
            onClick={() => handleRoleSelect('Child')}
            className="p-6 border-2 border-transparent bg-blue-50 rounded-lg text-left hover:border-blue-500 hover:bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="text-4xl mb-2">🧒</div>
            <h3 className="text-lg font-bold text-slate-800">Child / Teen</h3>
            <p className="text-sm text-slate-500">
              Chat with friends, track your mood, and stay safe.
            </p>
          </button>
          <button
            onClick={() => handleRoleSelect('Parent')}
            className="p-6 border-2 border-transparent bg-blue-50 rounded-lg text-left hover:border-blue-500 hover:bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="text-4xl mb-2">👨‍👩‍👧</div>
            <h3 className="text-lg font-bold text-slate-800">Parent / Guardian</h3>
            <p className="text-sm text-slate-500">
              Monitor for safety and get alerts when needed.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;


import React, { useState } from 'react';
import { analyzeMessage } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';
import type { HarmAnalysisResult } from '../../types';

const AnalysisResult: React.FC<{ result: HarmAnalysisResult, onLog: () => void, onDismiss: () => void }> = ({ result, onLog, onDismiss }) => {
    if (result.isHarmful) {
        return (
            <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
                <h3 className="font-bold text-amber-700">Analysis Result: Potentially Harmful</h3>
                <p className="text-slate-600 mt-2">Our AI suggests this message could be hurtful. Here's a kinder alternative:</p>
                <div className="mt-3 p-3 bg-slate-100 rounded">
                    <p className="text-slate-800 italic">"{result.suggestion}"</p>
                </div>
                <div className="mt-4 flex gap-4">
                    <button onClick={onLog} className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">
                        Log Incident for Parent
                    </button>
                    <button onClick={onDismiss} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">
                        Dismiss
                    </button>
                </div>
            </div>
        );
    }
    return (
         <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <h3 className="font-bold text-green-700">Analysis Result: Looks Okay!</h3>
            <p className="text-slate-600 mt-2">Our AI didn't detect any harmful content in this message. Thanks for checking and promoting a safe online space!</p>
             <button onClick={onDismiss} className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">
                Analyze Another
            </button>
        </div>
    );
};


const MonitoringScreen: React.FC = () => {
    const [textToAnalyze, setTextToAnalyze] = useState('');
    const [sourceApp, setSourceApp] = useState('WhatsApp');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<HarmAnalysisResult | null>(null);
    const [isLogged, setIsLogged] = useState(false);
    const { addFlaggedContent } = useAuth();
    
    const handleAnalyze = async () => {
        if (!textToAnalyze.trim()) return;
        setIsLoading(true);
        setAnalysisResult(null);
        setIsLogged(false);
        const result = await analyzeMessage(textToAnalyze);
        setAnalysisResult(result);
        setIsLoading(false);
    };

    const handleLogIncident = () => {
        if (!analysisResult || analysisResult.severity === 'Low') return;
        addFlaggedContent({
            text: textToAnalyze,
            sourceApp: sourceApp,
            severity: analysisResult.severity,
        });
        setIsLogged(true);
        setAnalysisResult(null);
        setTextToAnalyze('');
    };
    
    const handleDismiss = () => {
        setAnalysisResult(null);
        setTextToAnalyze('');
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Cross-App Monitor</h1>
                <p className="mt-2 text-slate-500">
                    Paste a message from any app to check if it's safe before you send, or to understand if something you received is harmful.
                </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="message-text" className="block text-sm font-medium text-slate-700">Message to Analyze</label>
                        <textarea
                            id="message-text"
                            rows={4}
                            value={textToAnalyze}
                            onChange={(e) => setTextToAnalyze(e.target.value)}
                            placeholder="Paste message text here..."
                            className="mt-1 w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="source-app" className="block text-sm font-medium text-slate-700">App Source</label>
                        <select
                            id="source-app"
                            value={sourceApp}
                            onChange={(e) => setSourceApp(e.target.value)}
                            className="mt-1 w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                             disabled={isLoading}
                        >
                            <option>WhatsApp</option>
                            <option>Instagram</option>
                            <option>Messenger</option>
                            <option>TikTok</option>
                            <option>Telegram</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !textToAnalyze.trim()}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 transition-colors"
                    >
                         {isLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : 'Analyze Text'}
                    </button>
                </div>
                
                {analysisResult && <AnalysisResult result={analysisResult} onLog={handleLogIncident} onDismiss={handleDismiss} />}
                
                {isLogged && (
                    <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in text-center">
                        <h3 className="font-bold text-blue-700">Incident Logged</h3>
                        <p className="text-slate-600 mt-2">Thank you for your courage in reporting this. Your parent/guardian has been notified.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitoringScreen;

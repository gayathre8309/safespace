
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, HarmAnalysisResult } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeMessage } from '../../services/geminiService';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
        {!isCurrentUser && <p className="text-xs font-bold text-blue-700 mb-1">{message.senderName}</p>}
        <p>{message.text}</p>
        <p className="text-xs mt-1 text-right opacity-75">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
};

interface AnalysisModalProps {
    result: HarmAnalysisResult;
    originalMessage: string;
    onSend: () => void;
    onEdit: () => void;
    onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ result, onSend, onEdit, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-amber-600">Hold on a second...</h3>
                <p className="text-slate-600 mt-2">Your message might be hurtful. Here's a kinder way to say it:</p>
                <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                    <p className="text-slate-800 font-medium">"{result.suggestion}"</p>
                </div>
                <p className="text-sm text-slate-500 mt-4">Remember, kind words make conversations better for everyone.</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onSend} className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">Send Anyway</button>
                    <button onClick={onEdit} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">Edit Message</button>
                </div>
                 <button onClick={onClose} className="w-full text-center mt-3 text-sm text-slate-500 hover:underline">Cancel</button>
            </div>
        </div>
    );
};


const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'friend1', senderName: 'Sarah', text: 'Hey, how are you doing today?', timestamp: Date.now() - 60000 },
    { id: '2', senderId: 'child123', senderName: 'Alex', text: 'I am good, thanks for asking! Just finished my homework.', timestamp: Date.now() - 30000 },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<HarmAnalysisResult | null>(null);
  
  // FIX: Use `addFlaggedContent` from useAuth context instead of non-existent `addAlert`.
  const { user, addFlaggedContent, alertThreshold } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback((messageText: string) => {
    if (!messageText.trim() || !user) return;
    const newMessage: Message = {
      id: String(Date.now()),
      senderId: user.id,
      senderName: user.name,
      text: messageText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user) return;
    
    setIsLoading(true);
    const result = await analyzeMessage(inputText);
    setIsLoading(false);

    if (result.isHarmful) {
      setAnalysisResult(result);
      if (result.severity === 'High' || (result.severity === 'Medium' && alertThreshold === 'Medium')) {
          // FIX: Call `addFlaggedContent` with the correct payload structure.
          addFlaggedContent({
            text: inputText,
            sourceApp: 'In-App Chat',
            severity: result.severity,
          });
      }
    } else {
      sendMessage(inputText);
    }
  };

  const handleModalSend = () => {
    sendMessage(inputText);
    setAnalysisResult(null);
  };
  
  const handleModalEdit = () => {
    setAnalysisResult(null);
    // The input field already has the text, so the user can just edit it.
  };

  const handleModalClose = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-grow p-6 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type a message..."
            className="w-full px-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText}
            className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {analysisResult && (
        <AnalysisModal 
            result={analysisResult} 
            originalMessage={inputText}
            onSend={handleModalSend}
            onEdit={handleModalEdit}
            onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default ChatScreen;

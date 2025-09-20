
export type UserRole = 'Child' | 'Parent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface FlaggedContent {
  id: string;
  text: string;
  sourceApp: string;
  severity: 'Medium' | 'High';
  timestamp: number;
}

export type SeverityThreshold = 'Medium' | 'High';

export type Mood = 'Happy' | 'Okay' | 'Sad' | 'Angry' | 'Anxious';

export interface MoodEntry {
    date: string; // YYYY-MM-DD
    mood: Mood;
}

export interface HarmAnalysisResult {
    isHarmful: boolean;
    severity: 'Low' | 'Medium' | 'High';
    suggestion: string;
}

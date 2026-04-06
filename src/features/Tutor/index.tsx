import React from 'react';
import { useTutor } from './hooks/useTutor';
import { AnalysisSheet } from './components/AnalysisSheet';

export interface TutorFeatureProps {
  apiKey: string;
  onAnalysisStateChange?: (isAnalyzing: boolean) => void;
}

// We'll export the component but most interaction will still be via useTutor hook
// or direct component usage in MainScreen as per the existing layout.
export { useTutor, AnalysisSheet };

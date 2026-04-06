import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { GeminiService } from '../../../services/gemini';

export const useTutor = (apiKey: string) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const gemini = useMemo(() => {
    try {
      return new GeminiService(apiKey);
    } catch (e) {
      console.error('Gemini init error:', e);
      return null;
    }
  }, [apiKey]);

  const analyze = useCallback(async (images: string[]) => {
    if (images.length === 0) {
      Alert.alert("Missing Content", "Please provide at least one image to analyze.");
      return;
    }

    if (!gemini) {
      Alert.alert("API Key Required", "Gemini API key is missing or invalid.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setShowAnalysis(true);

    try {
      const result = await gemini.analyzeExercise(images);
      setAnalysis(result);
    } catch (error: any) {
      Alert.alert("Analysis Error", error.message || "Failed to analyze.");
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [gemini]);

  const closeAnalysis = useCallback(() => {
    setShowAnalysis(false);
  }, []);

  return {
    analysis,
    isAnalyzing,
    showAnalysis,
    analyze,
    closeAnalysis,
    setAnalysis,
    setShowAnalysis,
    hasGemini: !!gemini,
  };
};

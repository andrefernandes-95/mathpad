import React, { useState, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import MathCanvas, { CanvasHandle } from '../components/Canvas';
import { ExercisePanel } from '../components/ExercisePanel';
import { CanvasToolbar } from '../components/CanvasToolbar';
import { GeminiService } from '../services/gemini';
import { Brain, Eraser, Undo2, ChevronUp, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

// In a real app, this would be in an environment variable or secure storage
const TEMP_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

export const MainScreen = () => {
  const [exerciseBase64, setExerciseBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Canvas State
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  
  const canvasRef = useRef<CanvasHandle>(null);
  
  const gemini = useMemo(() => {
    try {
      return new GeminiService(TEMP_API_KEY);
    } catch (e) {
      return null;
    }
  }, []);

  const handleAnalyze = async () => {
    if (!exerciseBase64) {
      Alert.alert("Missing Exercise", "Please take a photo or select an exercise first.");
      return;
    }

    if (!gemini) {
      Alert.alert("API Key Required", "Please set your Gemini API Key in src/screens/MainScreen.tsx");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setShowAnalysis(true);

    try {
      const workBase64 = await canvasRef.current?.getBase64();
      const images = [exerciseBase64];
      if (workBase64) {
        images.push(workBase64);
      }

      const result = await gemini.analyzeExercise(images);
      setAnalysis(result);
    } catch (error: any) {
      Alert.alert("Analysis Error", error.message || "Failed to analyze the exercise.");
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.logoRow}>
            <Text style={styles.title}>MathPad</Text>
            <Sparkles color="#6366f1" size={16} style={styles.sparkle} />
          </View>
          <Text style={styles.subtitle}>Intelligent Math Tutor</Text>
        </View>
        <TouchableOpacity 
          style={[styles.analyzeButton, (isAnalyzing || !exerciseBase64 || !gemini) && styles.disabledButton]} 
          onPress={handleAnalyze}
          disabled={isAnalyzing || !exerciseBase64 || !gemini}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Brain color="#fff" size={18} />
              <Text style={styles.analyzeButtonText}>Analyze</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* API Key Warning Banner */}
      {!gemini && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Gemini API Key missing in <Text style={styles.codeText}>src/screens/MainScreen.tsx</Text>
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Exercise Selection Area */}
        <ExercisePanel 
          selectedImage={exerciseBase64} 
          onImageSelected={setExerciseBase64} 
        />

        {/* Workspace Label */}
        <View style={styles.workspaceHeader}>
          <Text style={styles.label}>Your Workspace</Text>
          <View style={styles.canvasActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => canvasRef.current?.undo()}>
              <Undo2 color="#64748b" size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={() => canvasRef.current?.clear()}>
              <Eraser color="#ef4444" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toolbar */}
        <CanvasToolbar 
          color={strokeColor}
          strokeWidth={strokeWidth}
          onColorChange={setStrokeColor}
          onWidthChange={setStrokeWidth}
          onUndo={() => canvasRef.current?.undo()}
          onClear={() => canvasRef.current?.clear()}
        />

        {/* Drawing Canvas */}
        <View style={styles.canvasContainer}>
          <MathCanvas 
            ref={canvasRef} 
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        </View>

        {/* Spacer for bottom sheet */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Analysis Bottom Sheet (Refined) */}
      {showAnalysis && (
        <View style={[styles.analysisSheet, analysis ? styles.sheetExpanded : styles.sheetCompact]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Tutor Analysis</Text>
            <TouchableOpacity onPress={() => setShowAnalysis(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.analysisContent} showsVerticalScrollIndicator={false}>
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#6366f1" size="large" />
                <Text style={styles.loadingText}>Gemini is studying your work...</Text>
              </View>
            ) : (
              <Markdown style={markdownStyles}>
                {analysis}
              </Markdown>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const markdownStyles: any = {
  body: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  heading1: {
    color: '#1e293b',
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  heading2: {
    color: '#1e293b',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5,
  },
  strong: {
    fontWeight: '700',
    color: '#0f172a',
  },
  em: {
    fontStyle: 'italic',
  },
  paragraph: {
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 5,
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
  hr: {
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background for a modern feel
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sparkle: {
    marginTop: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: -2,
  },
  analyzeButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  canvasActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearButton: {
    borderColor: '#fee2e2',
  },
  canvasContainer: {
    height: 450,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  analysisSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -15 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetCompact: {
    height: 250,
  },
  sheetExpanded: {
    height: '75%',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  closeText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 14,
  },
  analysisContent: {
    flex: 1,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontWeight: '600',
    fontSize: 15,
  },
  warningBanner: {
    backgroundColor: '#fff7ed',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffedd5',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#9a3412',
    fontWeight: '600',
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#c2410c',
  },
});

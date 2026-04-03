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
import { Brain, Eraser, Undo2, ChevronUp, ChevronDown, CheckCircle2, Sparkles, X } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

// In a real app, this would be in an environment variable or secure storage
const TEMP_API_KEY = "AIzaSyAC4SuM9UbPTpz9jg4Dyvh_UFNpVnR-gEA";

type Tab = 'exercise' | 'workspace';

export const MainScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('workspace');
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
      setActiveTab('exercise');
      return;
    }

    if (!gemini) {
      Alert.alert("API Key Required", "Please set your Gemini API Key.");
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
      <StatusBar barStyle="light-content" />

      {/* Tabs at the Top */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'exercise' && styles.activeTab]}
          onPress={() => setActiveTab('exercise')}
        >
          <Text style={[styles.tabText, activeTab === 'exercise' && styles.activeTabText]}>EXERCISE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'workspace' && styles.activeTab]}
          onPress={() => setActiveTab('workspace')}
        >
          <Text style={[styles.tabText, activeTab === 'workspace' && styles.activeTabText]}>WORKSPACE</Text>
        </TouchableOpacity>
      </View>

      {/* API Key Warning */}
      {!gemini && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ API Key missing in MainScreen.tsx</Text>
        </View>
      )}

      <View style={styles.content}>
        {activeTab === 'exercise' ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Exercise Problem</Text>
              </View>
              <ExercisePanel
                selectedImage={exerciseBase64}
                onImageSelected={setExerciseBase64}
              />
            </View>
            <View style={styles.vistaHint}>
              <Text style={styles.hintText}>Upload a problem then switch to Workspace to solve it.</Text>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.workspaceWrapper}>
            <View style={styles.glassToolbar}>
              <View style={styles.handwritingHeader}>
                <View style={styles.handwritingTitleWrapper}>
                  <Text style={styles.handwritingTitle}>HANDWRITING PAD</Text>
                  <Sparkles size={14} color="#0369a1" style={{ marginLeft: 5 }} />
                </View>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.analyzeSmallButton, (isAnalyzing || !exerciseBase64 || !gemini) && styles.disabledButton]} 
                    onPress={handleAnalyze}
                    disabled={isAnalyzing || !exerciseBase64 || !gemini}
                  >
                    <View style={styles.glossyOverlayInner} />
                    {isAnalyzing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Brain color="#fff" size={16} />
                        <Text style={styles.analyzeSmallText}>ANALYZE</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.toolIconBtn} onPress={() => canvasRef.current?.undo()}>
                    <Undo2 color="#334155" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.toolIconBtn, styles.clearBtn]} onPress={() => canvasRef.current?.clear()}>
                    <Eraser color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>

              <CanvasToolbar
                color={strokeColor}
                strokeWidth={strokeWidth}
                onColorChange={setStrokeColor}
                onWidthChange={setStrokeWidth}
                onUndo={() => canvasRef.current?.undo()}
                onClear={() => canvasRef.current?.clear()}
              />
            </View>

            <View style={styles.canvasContainer}>
              <MathCanvas
                ref={canvasRef}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
              />
            </View>
          </View>
        )}
      </View>

      {/* Vista Style Analysis Bottom Sheet */}
      {showAnalysis && (
        <View style={[styles.analysisSheet, analysis ? styles.sheetExpanded : styles.sheetCompact]}>
          <View style={styles.glossyOverlay} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Tutor Analysis</Text>
            <TouchableOpacity onPress={() => setShowAnalysis(false)} style={styles.closeBtn}>
              <X color="#fff" size={16} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.analysisContent} showsVerticalScrollIndicator={false}>
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#0ea5e9" size="large" />
                <Text style={styles.loadingText}>Synthesizing through Vista Brain...</Text>
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
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  heading1: {
    color: '#0369a1',
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  heading2: {
    color: '#075985',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5,
  },
  strong: {
    fontWeight: '700',
    color: '#0f172a',
  },
  paragraph: {
    marginBottom: 8,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002a4e', // Deep Vista Blue
  },
  glossyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 1,
  },
  glossyOverlayInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    backgroundColor: '#002a4e', // Deep Vista Blue
    paddingTop: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginRight: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 0,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 0,
    zIndex: 2, // Ensure it covers the top border of the content area
  },
  tabText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#bae6fd',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#002a4e',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginHorizontal: 10,
    marginTop: -1, // Pull up to meet the tabs
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  workspaceWrapper: {
    flex: 1,
    padding: 10,
  },
  glassToolbar: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  handwritingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'nowrap',
    gap: 8,
  },
  handwritingTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow text to shrink if screen is tiny
  },
  handwritingTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#002a4e',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0284c7',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  analyzeSmallText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  toolIconBtn: {
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  clearBtn: {
    borderColor: '#fca5a5',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  scrollContent: {
    padding: 15,
  },
  glassCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vistaHint: {
    marginTop: 20,
    alignItems: 'center',
  },
  hintText: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  analysisSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    overflow: 'hidden',
  },
  sheetCompact: {
    height: 250,
  },
  sheetExpanded: {
    height: '75%',
  },
  sheetHeader: {
    height: 50,
    backgroundColor: '#0369a1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -20,
  },
  sheetTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  analysisContent: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#0ea5e9',
    fontWeight: '700',
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    padding: 6,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '700',
  },
});

import React, { useState, useRef } from 'react';
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
import { Brain, Eraser, Undo2, Sparkles } from 'lucide-react-native';

import MathCanvas, { CanvasHandle } from '../features/Canvas';
import ExerciseFeature from '../features/Exercise';
import { useTutor, AnalysisSheet } from '../features/Tutor';
import { CanvasToolbar } from '../components/CanvasToolbar';
import { CONFIG } from '../config';

type Tab = 'exercise' | 'workspace';

export const MainScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('workspace');
  const [exerciseBase64, setInternalExerciseBase64] = useState<string | null>(null);

  const setExerciseBase64 = (val: string | null) => {
    console.log('MainScreen: setExerciseBase64 called, size:', val?.length || 0);
    setInternalExerciseBase64(val);
  };

  // Feature Hooks
  const {
    analysis,
    isAnalyzing,
    showAnalysis,
    analyze,
    closeAnalysis,
    hasGemini
  } = useTutor(CONFIG.GEMINI_API_KEY);

  // Canvas State
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const canvasRef = useRef<CanvasHandle>(null);

  const handleAnalyze = async () => {
    if (!exerciseBase64) {
      Alert.alert("Missing Exercise", "Please take a photo or select an exercise first.");
      setActiveTab('exercise');
      return;
    }

    const workBase64 = await canvasRef.current?.getBase64();
    const images = [exerciseBase64];
    if (workBase64) {
      images.push(workBase64);
    }

    await analyze(images);
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
      {!hasGemini && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ API Key missing or invalid in config.ts</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Persistent Exercise Tab */}
        <View style={[styles.tabContent, activeTab !== 'exercise' && styles.hidden]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Exercise Problem</Text>
              </View>
              <ExerciseFeature
                selectedImage={exerciseBase64}
                onImageSelected={setExerciseBase64}
              />
            </View>
            <View style={styles.vistaHint}>
              <Text style={styles.hintText}>Upload a problem then switch to Workspace to solve it.</Text>
            </View>
          </ScrollView>
        </View>

        {/* Persistent Workspace Tab */}
        <View style={[styles.tabContent, activeTab !== 'workspace' && styles.hidden]}>
          <View style={styles.workspaceWrapper}>
            <View style={styles.glassToolbar}>
              <View style={styles.handwritingHeader}>
                <View style={styles.handwritingTitleWrapper}>
                  <Text style={styles.handwritingTitle}>HANDWRITING PAD</Text>
                  <Sparkles size={14} color="#0369a1" style={{ marginLeft: 5 }} />
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.analyzeSmallButton, (isAnalyzing || !exerciseBase64 || !hasGemini) && styles.disabledButton]}
                    onPress={handleAnalyze}
                    disabled={isAnalyzing || !exerciseBase64 || !hasGemini}
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
        </View>
      </View>

      {/* Analysis Bottom Sheet */}
      <AnalysisSheet
        showAnalysis={showAnalysis}
        isAnalyzing={isAnalyzing}
        analysis={analysis}
        onClose={closeAnalysis}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002a4e', // Deep Vista Blue
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
    backgroundColor: '#002a4e',
    paddingTop: 30,
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
    zIndex: 2,
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
    marginTop: -1,
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
    flexShrink: 1,
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
    marginBottom: 40,
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
  tabContent: {
    flex: 1,
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
});


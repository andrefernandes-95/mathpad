import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { X } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

interface AnalysisSheetProps {
  showAnalysis: boolean;
  isAnalyzing: boolean;
  analysis: string | null;
  onClose: () => void;
}

export const AnalysisSheet: React.FC<AnalysisSheetProps> = ({ 
  showAnalysis, 
  isAnalyzing, 
  analysis, 
  onClose 
}) => {
  if (!showAnalysis) return null;

  return (
    <View style={[styles.analysisSheet, analysis ? styles.sheetExpanded : styles.sheetCompact]}>
      <View style={styles.glossyOverlay} />
      <View style={styles.sheetHeader}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Tutor Analysis</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
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
    zIndex: 100,
  },
  sheetCompact: {
    height: 250,
  },
  sheetExpanded: {
    height: '75%',
  },
  glossyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
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
});

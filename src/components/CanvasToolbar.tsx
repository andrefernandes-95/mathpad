import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Pencil, Eraser } from 'lucide-react-native';

interface Props {
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const COLORS = [
  { id: 'black', hex: '#000000' },
  { id: 'vista_blue', hex: '#002a4e' },
  { id: 'vista_cyan', hex: '#0ea5e9' },
  { id: 'vista_green', hex: '#16a34a' },
  { id: 'vista_red', hex: '#dc2626' },
];

const WIDTHS = [2, 4, 8, 12];

export const CanvasToolbar: React.FC<Props> = ({
  color,
  strokeWidth,
  onColorChange,
  onWidthChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.glossyOverlay} />
      <View style={styles.section}>
        <Text style={styles.label}>Ink Color</Text>
        <View style={styles.row}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.colorButton,
                { backgroundColor: c.hex },
                color === c.hex && styles.activeColor,
              ]}
              onPress={() => onColorChange(c.hex)}
            >
              <View style={styles.glossyOverlayInner} />
            </TouchableOpacity>
          ))}
          <View style={styles.toolDivider} />
          <TouchableOpacity
            style={[
              styles.toolButton,
              color === '#ffffff' && styles.activeTool,
            ]}
            onPress={() => onColorChange('#ffffff')}
          >
             <View style={styles.glossyOverlayInner} />
            <Eraser size={18} color={color === '#ffffff' ? '#0ea5e9' : '#475569'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.label}>Pen Size</Text>
        <View style={styles.row}>
           {WIDTHS.map((w) => (
            <TouchableOpacity
              key={w}
              style={[
                styles.sizeButton,
                strokeWidth === w && styles.activeSize,
              ]}
              onPress={() => onWidthChange(w)}
            >
              <View style={styles.glossyOverlayInner} />
              <View style={[styles.sizeDot, { width: w + 2, height: w + 2, borderRadius: (w + 2) / 2 }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Aero Glass effect
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  glossyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  glossyOverlayInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 2,
  },
  section: {
    gap: 4,
    zIndex: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorButton: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  activeColor: {
    borderColor: '#0ea5e9',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  toolButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  activeTool: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  toolDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 2,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sizeButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  activeSize: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  sizeDot: {
    backgroundColor: '#334155',
  },
});

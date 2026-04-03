import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Pencil, Eraser, Minus, Plus } from 'lucide-react-native';

interface Props {
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const COLORS = [
  { id: 'black', hex: '#0f172a' },
  { id: 'blue', hex: '#2563eb' },
  { id: 'red', hex: '#dc2626' },
  { id: 'green', hex: '#16a34a' },
];

const WIDTHS = [2, 4, 6, 8];

export const CanvasToolbar: React.FC<Props> = ({
  color,
  strokeWidth,
  onColorChange,
  onWidthChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Colors</Text>
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
            />
          ))}
          <TouchableOpacity
            style={[
              styles.toolButton,
              color === 'eraser' && styles.activeTool,
            ]}
            onPress={() => onColorChange('#ffffff')} // Eraser is just white for now
          >
            <Eraser size={18} color={color === '#ffffff' ? '#6366f1' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.label}>Size</Text>
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    // Shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColor: {
    borderColor: '#6366f1',
    transform: [{ scale: 1.1 }],
  },
  toolButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  activeTool: {
    backgroundColor: '#eef2ff',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#f1f5f9',
  },
  sizeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  activeSize: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  sizeDot: {
    backgroundColor: '#334155',
  },
});

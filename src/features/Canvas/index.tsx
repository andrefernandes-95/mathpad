import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useCanvasState } from './hooks/useCanvasState';
import { useCanvasGestures } from './hooks/useCanvasGestures';
import { DrawingArea } from './components/DrawingArea';
import { CanvasProps, CanvasHandle } from './types';
import { styles } from './styles';
import { INITIAL_SIZE } from './constants';

const MathCanvas = forwardRef<CanvasHandle, CanvasProps>(({
  strokeColor = '#0f172a',
  strokeWidth = 4
}, ref) => {
  const {
    paths,
    currentPoints,
    canvasWidth,
    canvasHeight,
    colorShared,
    widthShared,
    canvasRef,
    addStroke,
    eraseStrokeAt,
    clear,
    undo,
    checkBoundaries,
  } = useCanvasState(strokeColor, strokeWidth);

  // Update shared values when props change
  useEffect(() => {
    colorShared.value = strokeColor;
    widthShared.value = strokeWidth;
  }, [strokeColor, strokeWidth, colorShared, widthShared]);

  const panGesture = useCanvasGestures({
    colorShared,
    widthShared,
    currentPoints,
    checkBoundaries,
    eraseStrokeAt,
    addStroke,
  });

  const canvasStyle = useAnimatedStyle(() => ({
    width: canvasWidth.value,
    height: canvasHeight.value,
  }));

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    clear,
    undo,
    getBase64: async () => {
      if (!canvasRef.current) return undefined;
      const image = canvasRef.current.makeImageSnapshot();
      if (image) {
        return image.encodeToBase64();
      }
      return undefined;
    },
  }));

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        style={styles.horizontalScroll} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsHorizontalScrollIndicator={true}
      >
        <ScrollView 
          style={styles.verticalScroll} 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
        >
          <DrawingArea
            canvasRef={canvasRef}
            canvasStyle={canvasStyle}
            panGesture={panGesture}
            paths={paths}
            currentPoints={currentPoints}
            colorShared={colorShared}
            widthShared={widthShared}
          />
        </ScrollView>
      </ScrollView>
    </View>
  );
});

export default MathCanvas;
export * from './types';

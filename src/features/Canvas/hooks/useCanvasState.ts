import { useState, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useCanvasRef } from '@shopify/react-native-skia';
import { INITIAL_SIZE, EXPANSION_STEP, BOUNDARY_THRESHOLD, ERASER_WIDTH_MULTIPLIER } from '../constants';
import { Stroke } from '../types';

export const useCanvasState = (initialColor: string, initialWidth: number) => {
  const [paths, setPaths] = useState<Stroke[]>([]);

  // Dynamic Canvas Dimensions
  const canvasWidth = useSharedValue(INITIAL_SIZE);
  const canvasHeight = useSharedValue(INITIAL_SIZE);

  const currentPoints = useSharedValue<{ x: number; y: number }[]>([]);
  const colorShared = useSharedValue(initialColor);
  const widthShared = useSharedValue(initialWidth);
  const canvasRef = useCanvasRef();

  const addStroke = useCallback((stroke: Stroke) => {
    setPaths((prev) => [...prev, stroke]);
  }, []);

  const eraseStrokeAt = useCallback((x: number, y: number) => {
    setPaths((prev) => {
      const filtered = prev.filter((p) => {
        const hitPath = p.path.copy();
        const outlinedPath = hitPath.stroke({ width: p.width + ERASER_WIDTH_MULTIPLIER });
        if (!outlinedPath) return true;
        const isHit = outlinedPath.contains(x, y);
        return !isHit;
      });
      return filtered;
    });
  }, []);

  const clear = useCallback(() => {
    setPaths([]);
    currentPoints.value = [];
    canvasWidth.value = INITIAL_SIZE;
    canvasHeight.value = INITIAL_SIZE;
  }, [currentPoints, canvasWidth, canvasHeight]);

  const undo = useCallback(() => {
    setPaths((prev) => prev.slice(0, -1));
  }, []);

  const checkBoundaries = useCallback((x: number, y: number) => {
    'worklet';
    // Expand Width
    if (x > canvasWidth.value - BOUNDARY_THRESHOLD) {
      canvasWidth.value += EXPANSION_STEP;
    }
    // Expand Height
    if (y > canvasHeight.value - BOUNDARY_THRESHOLD) {
      canvasHeight.value += EXPANSION_STEP;
    }
  }, [canvasWidth, canvasHeight]);

  return {
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
  };
};

import React from 'react';
import { View } from 'react-native';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { StrokeRenderer } from './StrokeRenderer';
import { CurrentStroke } from './CurrentStroke';
import { Stroke } from '../types';

interface DrawingAreaProps {
  canvasRef: any;
  canvasStyle: any;
  panGesture: any;
  paths: Stroke[];
  currentPoints: { value: { x: number; y: number }[] };
  colorShared: { value: string };
  widthShared: { value: number };
}

export const DrawingArea: React.FC<DrawingAreaProps> = ({
  canvasRef,
  canvasStyle,
  panGesture,
  paths,
  currentPoints,
  colorShared,
  widthShared,
}) => {
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[canvasStyle, { touchAction: 'none' } as any]}>
        <Canvas ref={canvasRef} style={{ flex: 1 }}>
          <StrokeRenderer paths={paths} />
          <CurrentStroke 
            currentPoints={currentPoints} 
            colorShared={colorShared} 
            widthShared={widthShared}
          />
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

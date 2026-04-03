import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  SkPath,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue, runOnJS } from 'react-native-reanimated';

interface Stroke {
  path: SkPath;
  color: string;
  width: number;
}

export interface CanvasHandle {
  clear: () => void;
  undo: () => void;
  getBase64: () => Promise<string | undefined>;
}

interface Props {
  strokeColor?: string;
  strokeWidth?: number;
}

const MathCanvas = forwardRef<CanvasHandle, Props>(({
  strokeColor = '#0f172a',
  strokeWidth = 4
}, ref) => {
  const [paths, setPaths] = useState<Stroke[]>([]);
  const currentPath = useSharedValue<SkPath | null>(null);
  const colorShared = useSharedValue(strokeColor);
  const widthShared = useSharedValue(strokeWidth);
  const canvasRef = useCanvasRef();

  // Update shared values when props change
  React.useEffect(() => {
    colorShared.value = strokeColor;
    widthShared.value = strokeWidth;
  }, [strokeColor, strokeWidth]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    clear: () => {
      setPaths([]);
      currentPath.value = null;
    },
    undo: () => {
      setPaths((prev) => prev.slice(0, -1));
    },
    getBase64: async () => {
      if (!canvasRef.current) return undefined;
      const image = canvasRef.current.makeImageSnapshot();
      if (image) {
        return image.encodeToBase64();
      }
      return undefined;
    },
  }));

  const ticker = useSharedValue(0);

  const addPath = (path: SkPath, color: string, width: number) => {
    setPaths((prev) => [...prev, { path, color, width }]);
  };

  const panGesture = Gesture.Pan()
    .onStart((g) => {
      console.log('Pan started at:', g.x, g.y);
      const path = Skia.Path.Make();
      path.moveTo(g.x, g.y);
      currentPath.value = path;
      ticker.value += 1;
    })
    .onUpdate((g) => {
      if (currentPath.value) {
        currentPath.value.lineTo(g.x, g.y);
        ticker.value += 1;
      }
    })
    .onEnd(() => {
      console.log('Pan ended');
      if (currentPath.value) {
        // Need to copy the path before pushing to history to prevent future mutations
        const finalPath = currentPath.value.copy();
        runOnJS(addPath)(finalPath, colorShared.value, widthShared.value);
        currentPath.value = null;
        ticker.value += 1;
      }
    })
    .minDistance(0)
    .activeCursor('crosshair');

  return (
    <View style={[styles.container, { touchAction: 'none' } as any]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {/* Render past strokes */}
            {paths.map((p, index) => (
              <Path
                key={index}
                path={p.path}
                color={p.color}
                style="stroke"
                strokeWidth={p.width}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
            {/* Render current stroke */}
            <CurrentStroke 
              currentPath={currentPath} 
              colorShared={colorShared} 
              widthShared={widthShared}
              ticker={ticker} 
            />
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
});

// Optimization: separate component to isolate shared value updates
const CurrentStroke = ({ currentPath, colorShared, widthShared, ticker }: any) => {
  const path = useDerivedValue(() => {
    // Accessing ticker.value makes this derived value depend on it
    const _ = ticker.value;
    return currentPath.value || Skia.Path.Make();
  });
  const color = useDerivedValue(() => colorShared.value);
  const width = useDerivedValue(() => widthShared.value);

  return (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeWidth={width}
      strokeCap="round"
      strokeJoin="round"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default MathCanvas;

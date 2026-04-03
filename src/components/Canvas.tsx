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
  
  // We use a points array for the current stroke to ensure absolute reactivity.
  // Mutating SkPath objects in place sometimes fails to trigger re-renders on Web.
  const currentPoints = useSharedValue<{ x: number; y: number }[]>([]);
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
      currentPoints.value = [];
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

  const addPath = (path: SkPath, color: string, width: number) => {
    setPaths((prev) => [...prev, { path, color, width }]);
  };

  const erasePathAt = (x: number, y: number) => {
    setPaths((prev) => {
      const filtered = prev.filter((p) => {
        const hitPath = p.path.copy();
        const outlinedPath = hitPath.stroke({ width: p.width + 15 });
        if (!outlinedPath) return true;
        const isHit = outlinedPath.contains(x, y);
        return !isHit;
      });
      return filtered;
    });
  };

  const panGesture = Gesture.Pan()
    .onStart((g) => {
      if (colorShared.value === '#ffffff') {
        runOnJS(erasePathAt)(g.x, g.y);
      } else {
        currentPoints.value = [{ x: g.x, y: g.y }];
      }
    })
    .onUpdate((g) => {
      if (colorShared.value === '#ffffff') {
        runOnJS(erasePathAt)(g.x, g.y);
      } else {
        currentPoints.value = [...currentPoints.value, { x: g.x, y: g.y }];
      }
    })
    .onEnd(() => {
      console.log('Pan ended');
      if (colorShared.value !== '#ffffff' && currentPoints.value.length > 1) {
        const path = Skia.Path.Make();
        path.moveTo(currentPoints.value[0].x, currentPoints.value[0].y);
        for (let i = 1; i < currentPoints.value.length; i++) {
          path.lineTo(currentPoints.value[i].x, currentPoints.value[i].y);
        }
        runOnJS(addPath)(path, colorShared.value, widthShared.value);
      }
      currentPoints.value = [];
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
              currentPoints={currentPoints} 
              colorShared={colorShared} 
              widthShared={widthShared}
            />
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
});

// Optimization: separate component to isolate shared value updates
const CurrentStroke = ({ currentPoints, colorShared, widthShared }: any) => {
  const path = useDerivedValue(() => {
    const points = currentPoints.value;
    if (points.length < 2) return Skia.Path.Make();
    
    const p = Skia.Path.Make();
    p.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      p.lineTo(points[i].x, points[i].y);
    }
    return p;
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

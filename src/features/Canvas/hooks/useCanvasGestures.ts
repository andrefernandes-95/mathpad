import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, withTiming } from 'react-native-reanimated';
import { Skia } from '@shopify/react-native-skia';
import { Stroke } from '../types';

interface GestureOptions {
  colorShared: { value: string };
  widthShared: { value: number };
  currentPoints: { value: { x: number; y: number }[] };
  currentOpacity: { value: number };
  checkBoundaries: (x: number, y: number) => void;
  eraseStrokeAt: (x: number, y: number) => void;
  addStroke: (stroke: Stroke) => void;
}

export const useCanvasGestures = ({
  colorShared,
  widthShared,
  currentPoints,
  currentOpacity,
  checkBoundaries,
  eraseStrokeAt,
  addStroke,
}: GestureOptions) => {
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart((g) => {
      currentOpacity.value = 1;
      if (colorShared.value === '#ffffff') {
        runOnJS(eraseStrokeAt)(g.x, g.y);
      } else {
        currentPoints.value = [{ x: g.x, y: g.y }];
      }
    })
    .onUpdate((g) => {
      checkBoundaries(g.x, g.y);
      if (colorShared.value === '#ffffff') {
        runOnJS(eraseStrokeAt)(g.x, g.y);
      } else {
        currentPoints.value = [...currentPoints.value, { x: g.x, y: g.y }];
      }
    })
    .onEnd(() => {
      if (colorShared.value !== '#ffffff' && currentPoints.value.length > 1) {
        const path = Skia.Path.Make();
        path.moveTo(currentPoints.value[0].x, currentPoints.value[0].y);
        for (let i = 1; i < currentPoints.value.length; i++) {
          path.lineTo(currentPoints.value[i].x, currentPoints.value[i].y);
        }
        runOnJS(addStroke)({
          path,
          color: colorShared.value,
          width: widthShared.value,
        });

        currentOpacity.value = withTiming(0, { duration: 150 }, (finished) => {
          if (finished) {
            currentPoints.value = [];
            currentOpacity.value = 1;
          }
        });
      } else {
        currentPoints.value = [];
        currentOpacity.value = 1;
      }
    })
    .minDistance(0)
    .activeOffsetX([-1, 1])
    .activeOffsetY([-1, 1])
    .activeCursor('crosshair');

  return panGesture;
};

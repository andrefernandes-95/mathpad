import React from 'react';
import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

interface CurrentStrokeProps {
  currentPoints: { value: { x: number; y: number }[] };
  currentOpacity: { value: number };
  colorShared: { value: string };
  widthShared: { value: number };
}

export const CurrentStroke: React.FC<CurrentStrokeProps> = ({ currentPoints, currentOpacity, colorShared, widthShared }) => {
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
  const opacity = useDerivedValue(() => currentOpacity.value);


  return (
    <Path
      path={path}
      color={color}
      opacity={opacity}
      style="stroke"
      strokeWidth={width}
      strokeCap="round"
      strokeJoin="round"
    />
  );
};

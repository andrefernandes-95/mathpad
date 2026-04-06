import React from 'react';
import { Path } from '@shopify/react-native-skia';
import { Stroke } from '../types';

interface StrokeRendererProps {
  paths: Stroke[];
}

export const StrokeRenderer: React.FC<StrokeRendererProps> = ({ paths }) => {
  return (
    <>
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
    </>
  );
};

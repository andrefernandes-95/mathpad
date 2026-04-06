import { SkPath } from '@shopify/react-native-skia';

export interface Stroke {
  path: SkPath;
  color: string;
  width: number;
}

export interface CanvasHandle {
  clear: () => void;
  undo: () => void;
  getBase64: () => Promise<string | undefined>;
}

export interface CanvasProps {
  strokeColor?: string;
  strokeWidth?: number;
}

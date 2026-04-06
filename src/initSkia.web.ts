import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

export const initSkia = async () => {
  console.log("Loading Skia Web Engines...");
  try {
    await LoadSkiaWeb({
      locateFile: (file: string) => `https://unpkg.com/canvaskit-wasm@0.40.0/bin/full/${file}`
    });
    console.log("Skia Web Initialized Successfully!");
  } catch (err) {
    console.error("Critical: Failed to load Skia Web Engine!", err);
  }
};

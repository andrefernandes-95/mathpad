import { registerRootComponent } from 'expo';
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

console.log("Loading Skia Web Engines...");

LoadSkiaWeb({
  locateFile: (file) => `https://unpkg.com/canvaskit-wasm@0.40.0/bin/full/${file}`
}).then(() => {
  console.log("Skia Web Initialized Successfully!");
  const App = require('./App').default;
  registerRootComponent(App);
}).catch(err => {
  console.error("Critical: Failed to load Skia Web Engine!", err);
});

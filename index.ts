import { registerRootComponent } from 'expo';
import { initSkia } from './src/initSkia';

const startApp = () => {
  const App = require('./App').default;
  registerRootComponent(App);
};

// This helps to properly initialize Skia on web, and is a no-op on native.
initSkia().then(startApp);

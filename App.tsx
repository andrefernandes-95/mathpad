import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainScreen } from './src/screens/MainScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MainScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontWeight: '600',
  }
});

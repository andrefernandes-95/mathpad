import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export const useExercise = () => {
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = useCallback(async (fromCamera = false) => {
    setIsPicking(true);
    try {
      console.log('Picking image from:', fromCamera ? 'camera' : 'library');
      const options: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      };

      const result = await (fromCamera 
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));

      console.log('Picker result canceled:', result.canceled);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('Asset received, base64 length:', asset.base64?.length || 0);
        
        if (asset.base64) {
          return asset.base64;
        } else {
          console.warn('No base64 data found in asset');
        }
      }
      return null;
    } catch (e) {
      console.error('Image picking error:', e);
      return null;
    } finally {
      setIsPicking(false);
    }
  }, []);

  return {
    isPicking,
    pickImage,
  };
};

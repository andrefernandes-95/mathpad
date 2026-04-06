import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export const useExercise = (initialImage: string | null = null) => {
  const [exerciseBase64, setExerciseBase64] = useState<string | null>(initialImage);
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = useCallback(async (fromCamera = false) => {
    setIsPicking(true);
    try {
      const options: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      };

      const result = await (fromCamera 
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));

      if (!result.canceled && result.assets[0].base64) {
        setExerciseBase64(result.assets[0].base64);
        return result.assets[0].base64;
      }
      return null;
    } catch (e) {
      console.error('Image picking error:', e);
      return null;
    } finally {
      setIsPicking(false);
    }
  }, []);

  const clearExercise = useCallback(() => {
    setExerciseBase64(null);
  }, []);

  return {
    exerciseBase64,
    isPicking,
    pickImage,
    clearExercise,
    setExerciseBase64,
  };
};

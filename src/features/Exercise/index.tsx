import React from 'react';
import { useExercise } from './hooks/useExercise';
import { ExercisePanel } from './components/ExercisePanel';

interface ExerciseFeatureProps {
  onImageSelected: (base64: string | null) => void;
  selectedImage: string | null;
}

const ExerciseFeature: React.FC<ExerciseFeatureProps> = ({ 
  onImageSelected, 
  selectedImage 
}) => {
  const { isPicking, pickImage } = useExercise();

  const handlePick = async (fromCamera?: boolean) => {
    console.log('ExerciseFeature: handlePick called');
    const result = await pickImage(fromCamera);
    if (result) {
      console.log('ExerciseFeature: Image picked, calling onImageSelected');
      onImageSelected(result);
    } else {
      console.log('ExerciseFeature: pickImage returned null');
    }
    return result;
  };

  return (
    <ExercisePanel 
      selectedImage={selectedImage}
      onImageSelected={onImageSelected}
      onPickImage={handlePick}
      isPicking={isPicking}
    />
  );
};

export default ExerciseFeature;
export * from './hooks/useExercise';

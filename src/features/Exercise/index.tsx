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
  const { isPicking, pickImage } = useExercise(selectedImage);

  const handleImageSelected = (base64: string | null) => {
    onImageSelected(base64);
  };

  return (
    <ExercisePanel 
      selectedImage={selectedImage}
      onImageSelected={handleImageSelected}
      onPickImage={pickImage}
      isPicking={isPicking}
    />
  );
};

export default ExerciseFeature;
export * from './hooks/useExercise';

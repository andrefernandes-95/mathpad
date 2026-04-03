import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, HelpCircle, RefreshCcw } from 'lucide-react-native';

interface Props {
  onImageSelected: (base64: string | null) => void;
  selectedImage: string | null;
}

export const ExercisePanel: React.FC<Props> = ({ onImageSelected, selectedImage }) => {
  const [loading, setLoading] = useState(false);

  const pickImage = async (fromCamera = false) => {
    setLoading(true);
    try {
      const result = await (fromCamera 
        ? ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          })
        : ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          }));

      if (!result.canceled && result.assets[0].base64) {
        onImageSelected(result.assets[0].base64);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!selectedImage ? (
        <View style={styles.emptyState}>
          <View style={styles.iconCircle}>
            <ImageIcon color="#6366f1" size={32} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Add Your Exercise</Text>
          <Text style={styles.subtitle}>Upload a screenshot or photo of the math problem you want to solve.</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={() => pickImage(true)}
            >
              <Camera color="#fff" size={18} />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => pickImage(false)}
            >
              <ImageIcon color="#475569" size={18} />
              <Text style={styles.buttonTextSecondary}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.activeState}>
          <Image 
            source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} 
            style={styles.previewImage} 
            resizeMode="cover"
          />
          <View style={styles.overlay}>
             <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => pickImage(true)}
            >
              <RefreshCcw color="#fff" size={16} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.dangerButton]} 
              onPress={() => onImageSelected(null)}
            >
              <X color="#fff" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>Active Exercise</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 20,
    // Premium shadow
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  secondaryButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonTextSecondary: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  activeState: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  imageLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
});

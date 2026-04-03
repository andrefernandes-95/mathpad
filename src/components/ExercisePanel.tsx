import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, RefreshCcw } from 'lucide-react-native';

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
      <View style={styles.glossyOverlay} />
      {!selectedImage ? (
        <View style={styles.activeContent}>
          <View style={styles.iconContainer}>
            <ImageIcon color="#0ea5e9" size={40} strokeWidth={1} />
            <View style={styles.glossyOverlayInner} />
          </View>
          <Text style={styles.title}>EXERCISE IMPORT</Text>
          <Text style={styles.subtitle}>Select a problem to analyze with Gemini Vista AI.</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.vistaButton, styles.primaryVista]} 
              onPress={() => pickImage(true)}
              disabled={loading}
            >
              <View style={styles.glossyOverlayInner} />
              <Camera color="#fff" size={18} />
              <Text style={styles.buttonText}>CAMERA</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vistaButton, styles.secondaryVista]} 
              onPress={() => pickImage(false)}
              disabled={loading}
            >
              <View style={styles.glossyOverlayInner} />
              <ImageIcon color="#0369a1" size={18} />
              <Text style={[styles.buttonText, { color: '#0369a1' }]}>GALLERY</Text>
            </TouchableOpacity>
          </View>
          {loading && <ActivityIndicator size="small" color="#0ea5e9" style={{ marginTop: 15 }} />}
        </View>
      ) : (
        <View style={styles.activeState}>
          <Image 
            source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} 
            style={styles.previewImage} 
            resizeMode="contain"
          />
          <View style={styles.overlay}>
             <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => pickImage(true)}
            >
               <View style={styles.glossyOverlayInner} />
               <RefreshCcw color="#fff" size={16} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.dangerButton]} 
              onPress={() => onImageSelected(null)}
            >
               <View style={styles.glossyOverlayInner} />
              <X color="#fff" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>LOCKED FOR ANALYSIS</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 0, // Fits card container
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  glossyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  glossyOverlayInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
  activeContent: {
    alignItems: 'center',
    padding: 30,
    zIndex: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0369a1',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    paddingHorizontal: 20,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  vistaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryVista: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
  },
  secondaryVista: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  activeState: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3, 105, 161, 0.8)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageLabelText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  iconButton: {
    backgroundColor: '#0369a1',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
});

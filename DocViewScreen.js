import React, {useState, useEffect, useRef} from 'react';
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
  Animated,
  ScrollView,
  Button,
} from 'react-native';

import translations from './translations.json';


const DocViewScreen = ({route, navigation, currentLanguage}) => {
  const { selectedImageUri, serverResponse } = route.params; // Destructure serverResponse


 // Function to get translated text based on the current language
 const getTranslatedText = key => {
  const translation =
    translations[currentLanguage] || translations['english'];
  return translation[key] || key;
};



  const handleDone = () => {
    navigation.navigate('Main');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.imageContainer}>
        <Image source={{uri: selectedImageUri}} style={styles.image} />

        <Text style={styles.responseText}>
          {serverResponse} {/* Use the serverResponse directly */}
        </Text>
        <TouchableOpacity
          onPress={handleDone}
          style={styles.uploadButton}>
          <Text style={styles.buttonText}>{getTranslatedText('done')}</Text>
        </TouchableOpacity>

    
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: '#007bff', // Example button color
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff', // Example text color
    textAlign: 'center',
  },
  scrollViewContainer: {
    flexGrow: 'flex-start',
  },
  responseText: {
    marginTop: 20, // Add more space above the text
    padding: 15, // Add some padding for better readability
    backgroundColor: '#ebebeb', // Light grey background for contrast
    color: '#333333', // Darker text color for readability
    fontSize: 16, // Increase font size
    borderRadius: 8, // Rounded corners
    width: '90%', // Width relative to the container
    textAlign: 'center', // Center the text
    alignSelf: 'center', // Ensure it's centered horizontally in the container
    overflow: 'hidden', // In case of overflow
  },
  imageContainer: {
    flex: 'flex-start',
    justifyContent: 'start', // centers the image vertically in the container
    alignItems: 'center', // centers the image horizontally in the container
    marginBottom: 100,
  },
  image: {
    width: 300, // Width of the image
    height: 400, // Height of the image
    resizeMode: 'contain', // Ensures the entire image is visible
    alignSelf: 'center', // Centers the image in the container
    marginTop: 10, // Space at the top
  },
});

export default DocViewScreen;

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

// const convertLocalFileToBase64 = async filePath => {
//   function removeFilePrefix(filePath) {
//     const filePrefix = 'file://';

//     if (filePath.startsWith(filePrefix)) {
//       // Remove the 'file://' prefix and return the modified path
//       return filePath.substring(filePrefix.length);
//     }

//     // If the 'file://' prefix is not found, return the original path
//     return filePath;
//   }

//   try {
//     // Fetch the file content
//     const data = await RNBlobUtil.fs.readFile(
//       removeFilePrefix(filePath),
//       'base64',
//     );
//     return data;
//   } catch (error) {
//     console.error('Error reading file:', error);
//     return null;
//   }
// };

const ImageViewScreen = ({route, navigation, currentLanguage}) => {
  const [isUploading, setIsUploading] = useState(false);

  const [serverResponse, setServerResponse] = useState('');

  const {selectedImageUri} = route.params;
  // console.log(currentLanguage);

  const handleUpload = async () => {
    setIsUploading(true); // Start loading

    const formData = new FormData();
    formData.append('document', {
      name: 'uploaded_image.jpg',
      type: 'image/jpeg',
      uri: selectedImageUri,
    });
    formData.append('language', currentLanguage);

    try {
      const response = await fetch('http://localhost:5000/processDocument', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setServerResponse(await response.text());
      console.log('Response:', serverResponse);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false); // Stop loading regardless of outcome
    }
  };

  // Function to get translated text based on the current language
  const getTranslatedText = key => {
    const translation =
      translations[currentLanguage] || translations['english'];
    return translation[key] || key;
  };

  const handleSave = async () => {
    // Generate a unique ID for this set of data
    const uniqueId = new Date().getTime().toString();

    try {
      // Save the image URI with its unique ID
      // await getBase64ImageFromUrl(imageUrl)
      // const base64 = await convertLocalFileToBase64(selectedImageUri);
      await AsyncStorage.setItem(`image_${uniqueId}`, selectedImageUri);

      // Save the server response with the same unique ID
      await AsyncStorage.setItem(
        `response_${uniqueId}`,
        JSON.stringify(serverResponse),
      );

      // Create and save a reference object
      const referenceObject = {
        imageKey: `image_${uniqueId}`,
        responseKey: `response_${uniqueId}`,
      };
      

      const existingDataJson = await AsyncStorage.getItem('savedReferences');
      const existingData = existingDataJson ? JSON.parse(existingDataJson) : [];
      existingData.push(referenceObject);

      const newDataJson = JSON.stringify(existingData);
      await AsyncStorage.setItem('savedReferences', newDataJson);

      console.log('Data saved');
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.imageContainer}>
      <TouchableOpacity
          onPress={handleDone}
          style={styles.uploadButton}>
          <Text style={styles.buttonText}>{getTranslatedText('done')}</Text>
        </TouchableOpacity>
        <Image source={{uri: selectedImageUri}} style={styles.image} />

        <TouchableOpacity
          onPress={handleUpload}
          style={styles.uploadButton}
          disabled={isUploading}>
          <Text style={styles.buttonText}>
            {getTranslatedText('uploadImage')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.uploadButton}
          disabled={isUploading}>
          <Text style={styles.buttonText}>{getTranslatedText('save')}</Text>
        </TouchableOpacity>

        {isUploading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : null}

        {serverResponse && (
          <Text style={styles.responseText}>
            {JSON.stringify(serverResponse)}
          </Text>
        )}
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

export default ImageViewScreen;

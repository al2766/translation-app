import React, {useState, useEffect, useRef} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
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
      const response = await fetch('https://scan-and-translate-406916.nw.r.appspot.com/processDocument', {
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

  const handleDone = () => {
    navigation.navigate('Main');
  };

  const scrollViewRef = useRef(null); 

  useEffect(() => {
    if (serverResponse) {
      // Scroll to the bottom of the ScrollView
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100); // Adjust this delay as needed
    }
  }, [serverResponse]);

  
    return ( 
    <>
<TouchableOpacity
          onPress={handleDone}
          style={styles.doneButtonContainer}
        >   
    <FontAwesome name='chevron-left' light style={{ color: '#479c92', fontSize: 23 }} />

         

          <Text style={styles.doneButtonText}>{getTranslatedText('done')}</Text>
        </TouchableOpacity>
   
      <ScrollView contentContainer Style={styles.scrollViewContainer} ref={scrollViewRef}>
             
        <View style={styles.imageContainer}>
 
          <Image source={{uri: selectedImageUri}} style={styles.image} />
  
          <TouchableOpacity
            onPress={handleUpload}
            style={styles.uploadButton}
            disabled={isUploading}>
            <Text style={styles.buttonText}>
              {getTranslatedText('uploadImage')}
            </Text>
          </TouchableOpacity>
        
  
          {isUploading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : null}
  
          {serverResponse && (
           
            <Text style={styles.responseText}>
              {JSON.stringify(serverResponse)}
            </Text>
   
          )}
          <View style={styles.bottomButtonsContainer}>
      
  
          {/* Conditionally render the save button */}
          {serverResponse ? (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.uploadButton}>
              <Text style={styles.buttonText}>{getTranslatedText('save')}</Text>
            </TouchableOpacity>
          ) : null}
          </View>
        </View>
      </ScrollView>
  </>  );
  };
  

const styles = StyleSheet.create({
  bottomButtonsContainer: {display: 'flex'},
  doneButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Or any color you prefer
    padding: 10, // Padding for the button
    gap: 10,
  },
  doneButton: {
    
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start', 
    top: 10,
    left: 10,
    paddingVertical: 10, // Increase padding vertically to make the buttons taller
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
 uploadButton: {

  padding: 15, // Increase padding vertically to make the buttons taller
  marginBottom: 15,
  backgroundColor: '#479c92',
  borderRadius: 12,
  shadowColor: 'gray',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 3,
},
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    color: '#479c92',
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollViewContainer: {
    flexGrow: 'flex-start',
  },
  responseText: {
    marginVertical: 20, // Add more space above the text
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
    marginVertical: 20, // Space at the top
  },
});

export default ImageViewScreen;

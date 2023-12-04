import React, {useState, useEffect, useRef} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome'


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
    <>
   <TouchableOpacity
          onPress={handleDone}
          style={styles.doneButtonContainer}
        >    
    <FontAwesome name='chevron-left' light style={{ color: '#479c92', fontSize: 23 }} />
      

          <Text style={styles.doneButtonText}>{getTranslatedText('done')}</Text>
        </TouchableOpacity>

    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.imageContainer}>
        <Image source={{uri: selectedImageUri}} style={styles.image} />

        <Text style={styles.responseText}>
          {serverResponse} {/* Use the serverResponse directly */}
        </Text>
       

    
      </View>
    </ScrollView>
  </>);
};

const styles = StyleSheet.create({
  doneButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    textAlign: 'center',
    color: '#479c92',
  },
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
  scrollViewContainer: {
    flexGrow: 'flex-start',
  },
  responseText: {
    marginTop: 20, // Add more space above the text
    padding: 15, // Add some padding for better readability
    backgroundColor: '#e2e2e2', // Light grey background for contrast
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

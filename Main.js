import React, {useState, useEffect, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
  Animated,
  ScrollView,
  FlatList,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

// Import the translations JSON
import translations from './translations.json';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {blue} from '@material-ui/core/colors';

const FadeInView = props => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current; // Initial value for translateY: 30

  useEffect(() => {
    const fadeInDuration = 1000; // Duration of the fade-in animation in milliseconds
    const translateYDuration = 1000; // Duration of the translation animation in milliseconds
    const delay = props.delay || 0; // Delay for this animation, default to 0

    const sequence = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: fadeInDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: translateYDuration,
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start();

    // Cleanup function
    return () => {
      // This will stop the animation when the component unmounts
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [opacity, translateY, props.delay]);

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity,
        transform: [{translateY}],
      }}>
      {props.children}
    </Animated.View>
  );
};

const Main = ({
  selected,
  onSelectLanguage,
  onChangeLanguage,
  onChoosePhoto,
  onTakePhoto,

  currentLanguage,
  navigation,
  serverResponse,
}) => {
  const [savedDocuments, setSavedDocuments] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  // Function to get translated text based on the current language
  const getTranslatedText = key => {
    const translation =
      translations[currentLanguage] || translations['english'];
    return translation[key] || key;
  };

  const handleChangeLanguage = () => {
    navigation.navigate('StarterMenu');
  };

  const handleImageSelect = imageUri => {
    const options = {
      storageOptions: {
        path: 'images',
      },
    };

    launchImageLibrary(options, response => {
      if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        setSelectedImage({uri: selectedImageUri});
        navigation.navigate('ImageViewScreen', {
          selectedImageUri: selectedImageUri,
        });
      }
    });
  };

  const loadSavedData = async () => {
    try {
      // Retrieve the list of reference objects
      const referencesJson = await AsyncStorage.getItem('savedReferences');
      const references = referencesJson ? JSON.parse(referencesJson) : [];

      // Initialize an array to hold the combined data
      const combinedData = [];

      for (const reference of references) {
        // Retrieve the image URI and server response for each reference
        const imageUri = await AsyncStorage.getItem(reference.imageKey);
        const serverResponseJson = await AsyncStorage.getItem(
          reference.responseKey,
        );
        const serverResponse = serverResponseJson
          ? JSON.parse(serverResponseJson)
          : null;

        // Combine the image URI and server response into a single object
        combinedData.push({
          id: reference.imageKey,
          imageUri,
          serverResponse,
        });
      }

      // Update the state with the combined data
      setSavedDocuments(combinedData);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSavedData();
    }, []),
  );

  const deleteDocument = async (id) => {
    try {
      await AsyncStorage.removeItem(id); // Remove the image URI
      const responseKey = `response_${id.split('_')[1]}`; // Construct the response key
      await AsyncStorage.removeItem(responseKey); // Remove the server response
  
      // Update the local state
      const updatedDocuments = savedDocuments.filter(doc => doc.id !== id);
      setSavedDocuments(updatedDocuments);
  
      // Update the saved references in AsyncStorage
      const referencesJson = await AsyncStorage.getItem('savedReferences');
      let references = referencesJson ? JSON.parse(referencesJson) : [];
      references = references.filter(ref => ref.imageKey !== id);
      await AsyncStorage.setItem('savedReferences', JSON.stringify(references));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };
  

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.documentContainer}
    onPress={() => navigation.navigate('DocViewScreen', {
      selectedImageUri: item.imageUri,
      serverResponse: item.serverResponse,
      // You can pass other necessary data here
    })}>
      <Image
        // source={{uri: `data:image/png;base64,${doc.imageBase64}`}}
        source={{uri: item.imageUri}}
        style={styles.documentImage}
      />
      <Text style={styles.documentText}>{item.serverResponse}</Text>
      <TouchableOpacity
      onPress={() => deleteDocument(item.id)}
      style={styles.deleteButton}>
      <Text>Delete</Text>
    </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleChangeLanguage}
        style={styles.changeLanguageButton}>
        <Text style={styles.buttonText}>
          {getTranslatedText('changeLanguage')}
        </Text>
      </TouchableOpacity>

      <View style={styles.savedContainer}>
        {savedDocuments.length > 0 ? (
          // Render saved documents list

          // savedDocuments.map((doc, index) => (
          //   <TouchableOpacity key={index} style={styles.documentContainer}>
          //     <Image
          //       // source={{uri: `data:image/png;base64,${doc.imageBase64}`}}
          //       source={{uri: doc.imageUri}}
          //       style={styles.documentImage}
          //     />
          //     <Text style={styles.documentText}>{doc.serverResponse}</Text>
          //   </TouchableOpacity>
          // ))
          <FlatList
            data={savedDocuments}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            removeClippedSubviews={true} // Unmount components when outside of window
            initialNumToRender={8} // Reduce initial render amount
            maxToRenderPerBatch={2} // Reduce number in each render batch
          />
        ) : (
          <FadeInView delay={500}>
            <Text style={styles.heading}>
              {' '}
              {getTranslatedText('appHeading')}
            </Text>
            <Text style={styles.subheading}>
              {' '}
              {getTranslatedText('appSubheading')}
            </Text>
          </FadeInView>
        )}
      </View>
      <FadeInView delay={1000}>
        <View style={styles.uploadContainer}>
          <FadeInView delay={1000}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    useColorScheme() === 'dark' ? Colors.white : Colors.black,
                },
              ]}>
              {getTranslatedText('uploadImage')}
            </Text>
          </FadeInView>

          <FadeInView delay={1500}>
            <TouchableOpacity
              onPress={handleImageSelect}
              style={styles.buttonStyle}>
              <Text style={styles.buttonText}>
                {getTranslatedText('choosePhoto')}
              </Text>
            </TouchableOpacity>
          </FadeInView>
          <FadeInView delay={2000}>
            <TouchableOpacity onPress={onTakePhoto} style={styles.buttonStyle}>
              <Text style={styles.buttonText}>
                {getTranslatedText('takePhoto')}
              </Text>
            </TouchableOpacity>
          </FadeInView>
        </View>
      </FadeInView>
    </View>
  );
};

// ... (rest of your code)

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    // Other styling as needed
  },
  documentContainer: {
    flexDirection: 'row', // Align children in a row
    marginBottom: 10,
    alignItems: 'center', // Align children vertically in the center
    height: 50, // Set a fixed height for each item
    overflow: 'hidden', // Hide any overflowing content
    paddingHorizontal: 30,
  },
  savedContainer: {
    marginTop: 80,
    marginBottom: 210,
    maxHeight: 300,
  },

  documentImage: {
    width: 50, // Smaller width
    height: 50, // Equal to the container height to maintain aspect ratio
    resizeMode: 'cover', // Cover the frame of the image
  },
  documentText: {
    flex: 1, // Take up remaining space in the container
    marginLeft: 10, // Space between the image and text
    // Optional: additional styling as needed
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  uploadContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 30,
  },

  changeLanguageButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 10, // Increase padding vertically to make the buttons taller
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  savedButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 10, // Increase padding vertically to make the buttons taller
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center', // Align text to the left
  },
  buttonStyle: {
    width: 200,
    paddingVertical: 15, // Increase padding vertically to make the buttons taller
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default Main;

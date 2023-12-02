import React, {useState, useEffect, useRef} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
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
  Alert,
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

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this document?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteDocument(id),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };
  

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
      onPress={() => confirmDelete(item.id)}
      style={styles.deleteButton}>
<FontAwesome name='trash' style={{color: '#ce1b20', fontSize: 27}}/>
    
    </TouchableOpacity>
    </TouchableOpacity>
  );

  return ( 
    <>
     <View style={styles.changeLanguageContainer}>
     <FontAwesome name='chevron-left' light style={{ color: 'black', fontSize: 23 }} />

    <TouchableOpacity
    
        onPress={handleChangeLanguage}
        style={styles.changeLanguageButton}>
        <Text style={styles.languageButtonText}>
          {getTranslatedText('changeLanguage')}
        </Text>
      </TouchableOpacity>
      </View>
    <View style={styles.container}>
    

      <View style={styles.savedContainer}>
        {savedDocuments.length > 0 ? (
       
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

        <View style={styles.uploadContainer}>

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

<View style={styles.uploadButtonsContainer}>

            <TouchableOpacity
              onPress={handleImageSelect}
              style={styles.buttonStyle}>
              <Text style={styles.buttonText}>
                {getTranslatedText('choosePhoto')}
              </Text>
            </TouchableOpacity>


            <TouchableOpacity onPress={onTakePhoto} style={styles.buttonStyle}>
              <Text style={styles.buttonText}>
                {getTranslatedText('takePhoto')}
              </Text>
            </TouchableOpacity>

          </View>
        </View>

    </View>
 </> );
};

// ... (rest of your code)

const styles = StyleSheet.create({
  uploadButtonsContainer: {
display: 'flex',
flexDirection: 'row',
gap: 20,
justifyContent: 'space-around',
marginTop: 10,

  }
  
  ,
  deleteButton: {

padding: 6,
borderRadius: 10,

  },
  deleteButtonText: {
    color: 'white',
    marginLeft: 5, // Space between icon and text
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1, // Separator line
    borderBottomColor: '#e0e0e0', // Light grey color for the separator
    padding: 6, // Padding inside each container
    paddingRight: 10,
    height: 60,
    marginVertical: 10,
  },
  savedContainer: {
    marginBottom: 90,
    height: 410,
 
  },

  documentImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    marginRight: 5, // Add space between the image and the text
    borderWidth: 1, // Optional: border around the image
    borderColor: '#e0e0e0', // Light grey border for the image
    borderRadius: 5, // Optional: round corners for the image
  },
  documentText: {
flex: 1,
    marginHorizontal: 15, // Space between the image and text
    // Optional: additional styling as needed
  },
  heading: {
    marginTop:80,
    fontSize: 34,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
   
  },
  subheading: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    marginHorizontal: 30,
  },
  uploadContainer: {
    bottom: 90,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
  },

  changeLanguageContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Or any color you prefer
    padding: 10, // Padding for the button
  },
  changeLanguageButton: {
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
  sectionTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center', // Align text to the left
    color: 'white',
    fontWeight: '500',
  },
  languageButtonText: {
    fontSize: 16,
    textAlign: 'center', // Align text to the left
    color: 'black',
    fontWeight: '500',
  },
  buttonStyle: {
    alignSelf: 'flex-start', 
    padding: 15, // Increase padding vertically to make the buttons taller
    marginBottom: 15,
    backgroundColor: '#4381a2',
    borderRadius: 12,
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default Main;

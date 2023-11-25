import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import StarterMenu from './StarterMenu';
import ImageViewScreen from './ImageViewScreen';
import DocViewScreen from './DocViewScreen';

import Main from './Main';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const storeLanguagePreference = async (language: string) => {
  try {
    await AsyncStorage.setItem('preferredLanguage', language);
  } catch (e) {
    // saving error
    console.log(e);
  }
};

const loadLanguagePreference = async () => {
  try {
    const value = await AsyncStorage.getItem('preferredLanguage');
    if (value !== null) {
      // value previously stored
      return value;
    }
  } catch (e) {
    // error reading value
    console.log(e);
  }
  return null; // or default language
};

const Stack = createNativeStackNavigator();

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selected, setSelected] = useState('');
  const [serverResponse, setServerResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('StarterMenu');

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const checkLanguagePreference = async () => {
      const language = await loadLanguagePreference();
      if (language !== null) {
        setSelected(language);
        setInitialRoute('Main'); // Set to Main if language is already set
      }

      console.log(language);

      await delay(1500);

      setIsLoading(false);
    };

    checkLanguagePreference();
  }, []);


  const handleSelectLanguage = async (language: string) => {
    setSelected(language);
    storeLanguagePreference(language);

  };



  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchCamera(options, response => {
      if (response.assets && response.assets.length > 0) {
        const takenImageUri = response.assets[0].uri;
        setSelectedImage({uri: takenImageUri});
      }
    });
  };



  const backgroundStyle = {
    backgroundColor:
      useColorScheme() === 'dark' ? Colors.darker : Colors.lighter,
  };

  const AppNavigator = () => {
    return (
      <>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="StarterMenu"  options={{ headerShown: false }}>
              {props => (
                <StarterMenu
                  {...props}
                  
                  onSelectLanguage={handleSelectLanguage}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ImageViewScreen"  options={{ headerShown: false }}>
              {props => (
                <ImageViewScreen
                  {...props}
                  currentLanguage={selected}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="DocViewScreen"  options={{ headerShown: false }}>
              {props => (
                <DocViewScreen
                  {...props}
                  currentLanguage={selected}
                />
              )}
            </Stack.Screen>
          
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {props => (
                <Main
                  {...props}
                  selected={selected}
                  onSelectLanguage={handleSelectLanguage}
                  // onChangeLanguage={handleChangeLanguage}
              
                  onTakePhoto={handleTakePhoto}
                
                  // onUpload={handleUpload}
                  currentLanguage={selected}
                  serverResponse={serverResponse}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </>
    );
  };

  return (
    // <SafeAreaView style={styles.container}>
    //   <StatusBar
    //     barStyle={
    //       useColorScheme() === 'dark' ? 'light-content' : 'dark-content'
    //     }
    //     backgroundColor={backgroundStyle.backgroundColor}
    //   />
    //   <ScrollView
    //     contentInsetAdjustmentBehavior="automatic"
    //     contentContainerStyle={styles.content}
    //     style={styles.container}>
    //     {/* <Main
    //       selected={selected}
    //       onSelectLanguage={handleSelectLanguage}
    //       onChangeLanguage={handleChangeLanguage}
    //       onChoosePhoto={handleChoosePhoto}
    //       onTakePhoto={handleTakePhoto}
    //       selectedImage={selectedImage}
    //       onUpload={handleUpload}
    //       currentLanguage={selected}
    //     /> */}
    //     <StarterMenu onSelectLanguage={handleSelectLanguage} />
    //     {serverResponse && (
    //       <Text style={styles.responseText}>
    //         {JSON.stringify(serverResponse)}
    //       </Text>
    //     )}
    //   </ScrollView>
    // </SafeAreaView>
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={
            useColorScheme() === 'dark' ? 'light-content' : 'dark-content'
          }
          backgroundColor={backgroundStyle.backgroundColor}
        />
       
          <AppNavigator />
 
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 10,
    top: 30,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  selectedImageHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'black',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  sectionContainer: {
    marginTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
});

export default App;

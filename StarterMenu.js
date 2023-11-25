import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const StarterMenu = ({onSelectLanguage, navigation}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = language => {
    // setSelectedLanguage(language);
    onSelectLanguage(language);
    navigation.navigate('Main');
  };

  const languages = [
    'arabic',
    'english',
    'espanol',
    'french',
    'german',
    'italian',
    'portuguese',
    'russian',
    'japanese',
    'korean',
    'chinese',
    'dutch',
    'swedish',
    'finnish',
    'norwegian',
    'danish',
    'polish',
    'turkish',
    'hindi',
    'bengali',
    'urdu',
    'greek',
    'czech',
    'vietnamese'
  ];
  
  return (
    
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Select Your Language:</Text>
        {languages.map(language => (
          
          <TouchableOpacity
            key={language}
            style={[
              styles.languageButton,
              language === selectedLanguage && styles.selectedLanguageButton,
            ]}
            onPress={() => handleLanguageSelect(language)}>
            <Text style={styles.languageButtonText}>{language}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {

    marginVertical: 50, // Remove top padding to start from the top of the page
    paddingHorizontal: 20, 
    paddingBottom:100,// Add horizontal padding for spacing from edges
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'left', // Align text to the left
  },
  languageButton: {
    paddingVertical: 20, // Increase padding vertically to make the buttons taller
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
  selectedLanguageButton: {
    backgroundColor: 'skyblue',
  },
  languageButtonText: {
    fontSize: 16,
    textAlign: 'left', // Align text to the left
    paddingLeft: 10, // Add left padding for text
  },
});

export default StarterMenu;

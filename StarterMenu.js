import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const StarterMenu = ({ onSelectLanguage, navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = language => {
    onSelectLanguage(language);
    navigation.navigate('Main');
  };

  // Mapping of language codes to native names
  const languageDisplayNames = {
    arabic: 'العربية',
    english: 'English',
    espanol: 'Español',
  };

  const languages = [
    'arabic',
    'english',
    'espanol',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Select Your Language</Text>
      {languages.map(language => (
        <TouchableOpacity
          key={language}
          style={[
            styles.languageButton,
            language === selectedLanguage && styles.selectedLanguageButton,
          ]}
          onPress={() => handleLanguageSelect(language)}>
          <Text style={styles.languageButtonText}>
            {languageDisplayNames[language]}
          </Text>
          <FontAwesome5 name='chevron-right' style={{ color: 'black', fontSize: 23 }} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// ...styles remain unchanged...


const styles = StyleSheet.create({
  container: {
    paddingBottom:30,// Add horizontal padding for spacing from edges
  },
  heading: {
    textAlign: 'center',
    fontSize: 24,
marginVertical: 50,
    fontWeight:'500',
  },
  languageButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20, // Increase padding vertically to make the buttons taller

paddingHorizontal: 20,
    backgroundColor: 'white',

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
    fontWeight: '500',
    textAlign: 'left', // Align text to the left
    paddingLeft: 10, // Add left padding for text
  },
});

export default StarterMenu;

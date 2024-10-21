import React from 'react';
import { StyleSheet, View, TextInput, Image } from 'react-native';
import imgsearch from '../images/Icons/search.png';

const Search = ({ functionsearch }) => {
  const handleSearch = (text) => {
    functionsearch(text);  
  };

  return (
    <View style={styles.search}>
      <TextInput
        style={styles.inputsearch}
        placeholder="Buscar rutina"
        onChangeText={handleSearch}
        caretHidden={true}
      />
      <Image source={imgsearch} style={styles.imgsearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  search: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#F7F9F8',
    elevation: 5,
  },
  inputsearch: {
    width: '80%',
    height: '100%',
    fontSize: 18,
  },
  imgsearch: {
    color: 'black',
    width: 20,
    height: 20,
  },
});

export default Search;
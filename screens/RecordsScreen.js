import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import ProgressRoutines from '../components/ProgressRoutines';
import ProgressBody from '../components/ProgressBody';

const RecordsScreen = () => {
  const [activeCategory, setActiveCategory] = useState('Entrenamiento');
  return (
    <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.category}>
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === 'Entrenamiento' && styles.activeButton]}
            onPress={() => setActiveCategory('Entrenamiento')}
          >
            <Text style={[styles.categoryTitle, activeCategory === 'Entrenamiento' && styles.active]}>
              Entrenamiento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === 'Cuerpo' && styles.activeButton]}
            onPress={() => setActiveCategory('Cuerpo')}
          >
            <Text style={[styles.categoryTitle, activeCategory === 'Cuerpo' && styles.active]}>
              Cuerpo
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {activeCategory === 'Entrenamiento' ? <ProgressRoutines/> : <ProgressBody/>} 
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#fff',

  },
  category: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: '10%',
  },
  categoryButton: {
    flex: 1,
    marginHorizontal: 7,
    alignItems: 'center',
    height:33
  },
  categoryTitle: {
    fontSize: 21,
    color: 'black',
    fontFamily: 'poppins600',
  },
  active: {
    borderBottomColor: 'black',
    borderBottomWidth: 2,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '4%',
  },
});

export default RecordsScreen;


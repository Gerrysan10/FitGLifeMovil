import { useEffect, useState  } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import ListRoutines from '../components/ListRoutines';
import HeaderSearch from '../components/HeaderSearch';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from '../firebase';
import { Verificar_conexion } from '../components/CheckConnection';
const RoutinesScreen = () => {
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoutines = async () => {
    if (await Verificar_conexion()) {
      setIsLoading(true);
    try {
      const routinesQuery = query(collection(db, 'routines'));
      const routinesSnapshot = await getDocs(routinesQuery);
      const data = routinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutines(data);
      setFilteredRoutines(data);
    } catch (error) {
      Alert.alert('Error','Ocurrio un error al obtener las rutinas');
    } finally {
      setIsLoading(false);
    }
    }else{
      Alert.alert('Error','No hay conexión a internet');
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Función para manejar la búsqueda y filtrar las rutinas
  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredRoutines(routines);  // Si no hay texto, mostrar todas las rutinas
    } else {
      const filtered = routines.filter(routine =>
        routine.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRoutines(filtered);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HeaderSearch title={'Rutinas'} functionsearch={handleSearch} />
      <ListRoutines routines={filteredRoutines} isLoading={isLoading} onRefresh={fetchRoutines} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
});

export default RoutinesScreen;
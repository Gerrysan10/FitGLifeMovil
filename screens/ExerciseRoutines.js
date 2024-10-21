import { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Title from '../components/Title';
import ListDetailsExercises from '../components/ListDetailsExercises';
import { AuthContext } from '../AuthContext';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { Verificar_conexion } from '../components/CheckConnection';

const ExerciseRoutines = () => {
  const { user } = useContext(AuthContext);
  const userId = user.id;
  const route = useRoute();
  const { id, name, image } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchExercises();
    }
  }, [userId]);


  const fetchExercises = async () => {
    if (userId) {
      if (await Verificar_conexion()) {
        setIsLoading(true);
        try {
          const exercisesSnapshot = await getDocs(collection(db, `routines/${id}/details`));
          if (!exercisesSnapshot.empty) {
            const data = exercisesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setExercises(data);
          } else {
            setExercises([]);
          }
        } catch (error) {
          Alert.alert('Error', 'Ocurrio un error al obtener los ejercicios')
          setExercises([]);
        } finally {
          setIsLoading(false);
        }
      }else{
        Alert.alert('Error', 'No hay conexión a internet')
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExercises().then(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contTitle}>
        <Title title={name} />
      </View>
      <ListDetailsExercises userId={userId} name={name} image={image} exercises={exercises} isLoading={isLoading} setIsLoading={setIsLoading} refresh={refreshing} onRefresh={onRefresh} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contTitle: {
    marginTop: '10%',
    marginHorizontal: '4%',
  },
});

export default ExerciseRoutines;

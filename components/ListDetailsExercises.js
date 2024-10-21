import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Platform, ActivityIndicator, RefreshControl, ScrollView, Alert } from 'react-native';
import { getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import imgvacio from '../images/Icons/vacio.png';
import imgadd from '../images/Icons/add.png';
import ModalUpdateExercise from './ModalUpdateExercise';
import LoadingModal from './ModalLoading';
import { Verificar_conexion } from './CheckConnection';


const ListDetailsExercises = ({ userId, name, image, exercises, isLoading, setIsLoading, refresh, onRefresh }) => {
  const [exercisesWithData, setExercisesWithData] = useState([]);
  const [modalVisibleData, setModalVisibleData] = useState(false);
  const [selectExercise, setSelectExercise] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchExerciseData();
  }, [exercises]);


  const fetchExerciseData = async () => {
    if (exercises && exercises.length > 0) {
      if (await Verificar_conexion()) {
        setIsLoading(true);
        try {
          const exercisesData = await Promise.all(
            exercises.map(async (exerciseItem) => {
              if (exerciseItem.exercise) {
                const exerciseDoc = await getDoc(exerciseItem.exercise);
                const exerciseData = exerciseDoc.exists() ? exerciseDoc.data() : null;
                return {
                  ...exerciseItem,
                  exerciseData
                };
              } else {
                return { ...exerciseItem, exerciseData: null };
              }
            })
          );
          setExercisesWithData(exercisesData);
        } catch (error) {
          setExercisesWithData([]);
          Alert.alert('Error','Ocurrio un error al obtener los ejercicios');
        } finally {
          setIsLoading(false);
        }
      } else {
        Alert.alert('Error', 'No hay conexión a internet');
      }
    } else {
      setExercisesWithData([]);
      setIsLoading(false);
    }

  };

  const AddToMyRoutines = async () => {
    if (await Verificar_conexion()) {
      setModalLoading(true);
      try {
        const refRoutine = await addDoc(collection(db, `users/${userId}/routines`), {
          name: name,
          image: image,
          createdAt: new Date(),
        });

        const routineId = refRoutine.id;
        // 2. Añadir los ejercicios asociados a la rutina en `details`
        const batch = exercises.map(async (exercise) => {
          if (exercise.exercise) {
            await addDoc(collection(db, `users/${userId}/details`), {
              exercise: exercise.exercise, 
              reps: exercise.reps,
              series: exercise.series, 
              routineId: routineId, 
              weight: exercise.weight, 
            });
          }
        });

        // 3. Ejecutar todas las promesas de añadir ejercicios
        await Promise.all(batch);

      } catch (error) {

      } finally {
        setModalLoading(false);
        Alert.alert('Mensaje', 'Rutina y ejercicios añadidos correctamente');
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet. No se puede añadir la rutina.');
    }
  }

  const openModalData = (exercise) => {
    setSelectExercise(exercise);
    setModalVisibleData(true);
  };

  const closeModalData = () => {
    setModalVisibleData(false);
    setSelectExercise(null);
  };

  const routineItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.routineItem, index % 2 === 0 ? styles.even : styles.odd]}
      onPress={() => openModalData(item)}
    >
      <View style={[styles.contImg, index % 2 === 0 ? styles.colorback1 : styles.colorback2]}>
        {item.exerciseData?.image ? (
          <Image
            source={{ uri: item.exerciseData?.image }}
            style={styles.routineImage}
          />
        ) : (
          <Text>Sin imagen</Text>
        )}
      </View>
      <View style={styles.contcard}>
        <View style={styles.carddetails}>
          <Text style={styles.exerciseText}>
            {item.exerciseData?.name || 'Nombre no disponible'}
          </Text>
          <View style={styles.exercisedetails}>
            <Text>Series: {item.series}</Text>
            <Text>Reps: {item.reps}</Text>
            <Text>Peso: {item.weight ? item.weight[0] : 0} {item.weight ? item.weight[1] : 'kg'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#123abc" />
          <Text>Cargando</Text>
        </View>
      ) : exercisesWithData.length > 0 ? (
        <>
          <FlatList
            data={exercisesWithData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={routineItem}
            refreshControl={<RefreshControl
              refreshing={refresh}
              onRefresh={onRefresh} />}
          />
          <View style={styles.button}>

            <TouchableOpacity onPress={AddToMyRoutines}>
              <View style={styles.btnAdd}>
                <View style={styles.addIconContainer}>
                  <Image source={imgadd} style={styles.imgAdd} resizeMode="contain" />
                </View>
                <Text style={styles.textAdd}>Agregar a mis rutinas</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.textInfo}>Nota: Cuando agregues la rutina puedes ajustar los parámetros según tus necesidades.</Text>
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl
            refreshing={refresh}
            onRefresh={onRefresh} />}
        >
          <View style={styles.contemptyIT}>
            <Image style={styles.imgvacio} source={imgvacio} />
            <Text style={styles.textvacio}>Sin ejercicios</Text>
          </View>
        </ScrollView>
      )}
      {selectExercise && (
        <ModalUpdateExercise
          userId={userId}
          isVisible={modalVisibleData}
          onClose={closeModalData}
          exercise={selectExercise}
          activate={false}
        />
      )}
      <LoadingModal isVisible={modalLoading} message={'Agregando rutina...'} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '85%',
    paddingHorizontal: '2%',
  },

  spinnerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineItem: {
    flexDirection: 'row',
    width: '96%',
    height: 70,
    alignItems: 'center',
    paddingHorizontal: '2%',
    marginVertical: 7,
    borderRadius: 15,
    marginHorizontal: '2%',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  contcard: {
    flexDirection: 'row'
  },
  carddetails: {
    width: '86%',
    justifyContent: 'center'
  },
  contImg: {
    borderRadius: 60,
    borderWidth: .5,
    borderColor: '#757575',
    width: 60,
    height: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineImage: {
    borderRadius: 60,
    width: '100%',
    height: '100%',
  },
  exercisedetails: {
    flexDirection: 'row',
    marginLeft: '3%',
    justifyContent: 'space-around',
    width: '80%'
  },
  exerciseText: {
    marginLeft: '3%',
    fontSize: 15,
    fontFamily: 'poppins600',
  },
  even: {
    backgroundColor: '#A9D3AB',
  },
  odd: {
    backgroundColor: '#6ABDA6',
  },
  colorback1: {
    backgroundColor: '#A9D3AB',
  },
  colorback2: {
    backgroundColor: '#E7E6E6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInfo: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'poppins500',
    paddingTop: '5%',
    color: 'gray'
  },
  contemptyIT: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30%'
  },
  imgvacio: {
    width: 120,
    height: 120,
  },
  textvacio: {
    fontSize: 18,
    fontFamily: 'poppins500',
    color: '#8C908E'
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAdd: {
    width: 255,
    height: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#BEEADD',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgAdd: {
    width: '100%',
    height: '100%',
  },
  textAdd: {
    fontSize: 18,
    fontFamily: 'poppins600',
    marginLeft: 7
  },
});

export default ListDetailsExercises;
import { useState, useContext, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Title from '../components/Title';
import ListMyExercise from '../components/ListMyExercise';
import imgadd from '../images/Icons/add.png';
import imgplay from '../images/Icons/play.png';
import imgstop from '../images/Icons/stop.png';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { collection, getDocs, query, addDoc, deleteDoc, doc, where, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';
import Message from '../components/Message';
import LoadingModal from '../components/ModalLoading';
import { Verificar_conexion } from '../components/CheckConnection';

const MyRoutinesDetails = () => {
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const { id, name } = route.params;
  const routine = { id, name };
  const navigation = useNavigation();
  const [isStarted, setIsStarted] = useState(false);
  const [myExercises, setMyExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trainingId, setTrainingId] = useState('');
  const [routinegoing, setRoutinegoing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleF, setModalVisibleF] = useState(false);
  const [disableEandD, setDisableEandD] = useState(false);
  const [disableBtns, setDisableBtns] = useState(false);

  const userId = user.id;

  const checkOngoingTraining = async () => {
    try {
      const ongoingRoutineString = await AsyncStorage.getItem('ongoingRoutine');
      if (ongoingRoutineString) {
        const dataRoutine = JSON.parse(ongoingRoutineString);
        setRoutinegoing(dataRoutine);
        const ongoingRoutineId = dataRoutine.id;
        const ongoingTrainingId = await AsyncStorage.getItem('ongoingTrainingId');
        if (ongoingTrainingId) {
          setTrainingId(ongoingTrainingId);
          if (ongoingRoutineId === id) {
            setDisableEandD(true);
            const trainingData = await AsyncStorage.getItem(`training_${ongoingTrainingId}`);
            if (trainingData) {
              setIsStarted(true);
            }
          }
        }
      } else {
        setRoutinegoing(null);
        setIsStarted(false);
        setTrainingId('');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrio un error al obtener los datos del entrenamiento actual');
    }
  };

  const navigationOnGoingRoutine = () => {
    navigation.navigate('MisRutinas', { id: routinegoing.id, name: routinegoing.name });
    setModalVisible(false);
  }

  const fetchMyExercises = async () => {
    if (userId) {
      if (await Verificar_conexion()) {
        setIsLoading(true);
        try {
          const q = query(collection(db, `users/${userId}/details`), where('routineId', '==', id));
          const myExercisesSnapshot = await getDocs(q);
          if (!myExercisesSnapshot.empty) {
            const data = myExercisesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setMyExercises(data);
          } else {
            setMyExercises([]);
          }
        } catch (error) {
          Alert.alert('Error','Ocurrio un error al obtener los ejercicios')
          setMyExercises([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        Alert.alert('Error', 'No hay conexión a internet');
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyExercises().then(() => setRefreshing(false));
  };

  useFocusEffect(
    useCallback(() => {
      checkOngoingTraining();
      fetchMyExercises();
    }, [id])
  );

  const createTraining = async () => {
    if (await Verificar_conexion()) {
      setDisableEandD(true)
      setIsLoadingModal(true)
      try {
        const exercisesData = myExercises.map(exercise => ({
          idDetails: exercise.id,
          exercise: exercise.exercise,
          reps: exercise.reps,
          series: Array.from({ length: exercise.series }, (_, index) => ({
            reps: exercise.reps,
            weight: exercise.weight[0],
            unit: exercise.weight[1],
            add: false
          }))
        }));

        const trainingRef = await addDoc(collection(db, `users/${userId}/training`), {
          routineId: id,
          startTime: new Date(),
          endTime: null,
          exercises: exercisesData
        });

        const idTraining = trainingRef.id;
        setTrainingId(idTraining);
        await AsyncStorage.setItem('ongoingTrainingId', idTraining);
        await AsyncStorage.setItem('ongoingRoutine', JSON.stringify(routine));
        setIsLoadingModal(false)
        navigation.navigate('Entrenando', { idTraining, name });
      } catch (error) {
        Alert.alert('Error','Ocurrio un error al crear la rutina');
      } finally {
        setDisableEandD(false)
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet');
    }
  };

  const handleStartStop = async () => {
    if (routinegoing) {
      if (routinegoing.id !== id) {
        setModalVisible(true);
        return;
      }
    }
    if (!isStarted) {
      if (myExercises.length === 0) {
        Alert.alert('Error', 'No hay ejercicios en su rutina');
        return;
      }
      createTraining();
      setIsStarted(true);
    } else {
      setModalVisibleF(true);
    }
  };

  const finishRoutine = async () => {
    setDisableBtns(true)
    try {
      await AsyncStorage.removeItem('ongoingRoutine');
      await AsyncStorage.removeItem('ongoingTrainingId');
      await AsyncStorage.removeItem(`training_${trainingId}`)
      setTrainingId('');
      setIsStarted(false);
      setRoutinegoing(null);
      setModalVisibleF(false);
      setDisableEandD(false);
    } catch (error) {
      Alert.alert('Error','Ocurrio un error al finalizar la rutina');
    } finally {
      setDisableBtns(false);
    }
  }

  const saveTraining = async () => {
    if (await Verificar_conexion()) {
      try {
        // Referencia al documento en Firestore
        const trainingRef = doc(db, `users/${userId}/training/${trainingId}`);

        // Actualizar el campo endTime con la fecha actual
        await updateDoc(trainingRef, {
          endTime: new Date()
        });

      } catch (error) {
        Alert.alert('Error','Ocurrio un error al guardar el entrenamiento');
      } finally {
        finishRoutine()
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };


  const navigationTraining = () => {
    navigation.navigate('Entrenando', { idTraining: trainingId, name });
  }

  const handleNavigation = () => {
    navigation.navigate('Categorias', { id, name });
  };

  const onPanGestureEvent = (event) => {
    if (isStarted && event.nativeEvent.translationX < -50) {
      navigation.navigate('Entrenando', { idTraining: trainingId, name });
    }
  };

  const deleteTraining = async () => {
    if (await Verificar_conexion()) {
      setDisableBtns(true)
      try {
        const trainingDocRef = doc(db, `users/${userId}/training/${trainingId}`);
        await deleteDoc(trainingDocRef);
        Alert.alert('Mensaje', 'Entrenamiento eliminado')
      } catch (error) {
        Alert.alert('Error', 'No se pudo eliminar el entrenamiento')
      } finally {
        await finishRoutine();
      }
    }
  };

  const handleFinishRoutinePrompt = () => {
    setModalVisible(false);
    setModalVisibleF(true);
  };

  const closeModalF = () => {
    setModalVisibleF(false)
  }

  const closeModal = () => {
    setModalVisible(false);
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingModal isVisible={isLoadingModal} message={'Creando entrenamiento'} />
      <Message
        visible={modalVisible}
        message={'Ya hay una rutina en progreso'}
        txtbtn1={'Ir a la rutina'}
        funtion1={navigationOnGoingRoutine}
        txtbtn2={'Concluir la rutina'}
        funtion2={handleFinishRoutinePrompt}
        disable={disableBtns}
        onClose={closeModal}
      />
      <Message
        visible={modalVisibleF}
        message={'¿Quieres guardar los datos de la rutina?'}
        txtbtn1={'Guardar'}
        funtion1={saveTraining}
        txtbtn2={'Eliminar'}
        funtion2={deleteTraining}
        disable={disableBtns}
        onClose={closeModalF}
      />
      <PanGestureHandler onGestureEvent={onPanGestureEvent}>
        <View>
          <View style={styles.contTitle}>
            <Title title={name} />
          </View>
          <View style={styles.contBtns}>
            <View style={[styles.buttonplay, isStarted ? styles.buttonStop : styles.buttonStart]}>
              <TouchableOpacity onPress={handleStartStop}>
                <View style={styles.btnplay}>
                  <View style={styles.PlayIconContainer}>
                    <Image
                      source={isStarted ? imgstop : imgplay}
                      style={styles.imageplay}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.textplay}>
                    {isStarted ? 'Terminar' : 'Iniciar'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {isStarted ? (
              <TouchableOpacity onPress={navigationTraining}>
                <View style={styles.btntraining}>
                  <Text style={styles.texttraining}>Ir a entrenamiento</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </PanGestureHandler>
      <View style={styles.contlist}>
        <ListMyExercise
          userId={userId}
          routineId={id}
          myExercises={myExercises}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onExerciseUpdated={fetchMyExercises}
          onRefresh={onRefresh}
          refreshing={refreshing}
          disable={disableEandD}
        />
      </View>
      {!disableEandD ? (
        <View style={styles.button}>
          <TouchableOpacity onPress={handleNavigation}>
            <View style={styles.btnAdd}>
              <View style={styles.addIconContainer}>
                <Image source={imgadd} style={styles.imgAdd} resizeMode="contain" />
              </View>
              <Text style={styles.textAdd}>Agregar ejercicio</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
    </KeyboardAvoidingView>


  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contTitle: {
    marginTop: '10%',
    marginHorizontal: '4%',
  },
  contlist: {
    height: '55%',
  },
  buttonplay: {
    marginLeft: '4%',
    padding: 4,
    marginBottom: '2%',
    borderRadius: 30,
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
    borderWidth: 1
  },
  contBtns: {
    flexDirection: 'row',
    width: '96%',
    justifyContent: 'space-between',
  },
  buttonStart: {
    width: 120,
    backgroundColor: '#6ABDA6',
    borderColor: '#64AF9A',
  },
  buttonStop: {
    width: 120,
    backgroundColor: '#FF5D57',
    borderColor: '#FF4B4A',
  },
  btnplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btntraining: {
    alignItems: 'center',
    width: 135,
    backgroundColor: '#71A8B2',
    borderRadius: 30,
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
  PlayIconContainer: {
    width: 37,
    height: 37,
  },
  imageplay: {
    width: 35,
    height: 37,
  },
  textplay: {
    fontFamily: 'poppins500',
    fontSize: 15,
    color: 'white',
    marginLeft: '4%',
  },
  texttraining: {
    fontFamily: 'poppins500',
    fontSize: 15,
    color: 'white',
    textAlign: 'center'
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '85%',
  },
  btnAdd: {
    width: 220,
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
    marginLeft: 7,
  },
});

export default MyRoutinesDetails;

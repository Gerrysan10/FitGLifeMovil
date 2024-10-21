import { useState, useEffect, useContext, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Title from '../components/Title';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';
import imgadd from '../images/Icons/add.png';
import imgsubtract from '../images/Icons/subtract.png';
import imgfinish from '../images/Icons/Finish.png';
import { AuthContext } from '../AuthContext';
import Message from '../components/Message';
import { useNavigation } from '@react-navigation/native';
import ModalWeigthReps from '../components/ModalWeigthReps';
import UpdateSeriesModal from '../components/ModalUpdateSeries';
import LoadingModal from '../components/ModalLoading';
import { Verificar_conexion } from '../components/CheckConnection';

const WorkingScreen = () => {
  const { user } = useContext(AuthContext);
  const route = useRoute();
  const userId = user.id;
  const navigation = useNavigation();
  const { idTraining, name } = route.params;
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [dataWorking, setDataWorking] = useState([]);
  const currentExercise = exercises[currentExerciseIndex];
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
  const [modalVisibleConfirm, setModalVisibleConfirm] = useState(false);
  const [disableBtns, setDisableBtns] = useState(false);
  const [disableBtnSave, setDisableBtnSave] = useState(false);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const fetchTrainingDetails = async () => {
    try {
      const storedState = await AsyncStorage.getItem(`training_${idTraining}`);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setExercises(parsedState.exercises);
        setCurrentExerciseIndex(parsedState.currentExerciseIndex);
        setDataWorking(parsedState.dataWorking);
        setCompletedExercises(parsedState.completedExercises || 0);
        return;
      }

      if (await Verificar_conexion()) {
        const trainingRef = doc(db, `users/${userId}/training/${idTraining}`);
        const trainingDoc = await getDoc(trainingRef);

        if (trainingDoc.exists()) {
          const trainingData = trainingDoc.data();

          const exercisesData = await Promise.all(
            trainingData.exercises.map(async (exercise) => {
              const exerciseRef = exercise.exercise;
              const exerciseDoc = await getDoc(exerciseRef);

              if (exerciseDoc.exists()) {
                return {
                  id: exercise.idDetails,
                  ...exerciseDoc.data(),
                  seriesData: exercise.series.map(serie => ({
                    ...serie,
                    reps: serie.reps,
                    weight: serie.weight || 0,
                    unit: serie.unit,
                    add: false
                  })),
                  currentSeries: 1,
                  series: exercise.series.length,
                  reps: exercise.reps,
                  isCompleted: false
                };
              } else {
                Alert.alert('Error', 'Ocurrio un error al obtener el entrenamiento')
                return null;
              }
            })
          );

          setExercises(exercisesData);
          await AsyncStorage.setItem(`training_${idTraining}`, JSON.stringify({
            exercises: exercisesData,
            currentExerciseIndex: 0,
            dataWorking: [],
            completedExercises: 0
          }));
        } else {
          Alert.alert('Error', 'Ocurrio un error al obtener el entrenamiento')
        }
      }else{
        Alert.alert('Error', 'No hay conexión a internet')
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrio un error al obtener el entrenamiento');
    }
  };

  useEffect(() => {
    fetchTrainingDetails();
  }, [idTraining]);

  useFocusEffect(
    useCallback(() => {
      fetchTrainingDetails();
    }, [idTraining])
  );

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(`training_${idTraining}`, JSON.stringify({
        exercises,
        currentExerciseIndex,
        dataWorking,
        completedExercises
      }));
    } catch (error) {
      Alert.alert('Error', 'Ocurrio un error al guardar el entrenamiento');
    }
  };

  useEffect(() => {
    saveState();
  }, [exercises, currentExerciseIndex, dataWorking, completedExercises]);

  const incrementValue = (field) => {
    setExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
      const exercise = { ...updatedExercises[currentExerciseIndex] };
      const { currentSeries, seriesData } = exercise;

      if (field === 'currentSeries') {
        if (currentSeries < exercise.series) {
          exercise.currentSeries++;
        }
      } else {
        const updatedSeriesData = [...seriesData];
        updatedSeriesData[currentSeries - 1] = {
          ...updatedSeriesData[currentSeries - 1],
          [field]: (updatedSeriesData[currentSeries - 1][field] || 0) + 1,
        };
        exercise.seriesData = updatedSeriesData;
      }

      updatedExercises[currentExerciseIndex] = exercise;
      return updatedExercises;
    });
  };

  const decrementValue = (field) => {
    setExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
      const exercise = { ...updatedExercises[currentExerciseIndex] };
      const { currentSeries, seriesData } = exercise;

      if (field === 'currentSeries') {
        // Decrementa el currentSeries solo si es mayor a 1
        if (currentSeries > 1) {
          exercise.currentSeries--;
        }
      } else {
        const updatedSeriesData = [...seriesData];

        // Si el campo es 'reps', no dejes que baje de 1
        if (field === 'reps') {
          if (updatedSeriesData[currentSeries - 1][field] > 1) {
            updatedSeriesData[currentSeries - 1] = {
              ...updatedSeriesData[currentSeries - 1],
              [field]: updatedSeriesData[currentSeries - 1][field] - 1,
            };
          }
        } else {
          // Para otros campos, solo asegúrate de que no baje de 0
          if (updatedSeriesData[currentSeries - 1][field] >= 0 && updatedSeriesData[currentSeries - 1][field] - 1 >= 0) {
            updatedSeriesData[currentSeries - 1] = {
              ...updatedSeriesData[currentSeries - 1],
              [field]: updatedSeriesData[currentSeries - 1][field] - 1,
            };
          }
        }

        exercise.seriesData = updatedSeriesData;
      }

      updatedExercises[currentExerciseIndex] = exercise;
      return updatedExercises;
    });
  };

  const stateAdd = (newWeight, newReps) => {
    const updatedExercises = exercises.map((exercise, index) => {
      if (index === currentExerciseIndex) {
        const updatedSeriesData = exercise.seriesData.map((serie, seriesIndex) => {
          if (seriesIndex === exercise.currentSeries - 1) {
            return {
              ...serie,
              add: true,
              weight: parseFloat(newWeight),
              reps: parseInt(newReps)
            };
          }
          return serie;
        });
        return { ...exercise, seriesData: updatedSeriesData };
      }
      return exercise;
    });

    const updatedExercise = updatedExercises[currentExerciseIndex];

    setExercises(updatedExercises);

    return updatedExercise;
  };

  const handleSave = async (newWeight, newReps) => {
    setDisableBtnSave(true)
    try {
      //obtener estructura del entrenamiento
      const trainingRef = doc(db, `users/${userId}/training/${idTraining}`);
      const trainingSnap = await getDoc(trainingRef);
      if (!trainingSnap.exists()) {
        Alert.alert('Error', 'No se encontro la referencia al entrenamiento')
      }
      //obtener información del entrenamiento
      const trainingData = trainingSnap.data();
      //obtener estructura de los ejercicios
      const updatedExercises = [...trainingData.exercises];
      //obtener el ejercicio especifico y cambiar sus datos de la serie
      updatedExercises[currentExerciseIndex] = {
        ...updatedExercises[currentExerciseIndex],
        series: await stateAdd(newWeight, newReps).seriesData
      };
      //guardar todos los ejercicios con los cambios
      await updateDoc(trainingRef, {
        exercises: updatedExercises
      });

      const currentExercise = exercises[currentExerciseIndex];
      if (currentExercise.currentSeries >= currentExercise.series) {
        if (!currentExercise.isCompleted) {
          setExercises(prevExercises => {
            const newExercises = [...prevExercises];
            newExercises[currentExerciseIndex] = {
              ...newExercises[currentExerciseIndex],
              isCompleted: true
            };
            return newExercises;
          });
          setCompletedExercises(prev => prev + 1);
        }

        if (completedExercises + 1 === exercises.length) {
          setModalVisible(true);
        } else {
          const nextUncompletedIndex = exercises.findIndex((exercise, index) => index > currentExerciseIndex && !exercise.isCompleted);
          if (nextUncompletedIndex !== -1) {
            setCurrentExerciseIndex(nextUncompletedIndex);
          } else {
            const firstUncompletedIndex = exercises.findIndex(exercise => !exercise.isCompleted);
            setCurrentExerciseIndex(firstUncompletedIndex !== -1 ? firstUncompletedIndex : 0);
          }
        }
      } else {
        incrementValue('currentSeries');
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Ocurrio un error al guardar los datos');
    } finally {
      setDisableBtnSave(false);
    }
  };


  const finishRoutine = async () => {
    setDisableBtns(true)
    try {
      await AsyncStorage.removeItem('ongoingRoutine');
      await AsyncStorage.removeItem('ongoingTrainingId');
      await AsyncStorage.removeItem(`training_${idTraining}`);
      setModalVisible(false);
      navigation.goBack()
    } catch (error) {

    }
  }

  const saveTraining = async () => {
    if (await Verificar_conexion()) {
      try {
        // Referencia al documento en Firestore
        const trainingRef = doc(db, `users/${userId}/training/${idTraining}`);

        // Actualizar el campo endTime con la fecha actual
        await updateDoc(trainingRef, {
          endTime: new Date()
        });
        Alert.alert('Mensaje', 'El entrenamiento se ha guardado con éxito!')
        console.log('Training actualizado con endTime');
      } catch (error) {
        Alert.alert('Error', 'Ocurrio un error al guardar el entrenamiento')
      } finally {
        finishRoutine()
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };

  const deleteTraining = async () => {
    if (await Verificar_conexion()) {
      setDisableBtns(true)
      try {
        const trainingDocRef = doc(db, `users/${userId}/training/${idTraining}`);
        await deleteDoc(trainingDocRef);
      } catch (error) {
        Alert.alert('Error', 'Ocurrio un error al eliminar el entrenamiento')
      } finally {
        await finishRoutine();
      }

    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };

  const openModalUpdateData = () => {
    setUpdateModalVisible(true);
  };

  const handleUpdateExercise = (seriesData) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      newExercises[currentExerciseIndex].seriesData = seriesData;
      return newExercises;
    });
  };


  const openModalConfirm = () => {
    setModalVisibleConfirm(true)
  }

  const closeModalConfirm = () => {
    setModalVisibleConfirm(false)
  }

  const closeModal = () => {
    setModalVisible(false);
  };

  const closeModalEdit = () => {
    setModalVisibleEdit(false)
  }


  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Message
        visible={modalVisible}
        message={'Entrenamiendo completado!!! \n ¿Quieres guardar los datos de la rutina?'}
        txtbtn1={'Guardar'}
        funtion1={saveTraining}
        txtbtn2={'Eliminar'}
        funtion2={openModalConfirm}
        disable={disableBtns}
        onClose={closeModal}
      />
      <Message
        visible={modalVisibleConfirm}
        message={'¿Estás seguro de eliminar los datos de la rutina?'}
        txtbtn1={'Eliminar'}
        funtion1={deleteTraining}
        txtbtn2={'Cancelar'}
        funtion2={closeModalConfirm}
        disable={disableBtns}
        onClose={closeModalConfirm}
      />
      <ModalWeigthReps
        isVisible={modalVisibleEdit}
        weigth={currentExercise?.seriesData[currentExercise.currentSeries - 1]?.weight}
        reps={currentExercise?.seriesData[currentExercise.currentSeries - 1]?.reps}
        update={handleSave}
        onClose={closeModalEdit}
      />
      <UpdateSeriesModal
        isVisible={updateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
        exercise={currentExercise ? { ...currentExercise, index: currentExerciseIndex } : null}
        userId={userId}
        trainingId={idTraining}
        onUpdate={handleUpdateExercise}
        setModalLoading={setLoadingModalVisible}
      />
      <LoadingModal isVisible={loadingModalVisible} message={'Actualizando datos'} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.cont}>
          <View style={styles.title}>
            <Title title={name} />
          </View>
          <View style={styles.contExercise}>
            <View style={styles.controw}>
              <View style={styles.contVideo}>
                <WebView source={{ uri: currentExercise?.link }} style={styles.video} />
              </View>
              <TouchableOpacity style={styles.contInfoExercise} onPress={openModalUpdateData}>
                <View style={styles.headtable}>
                  <Text style={[styles.titletable, { width: '30%' }]}>Serie</Text>
                  <Text style={[styles.titletable, { width: '30%' }]}>Reps</Text>
                  <Text style={[styles.titletable, { width: '40%' }]}>Peso</Text>
                </View>
                {currentExercise?.seriesData?.map((serie, index) => (
                  <ScrollView>
                    <View style={styles.conttable} key={index}>
                      <Text style={[styles.texttable, { width: '30%' }]}>{index + 1}</Text>
                      <Text style={[styles.texttable, { width: '30%' }]}>
                        {(serie.isModified || index < currentExercise.currentSeries) ? serie.reps : '-'}
                      </Text>
                      <Text style={[styles.texttable, { width: '40%' }]}>
                        {(serie.isModified || index < currentExercise.currentSeries) ? `${serie.weight} ${serie.unit}` : '-'}
                      </Text>
                    </View>
                  </ScrollView>
                ))}
              </TouchableOpacity>
            </View>
            <View style={styles.contNext}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {exercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.circleButton,
                      currentExerciseIndex === index && styles.activeCircleButton,
                    ]}
                    onPress={() => setCurrentExerciseIndex(index)}
                  >
                    <Image source={{ uri: exercise.image }} style={styles.circleImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.contInfoseries}>
            <Text style={styles.textinfoseries}>Serie</Text>
            <Text style={styles.textseries}>{currentExercise?.currentSeries}/{currentExercise?.series}  </Text>
            <Text style={styles.textinfoseries}>{currentExercise?.name}</Text>
          </View>
          <View style={styles.contDataExercise}>
            <View style={styles.dataInput}>
              <Text style={styles.textInput}>Peso</Text>
              <TouchableOpacity style={styles.touchInput} onPress={() => { setModalVisibleEdit(true) }}>
                <TextInput
                  value={`${currentExercise?.seriesData[currentExercise.currentSeries - 1]?.weight || 0}`}
                  style={styles.input}
                  editable={false}
                />
              </TouchableOpacity>
              <View style={styles.inputControls}>
                <TouchableOpacity onPress={() => decrementValue('weight')}>
                  <Image source={imgsubtract} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => incrementValue('weight')}>
                  <Image source={imgadd} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.dataInput}>
              <Text style={styles.textInput}>Reps</Text>
              <TouchableOpacity style={styles.touchInput} onPress={() => { setModalVisibleEdit(true) }}>
                <TextInput
                  value={`${currentExercise?.seriesData[currentExercise.currentSeries - 1]?.reps || 1}`}
                  style={styles.input}
                  editable={false}
                />
              </TouchableOpacity>
              <View style={styles.inputControls}>
                <TouchableOpacity onPress={() => decrementValue('reps')}>
                  <Image source={imgsubtract} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => incrementValue('reps')}>
                  <Image source={imgadd} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => { handleSave(currentExercise?.seriesData[currentExercise.currentSeries - 1]?.weight, currentExercise?.seriesData[currentExercise.currentSeries - 1]?.reps); }}
              style={styles.buttonFinish}
              disabled={disableBtnSave}>
              <Image source={imgfinish} style={styles.iconfinish} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  cont: {
    marginHorizontal: '4%',
    flex: 1,
  },
  title: {
    marginTop: '10%',
  },
  contExercise: {
    width: '100%',
    height: 250,
  },
  controw: {
    flexDirection: 'row',
    height: '85%',
  },
  contVideo: {
    width: '50%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  contInfoExercise: {
    width: '50%',
    padding: 10,
    backgroundColor: '#DFE9DF'
  },
  headtable: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  titletable: {
    fontSize: 15,
    fontFamily: 'poppins600',
    textAlign: 'center',
  },
  conttable: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  texttable: {
    fontSize: 15,
    fontFamily: 'poppins500',
    textAlign: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contNext: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#73BE73',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'gray',
  },
  activeCircleButton: {
    borderColor: '#FFCC4D',
  },
  circleImage: {
    width: 35,
    height: 35,
    borderRadius: 35,
  },
  contInfoseries: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  textinfoseries: {
    fontFamily: 'poppins600',
    fontSize: 16,
  },
  textseries: {
    fontFamily: 'poppins500',
    fontSize: 16,
  },
  contDataExercise: {
    height: 280,
    justifyContent: 'space-around',
  },
  dataInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    marginVertical: 10,
  },
  textInput: {
    fontFamily: 'poppins600',
    fontSize: 17,
  },
  touchInput: {
    width: '50%',
    height: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    textAlign: 'center',
    fontFamily: 'poppins500',
    fontSize: 17,
    color: 'black'
  },
  inputControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '23%',
  },
  icon: {
    width: 30,
    height: 30,
  },
  saveButton: {
    alignSelf: 'center',
  },
  iconfinish: {
    width: 50,
    height: 51,
  },
  buttonFinish: {
    alignSelf: 'center',
    marginVertical: 10,
  }
});

export default WorkingScreen;

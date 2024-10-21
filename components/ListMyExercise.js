import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Platform, ActivityIndicator, RefreshControl, ScrollView, Alert } from 'react-native';
import { getDoc } from 'firebase/firestore';
import imgdelete from '../images/Icons/delete.png';
import ModalDelete from './ModalDelete';
import ModalUpdateExercise from './ModalUpdateExercise';
import imgvacio from '../images/Icons/vacio.png';
import { db } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { Verificar_conexion } from './CheckConnection';

const ListMyExercise = ({ userId, routineId, myExercises, isLoading, setIsLoading, onExerciseUpdated, onRefresh, refreshing, disable }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleUpdate, setIsModalVisibleUpdate] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [exercisesWithData, setExercisesWithData] = useState([]);
  const [selectExercise, setSelectExercise] = useState(null);

  useEffect(() => {
    fetchExerciseData();
  }, [myExercises]);

  const fetchExerciseData = async () => {
    if (myExercises && myExercises.length > 0) {
      if (await Verificar_conexion()) {
        setIsLoading(true);
      try {
        const exercisesData = await Promise.all(
          myExercises.map(async (exerciseItem) => {
            const exerciseDoc = await getDoc(exerciseItem.exercise);
            const exerciseData = exerciseDoc.data();
            return {
              ...exerciseItem,
              exerciseData: exerciseData
            };
          })
        );
        setExercisesWithData(exercisesData);
      } catch (error) {
        setExercisesWithData([]);
        Alert.alert('Error','Ocurrio un error al obtener los ejercicios');
      } finally {
        setIsLoading(false);
      }
      }else{
        Alert.alert('Error','No hay conexion a internet');
      }
    } else {
      setExercisesWithData([]);
      setIsLoading(false);
    }
  };

  const openModal = (id) => {
    setSelectedExerciseId(id);
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    if (await Verificar_conexion()) {
      try {
        const exerciseRef = doc(db, `users/${userId}/details/${selectedExerciseId}`);
        await deleteDoc(exerciseRef);
        closeModal();
        onExerciseUpdated();
      } catch (error) {
        Alert.alert('Error','Error al eliminar el ejercicio')
      }
    }else{
      Alert.alert('Error','No hay conexion a internet, error al eliminar el ejercicio');
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedExerciseId(null);
  };

  const openModalUpdate = (exercise) => {
    if (!disable) {
      setSelectExercise(exercise);
      setIsModalVisibleUpdate(true);
    }
  };

  const closeModalUpdate = () => {
    setIsModalVisibleUpdate(false);
    setSelectExercise(null);
  };

  const routineItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => openModalUpdate(item)}
      style={[styles.routineItem, index % 2 === 0 ? styles.even : styles.odd]}
    >
      <View style={[styles.contImg, index % 2 === 0 ? styles.colorback1 : styles.colorback2]}>
        <Image
          source={{ uri: item.exerciseData?.image}}
          style={styles.routineImage}
        />
      </View>
      <View style={styles.contcard}>
        <View style={styles.carddetails}>
          <Text style={styles.exerciseText}>{item.exerciseData?.name}</Text>
          <View style={styles.exercisedetails}>
            <Text>Series: {item.series}</Text>
            <Text>Reps: {item.reps}</Text>
            <Text>Peso: {item.weight[0]} {item.weight[1]}</Text>
          </View>
        </View>
        {!disable && (
          <TouchableOpacity style={styles.contdelete} onPress={() => openModal(item.id)}>
            <Image source={imgdelete} style={styles.imagedelete} />
          </TouchableOpacity>
        )}
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
        <FlatList
          data={exercisesWithData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={routineItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <View style={styles.contemptyIT}>
            <Image style={styles.imgvacio} source={imgvacio} />
            <Text style={styles.textvacio}>Sin ejercicios</Text>
          </View>
        </ScrollView>
      )}
      <ModalDelete
        message={'¿Quieres eliminar el ejercicio de la rutina?'}
        isVisible={isModalVisible}
        onClose={closeModal}
        function1={handleDelete}
      />
      {selectExercise && (
        <ModalUpdateExercise
          userId={userId}
          routineId={routineId}
          isVisible={isModalVisibleUpdate}
          onClose={closeModalUpdate}
          exercise={selectExercise}
          onExerciseUpdated={onExerciseUpdated}
          activate={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  contdelete: {
    width: '4%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imagedelete: {
    width: 20,
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  }
});

export default ListMyExercise;
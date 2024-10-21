import { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, Platform, SafeAreaView,Alert } from 'react-native';
import HeaderSearch from '../components/HeaderSearch';
import ListExercise from '../components/ListExercise';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../firebase';
import imgadd from '../images/Icons/add.png';
import ModalNewExercise from '../components/ModalNewExercises';
import LoadingModal from '../components/ModalLoading';
import ModalEditExercise from '../components/ModalEditExercises';
import ModalDelete from '../components/ModalDelete';
import { Verificar_conexion } from '../components/CheckConnection';

const ExerciseScreen = () => {
  const route = useRoute();
  const { id, name, nameExercise } = route.params;
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]); // Estado para ejercicios filtrados
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
  const [modalVisibleDelete, setModalVisibleDelete] = useState(false);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user } = useContext(AuthContext);
  const idUser = user.id;
  const uidUser = user.uid;

  // Función para obtener ejercicios tanto públicos como creados por el usuario
  const fetchExercises = async () => {
    if (await Verificar_conexion()) {
      setIsLoading(true);
      try {
        const exercisesQuery = query(
          collection(db, 'exercises'),
          where('category', 'array-contains', nameExercise)
        );
        const exerciseSnapshot = await getDocs(exercisesQuery);
        const generalExercises = exerciseSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userExercisesQuery = query(
          collection(db, `users/${idUser}/createExercises`),
          where('category', 'array-contains', nameExercise)
        );
        const userExerciseSnapshot = await getDocs(userExercisesQuery);
        const userExercises = userExerciseSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const combinedExercises = [...generalExercises, ...userExercises];
        setExercises(combinedExercises);
        setFilteredExercises(combinedExercises); // Inicialmente muestra todos los ejercicios
      } catch (error) {
        Alert.alert('Error','Ocurrio un error al obtener los ejercicios')
      } finally {
        setIsLoading(false);
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };

  // Función para manejar la búsqueda de ejercicios
  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredExercises(exercises); // Si no hay texto, muestra todos los ejercicios
    } else {
      const filtered = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  };

  const modalClose = () => {
    setModalVisible(false);
  };

  const modalOpenLoading = () => {
    setModalVisibleLoading(true);
  };

  const modalOpenEdit = (exercise) => {
    if (exercise.create) {
      setExercise(exercise)
      setModalVisibleEdit(true);
    }
  };

  const modalCloseLoading = () => {
    setModalVisibleLoading(false);
    fetchExercises();
  };

  const openDeleteModal = () => {
    setModalVisibleDelete(true);
  };

  const closeDeleteModal = () => {
    setModalVisibleDelete(false);
  };

  const confirmDeleteFalse = () => {
    setConfirmDelete(false);
  };

  useEffect(() => {
    fetchExercises();
  }, [nameExercise]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderSearch title={'Selecciona tus ejercicios'} functionsearch={handleSearch} />
        <ListExercise
          userId={idUser}
          routineId={id}
          routineName={name}
          ListExercises={filteredExercises}
          isLoading={isLoading}
          openEdit={modalOpenEdit}
        />
        <View style={styles.button}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.btnAdd}>
              <View style={styles.addIconContainer}>
                <Image source={imgadd} style={styles.imgAdd} resizeMode="contain" />
              </View>
              <Text style={styles.textAdd}>Crear ejercicio</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ModalNewExercise
        isVisible={modalVisible}
        idUser={idUser}
        uidUser={uidUser}
        onClose={modalClose}
        openLoading={modalOpenLoading}
        onCloseLoading={modalCloseLoading}
      />
      <ModalEditExercise
        isVisible={modalVisibleEdit}
        idUser={idUser}
        uidUser={uidUser}
        onClose={() => setModalVisibleEdit(false)}
        openLoading={modalOpenLoading}
        onCloseLoading={modalCloseLoading}
        exercise={exercise}
        openDeleteModal={openDeleteModal}
        confirmdelete={confirmDelete}
        confirmdeletefalse={confirmDeleteFalse}
        closedeleteExercise={closeDeleteModal}
      />
      <ModalDelete isVisible={modalVisibleDelete} message={'¿Desea eliminar este ejercicio?'} onClose={closeDeleteModal} function1={() => {
        setConfirmDelete(true);
      }} />
      <LoadingModal isVisible={modalVisibleLoading} message={'Realizando operación, espere un momento...'} />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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

export default ExerciseScreen;

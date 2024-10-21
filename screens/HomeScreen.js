import { useState, useContext,useCallback} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import ModalAdd from '../components/ModalAgregar';
import HeaderSearch from '../components/HeaderSearch';
import ListMyRoutines from '../components/ListMyRoutines';
import imgadd from '../images/Icons/add.png';
import { AuthContext } from '../AuthContext';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase';
import { useFocusEffect } from '@react-navigation/native';
import LoadingModal from '../components/ModalLoading';
import { Verificar_conexion } from '../components/CheckConnection';


const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]); 
  const [searchText, setSearchText] = useState(''); 
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const userId = user.id;
  const userUid = user.uid;

  const fetchRoutines = async () => {
    if (await Verificar_conexion()) {
      if (userId) {
        setIsLoading(true);
        try {
          const routinesQuery = query(collection(db, `users/${userId}/routines`), orderBy("createdAt", "asc"));
          const routinesSnapshot = await getDocs(routinesQuery);
          const data = routinesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRoutines(data);
          setFilteredRoutines(data);  
        } catch (error) {
          Alert.alert('Error','Ocurrio un error, no se pudieron obtener tus rutinas')
        } finally {
          setIsLoading(false);
        }
      }
    }else{
      Alert.alert('Error','No hay conexión a internet')
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutines()
    },[userId])
  );

  
  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredRoutines(routines); 
    } else {
      const filtered = routines.filter(routine => 
        routine.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRoutines(filtered);
    }
  };

  return (
    <>
    <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <HeaderSearch title={'Mis rutinas'} functionsearch={handleSearch} />
        <ListMyRoutines routines={filteredRoutines} isLoading={isLoading} reloading={fetchRoutines} userId={userId} userUid={userUid}/>
        <View style={styles.button}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.btnAdd}>
              <Image source={imgadd} style={styles.imgAdd} resizeMode="contain" />
              <Text style={styles.textAdd}>Agregar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {userId && (
        <ModalAdd
          userId={userId}
          uidUser={userUid}
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onAddRoutine={fetchRoutines} 
          setLoading={setIsLoadingModal} 
        />
      )}
      <LoadingModal isVisible={isLoadingModal} message={'Agregando rutina'}/>
    </>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor:'#fff',
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
  },
  btnAdd: {
    width: 150, 
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
  imgAdd: {
    width: '24%',  
    height: '100%', 
  },
  textAdd: {
    fontSize: 18,
    fontFamily: 'poppins600',
    marginLeft: 7, 
    textAlignVertical: 'center', 
  },
});

export default HomeScreen;

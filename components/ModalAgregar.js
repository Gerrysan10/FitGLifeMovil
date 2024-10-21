import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import iconoimg from '../images/Icons/iconimage.png';
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Verificar_conexion } from './CheckConnection';

const ModalAdd = ({ userId, uidUser, isVisible, onClose, onAddRoutine, setLoading }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRoutines = async () => {
    if (selectedImage === null || routineName === '') {
      Alert.alert('Error', 'Ingrese la imagen y el nombre de la rutina')
      return;
    }
    if (await Verificar_conexion()) {
      setLoading(true);
      const imageUrl = await uploadImage(selectedImage);
      try {
        await addDoc(collection(db, `users/${userId}/routines`), {
          name: routineName,
          image: imageUrl,
          createdAt: new Date(),
        });
        onAddRoutine();
        setRoutineName('');
        setSelectedImage(null);
        onClose();
      } catch (error) {
        Alert.alert('Error', 'Ocurrio un error al agregar la rutina')
      } finally {
        setLoading(false);
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };

  // Función para subir la imagen a Firebase Storage
  const uploadImage = async (uri) => {
    if (await Verificar_conexion()) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageId = Date.now().toString();
      const storageRef = ref(storage, `imagesUsers/user_${uidUser}_Routines/${imageId}`);
      const snapshot = await uploadBytes(storageRef, blob);

      // Obtener la URL de descarga una vez que la imagen se haya subido
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };

  useEffect(() => {
    if (isSubmitting) {
      addRoutines();
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };


  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  const closeModal = () => {
    onClose();
    setSelectedImage(null);
    setRoutineName('');
  };

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Agregar rutina</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la rutina"
          value={routineName}
          onChangeText={setRoutineName}
        />
        <TouchableOpacity
          style={[styles.imagePicker, selectedImage && styles.imagePickerWithImage]}
          onPress={pickImage}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.contsubir}>
              <Text style={styles.textPicker}>Seleccionar Imagen</Text>
              <Image source={iconoimg} style={styles.imgPicker} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnlisto} onPress={handleSubmit}>
            <Text style={styles.txtbtn}>Listo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnsalir} onPress={closeModal}>
            <Text style={styles.txtbtn}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#F1FFF6',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'poppins600',
  },
  input: {
    backgroundColor: '#E7E7E7',
    marginBottom: 20,
    padding: 8,
    borderRadius: 20,
    paddingLeft: 15,
    fontFamily: 'poppins600',
  },
  imagePicker: {
    backgroundColor: '#eee',
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 20,
    height: 40,
  },
  imagePickerWithImage: {
    width: 120,
    height: 120,
    padding: 0,
    justifyContent: 'center'
  },
  textPicker: {
    fontFamily: 'poppins600',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
  },
  btnlisto: {
    backgroundColor: '#6ABDA6',
    width: '40%',
    height: 35,
    justifyContent: 'center',
    borderRadius: 20,
  },
  btnsalir: {
    backgroundColor: '#FF5D57',
    width: '40%',
    height: 35,
    justifyContent: 'center',
    borderRadius: 20,
  },
  contsubir: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  txtbtn: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'poppins600',
  },
  imgPicker: {
    width: 28,
    height: 25,
  },
});

export default ModalAdd;

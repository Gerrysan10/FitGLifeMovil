import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, collection, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imgdelete from '../images/Icons/delete.png';
import ModalDelete from './ModalDelete';
import { Verificar_conexion } from './CheckConnection';


const ModalEdit = ({ userId, uidUser, routineId, isVisible, onClose, routineData, handleUpdateRoutine, modalVisibleLoading }) => {
  const [routineName, setRoutineName] = useState(routineData?.name || '');
  const [selectedImage, setSelectedImage] = useState(routineData?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false); // Controla el ModalDelete
  const updateRoutine = async () => {
    if (selectedImage === routineData.image && routineData.name === routineName) {
      onClose();
      return;
    }
    if (await Verificar_conexion()) {
      if (selectedImage != routineData.image) {
        modalVisibleLoading(true)
      }
      try {
        const routineRef = doc(db, `users/${userId}/routines/${routineId}`);
        await updateDoc(routineRef, {
          name: routineName,
          image: await uploadImageToStorage(selectedImage, routineData.image),
          updatedAt: new Date(),
        });
        onClose();
        handleUpdateRoutine();
      } catch (error) {
      } finally {
        modalVisibleLoading(false)
      }
    }
  };

  useEffect(() => {
    if (isSubmitting) {
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
    if (routineName === '' || selectedImage === null) {
      Alert.alert('Error', 'Complete los campos, por favor')
      return;
    }
    setIsSubmitting(true);
    updateRoutine();
  };

  // Función para obtener el path de la imagen desde la URL de Firebase Storage
  const getStoragePathFromUrl = (url) => {
    // Buscar la parte entre 'o/' y '?'
    const startIndex = url.indexOf("/o/") + 3;
    const endIndex = url.indexOf("?alt=media");
    const encodedPath = url.substring(startIndex, endIndex);

    // Decodificar el path (Firebase usa %2F para '/')
    const storagePath = decodeURIComponent(encodedPath);
    return storagePath;
  };

  const deleteImage = async (oldImageUrl) => {
    if (oldImageUrl) {
      if (oldImageUrl.includes('/routines')) {
        return;  // No elimines la imagen
      }
      if (await Verificar_conexion()) {
        const oldImageRef = ref(storage, getStoragePathFromUrl(oldImageUrl));
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
        }
      } else {
        Alert.alert('Error', 'No hay conexión a Internet')
      }
    }
  }
  const uploadImageToStorage = async (fileUri, oldImageUrl) => {
    if (fileUri === oldImageUrl) {
      return fileUri;
    }
    await deleteImage(oldImageUrl)
    if (await Verificar_conexion()) {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const imageId = Date.now().toString();
      const storageRef = ref(storage, `imagesUsers/user_${uidUser}_Routines/${imageId}`);
      const snapshot = await uploadBytes(storageRef, blob);

      // Obtener la URL de descarga una vez que la imagen se haya subido
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } else {
      Alert.alert('Error', 'No hay conexión a Internet');
    }
  };

  const handleDeleteRoutine = async () => {
    if (await Verificar_conexion()) {
      modalVisibleLoading(true)
      await deleteImage(routineData.image)
      try {
        // Referencia a la rutina
        const routineRef = doc(db, `users/${userId}/routines/${routineId}`);

        // Referencia a la subcolección details
        const detailsRef = collection(db, `users/${userId}/details`);

        // Crear una consulta para obtener los documentos en 'details' relacionados con la rutina
        const q = query(detailsRef, where('routineId', '==', routineId));
        const detailsSnapshot = await getDocs(q);

        // Recorrer y eliminar cada documento en 'details' relacionado con la rutina
        detailsSnapshot.forEach(async (detailDoc) => {
          await deleteDoc(detailDoc.ref);
        });

        await deleteDoc(routineRef);

        setIsModalDeleteVisible(false);
        onClose();
        handleUpdateRoutine();
      } catch (error) {
        Alert.alert('Error','Error al eliminar la rutina');
      } finally {
        modalVisibleLoading(false)
      }
    }else{
      Alert.alert('Error', 'No hay conexión a Internet')
    }
  };

  const openDeleteModal = () => {
    setIsModalDeleteVisible(true); // Abre el ModalDelete
  };

  const closeModal = () => {
    onClose();
    setSelectedImage(routineData?.image || null);
    setRoutineName(routineData?.name || '');
  };

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Editar rutina</Text>
          <TouchableOpacity style={styles.contdelete} onPress={openDeleteModal}>
            <Image source={imgdelete} style={styles.imagedelete} />
          </TouchableOpacity>
        </View>
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
          <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnlisto} onPress={handleSubmit}>
            <Text style={styles.txtbtn}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnsalir} onPress={closeModal}>
            <Text style={styles.txtbtn}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* ModalDelete encima del ModalEdit */}
        <ModalDelete
          message="¿Quieres eliminar esta rutina?"
          isVisible={isModalDeleteVisible}
          onClose={() => setIsModalDeleteVisible(false)} // Cierra el ModalDelete
          function1={handleDeleteRoutine} // Ejecuta la eliminación
        />
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
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'poppins600',
  },
  contdelete: {
    width: '15%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BBE5DD',
    borderRadius: 10
  },
  imagedelete: {
    width: 30,
    height: 34,
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
    justifyContent: 'center',
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

export default ModalEdit;

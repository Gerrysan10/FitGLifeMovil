import { useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imageProfile from '../images/Icons/userProfile.png';
import { Verificar_conexion } from './CheckConnection';


const ModalProfileEdit = ({ isVisible, onClose, userData, handleUpdateUser, modalVisibleLoading }) => {
  const [username, setUsername] = useState(userData?.username || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [selectedImage, setSelectedImage] = useState(userData.image || '');
  const id = userData.id;
  const uid = userData.uid;


  const updateUser = async () => {
    if (username === '' || phone === '' || selectedImage === '') {
      Alert.alert('Error', 'Ningún campo puede estar vacio')
      return;
    }
    if (username === userData.username && phone === userData.phone && selectedImage === userData.image) {
      Alert.alert('Mensaje', 'Ningún dato ha sido modificado')
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Error', 'El número de teléfono no es válido');
      return;
    }    
    if (await Verificar_conexion()) {
      if (selectedImage !== userData.image) {
        modalVisibleLoading(true);
      }
      const newImage = await uploadImageToStorage(selectedImage, userData.image)
      try {
        const userRef = doc(db, `users/${id}`);
        await updateDoc(userRef, {
          username,
          phone,
          image: newImage,
        });
        onClose();
        handleUpdateUser({ id, uid, username, phone, email, image: newImage });
      } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      } finally {
        modalVisibleLoading(false);
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };



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
    updateUser();
  };

  const getStoragePathFromUrl = (url) => {
    const startIndex = url.indexOf("/o/") + 3;
    const endIndex = url.indexOf("?alt=media");
    const encodedPath = url.substring(startIndex, endIndex);
    return decodeURIComponent(encodedPath);
  };

  const deleteImage = async (oldImageUrl) => {
    if (await Verificar_conexion()) {
      if (oldImageUrl) {
        const oldImageRef = ref(storage, getStoragePathFromUrl(oldImageUrl));
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
        }
      }
    }
  };

  const uploadImageToStorage = async (fileUri, oldImageUrl) => {
    if (fileUri === oldImageUrl) {
      return fileUri;
    }
    if (await Verificar_conexion()) {
      await deleteImage(oldImageUrl);
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const imageId = Date.now().toString();
      const storageRef = ref(storage, `imagesUsers/user_${uid}_Profile/${imageId}`);
      const snapshot = await uploadBytes(storageRef, blob);
      return await getDownloadURL(snapshot.ref);
    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };

  const closeModal = () => {
    onClose();
    setSelectedImage(userData?.image || null);
    setUsername(userData?.username || '');
    setPhone(userData?.phone || '');
    setEmail(userData?.email || '');
  };

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Editar perfil</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Image source={selectedImage ? { uri: selectedImage } : imageProfile} style={styles.image} />
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={phone}
          maxLength={10}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          editable={false}
          keyboardType="email-address"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnSave} onPress={handleSubmit}>
            <Text style={styles.btnText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={closeModal}>
            <Text style={styles.btnText}>Cancelar</Text>
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
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'poppins600',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,

  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#000000'
  },
  changePhotoText: {
    color: '#6ABDA6',
    fontFamily: 'poppins600',
  },
  input: {
    backgroundColor: '#E7E7E7',
    marginBottom: 15,
    padding: 10,
    borderRadius: 20,
    fontFamily: 'poppins600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnSave: {
    backgroundColor: '#6ABDA6',
    padding: 10,
    borderRadius: 20,
    width: '45%',
  },
  btnCancel: {
    backgroundColor: '#FF5D57',
    padding: 10,
    borderRadius: 20,
    width: '45%',
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'poppins600',
  },
});

export default ModalProfileEdit;
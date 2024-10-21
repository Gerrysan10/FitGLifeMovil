import { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, View, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import Modal from 'react-native-modal';
import imgdelete from '../images/Icons/delete.png';
import { Verificar_conexion } from './CheckConnection';

const categories = [
    { name: 'Cuadríceps' }, { name: 'Tríceps' }, { name: 'Pecho' }, { name: 'Espalda' },
    { name: 'Bíceps' }, { name: 'Femoral' }, { name: 'Hombro' }, { name: 'Glúteo' },
    { name: 'Pantorrilla' }, { name: 'Trapecio' }, { name: 'Oblicuo' }, { name: 'Abdomen' },
    { name: 'Antebrazo' }, { name: 'Braquial' }
];

const ModalEditExercise = ({ isVisible, idUser, uidUser, onClose, openLoading, onCloseLoading, exercise, openDeleteModal, confirmdelete, confirmdeletefalse, closedeleteExercise }) => {
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [image, setImage] = useState('');

    useEffect(() => {
        if (exercise) {
            setName(exercise.name || '');
            setLink(exercise.link || '');
            setSelectedCategories(Array.isArray(exercise.category) ? exercise.category : []);
            setImage(exercise.image || '');
        }
    }, [exercise]);


    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
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
            if (await Verificar_conexion()) {
                const oldImageRef = ref(storage, getStoragePathFromUrl(oldImageUrl));
                try {
                    await deleteObject(oldImageRef);

                } catch (error) {

                }
            } else {
                Alert.alert('Error', 'No hay conexión a internet')
            }
        }
    }
    const uploadImageToStorage = async (fileUri, oldImageUrl) => {
        // Si hay una imagen anterior, intentamos eliminarla
        await deleteImage(oldImageUrl)

        if (await Verificar_conexion()) {
            const response = await fetch(fileUri);
            const blob = await response.blob();

            // Generar un ID único para la nueva imagen
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).slice(2, 7);
            const imageId = `${timestamp}-${randomStr}`;

            // Crear la referencia de almacenamiento con el ID único
            const storageRef = ref(storage, `imagesUsers/user_${uidUser}_images/${imageId}`);

            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } else {
            Alert.alert('Error', 'No hay conexión a internet')
        }
    };

    const getEmbedLink = (youtubeLink) => {
        if (youtubeLink.includes('embed')) {
            return youtubeLink;
        }

        let videoId = '';

        if (youtubeLink.includes('youtu.be')) {
            const parts = youtubeLink.split('/');
            videoId = parts[parts.length - 1].split('?')[0];
        } else if (youtubeLink.includes('watch?v=')) {
            const urlParams = new URLSearchParams(new URL(youtubeLink).search);
            videoId = urlParams.get('v');
        } else if (youtubeLink.includes('/shorts/')) {
            const parts = youtubeLink.split('/');
            videoId = parts[parts.length - 1].split('?')[0];
        }

        return `https://www.youtube.com/embed/${videoId}`;
    };


    const toggleCategory = (categoryName) => {
        setSelectedCategories(prevCategories => {
            if (prevCategories.includes(categoryName)) {
                return prevCategories.filter(c => c !== categoryName);
            } else {
                return [...prevCategories, categoryName];
            }
        });
    };

    const handleEditExercise = async () => {
        if (!name || !link || selectedCategories.length === 0 || !image) {
            Alert.alert('Todos los campos deben estar completos.');
            return;
        }

        const embedLink = getEmbedLink(link);
        let imageUrl = image;
        if (await Verificar_conexion()) {
            try {
                openLoading();
                if (image !== exercise.image) {
                    imageUrl = await uploadImageToStorage(image, exercise.image);
                }

                const updatedExercise = {
                    name,
                    link: embedLink,
                    category: selectedCategories,
                    image: imageUrl,
                };
                await updateDoc(doc(db, `users/${idUser}/createExercises`, exercise.id), updatedExercise);
            } catch (error) {
                Alert.alert('Error', 'Ocurrio un error al actualizar el ejercicio');
            } finally {
                modalCloses();
                onCloseLoading();
                Alert.alert('Mensaje', 'Ejercicio actualizado con éxito');
            }
        } else {
            Alert.alert('Error', 'No hay conexión a internet');
        }
    };

    const deleteExercises = async () => {
        if (await Verificar_conexion()) {
            closedeleteExercise();
            openLoading();
            try {
                const exerciseRef = doc(db, `users/${idUser}/createExercises/${exercise.id}`);
                // Referencia a la subcolección details
                const detailsRef = collection(db, `users/${idUser}/details`);

                // Crear una consulta para obtener los documentos en 'details' relacionados con la rutina
                const q = query(detailsRef, where('exercise', '==', exerciseRef));
                const detailsSnapshot = await getDocs(q);

                // Recorrer y eliminar cada documento en 'details' relacionado con la rutina
                detailsSnapshot.forEach(async (detailDoc) => {
                    await deleteDoc(detailDoc.ref);
                });
                // Obtener el documento desde Firestore
                const exerciseSnap = await getDoc(exerciseRef);
                // Verificar si el documento existe
                if (exerciseSnap.exists()) {
                    // Devolver los datos del documento
                    const exerciseImage = exerciseSnap.data().image;
                    deleteImage(exerciseImage)
                }
                // Eliminar el ejercicio después de haber eliminado los detalles
                await deleteDoc(exerciseRef);
                Alert.alert('Mensaje', 'Ejercicio eliminado correctamente');
            } catch (error) {
                Alert.alert('Error', 'Hubo un problema al eliminar el ejercicio.');
            } finally {
                onCloseLoading();
                modalCloses();
            }

        }else{
            Alert.alert('Error', 'No hay conexión a internet');
        }
    };



    useEffect(() => {
        if (confirmdelete) {
            try {
                deleteExercises()
            } catch (error) {

            } finally {
                confirmdeletefalse()
            }
        }
    }, [confirmdelete]);



    const modalCloses = () => {
        onClose();
    };

    return (
        <Modal isVisible={isVisible} style={styles.modal} avoidKeyboard={true}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalheader}>
                        <Text style={styles.modalTitle}>Editar ejercicio</Text>
                        <TouchableOpacity style={styles.contdelete} onPress={openDeleteModal}>
                            <Image source={imgdelete} style={styles.imagedelete} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contInputSR}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del ejercicio"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                    <View style={styles.contInputSR}>
                        <TextInput
                            style={styles.input}
                            placeholder="Link de YouTube"
                            value={link}
                            onChangeText={setLink}
                        />
                    </View>
                    <Text style={styles.textInputSR}>Seleccione grupos musculares que trabaja: </Text>
                    <ScrollView showsVerticalScrollIndicator={true} style={styles.categoriesScroll}>
                        <View style={styles.categoriesContainer}>
                            {categories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategories.includes(category.name) ? styles.selectedCategory : null
                                    ]}
                                    onPress={() => toggleCategory(category.name)}
                                >
                                    <Text style={styles.categoryText}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Text style={styles.txtbtn}>Cambiar Imagen</Text>
                    </TouchableOpacity>
                    {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.btnAdd} onPress={handleEditExercise}>
                            <Text style={styles.txtbtn}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnClose} onPress={modalCloses}>
                            <Text style={styles.txtbtn}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        position: 'relative'
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#F1FFF6',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalheader: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '90%'
    },
    modalTitle: {
        fontSize: 20,
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
    contInputSR: {
        width: '90%',
    },
    textInputSR: {
        fontFamily: 'poppins600',
        textAlign: 'left',
        marginLeft: 5,
    },
    input: {
        backgroundColor: '#E7E7E7',
        marginBottom: 20,
        padding: 5,
        borderRadius: 20,
        paddingLeft: 15,
        fontFamily: 'poppins600',
        width: '100%',
    },
    categoriesScroll: {
        height: '17%',
        width: '95%',
        marginBottom: 10,
        backgroundColor: '#d0f1c4',
        borderRadius: 20,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    categoryButton: {
        margin: 5,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 20,
    },
    selectedCategory: {
        backgroundColor: '#c2d6a7'
    },
    categoryText: {
        fontFamily: 'poppins600',
    },
    imagePreview: {
        width: 100,
        height: 100,
        marginVertical: 10,
        borderRadius: 10,
    },
    uploadButton: {
        backgroundColor: '#6ABDA6',
        width: '60%',
        height: 35,
        justifyContent: 'center',
        borderRadius: 20,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    btnAdd: {
        backgroundColor: '#6ABDA6',
        width: '45%',
        height: 45,
        justifyContent: 'center',
        borderRadius: 20,
    },
    btnClose: {
        backgroundColor: '#FF5D57',
        width: '45%',
        height: 45,
        justifyContent: 'center',
        borderRadius: 20,
    },
    txtbtn: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'poppins600',
    },
});

export default ModalEditExercise;
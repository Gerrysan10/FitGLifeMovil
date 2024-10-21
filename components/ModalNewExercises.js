import { useState } from 'react';
import { TextInput, TouchableOpacity, Text, View, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import Modal from 'react-native-modal';
import { Verificar_conexion } from './CheckConnection';

const categories = [
    { name: 'Cuadríceps' }, { name: 'Tríceps' }, { name: 'Pecho' }, { name: 'Espalda' },
    { name: 'Bíceps' }, { name: 'Femoral' }, { name: 'Hombro' }, { name: 'Glúteo' },
    { name: 'Pantorrilla' }, { name: 'Trapecio' }, { name: 'Oblicuo' }, { name: 'Abdomen' },
    { name: 'Antebrazo' }, { name: 'Braquial' }
];

const ModalNewExercise = ({ isVisible, idUser, uidUser, onClose, openLoading, onCloseLoading }) => {
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [image, setImage] = useState(null);

    // Selección de imagen
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

    const uploadImageToStorage = async (fileUri) => {
        if (await Verificar_conexion()) {
            const response = await fetch(fileUri);
            const blob = await response.blob();

            // Generar un ID único para la imagen
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

    // Validar enlace de YouTube y obtener el embed link
    const getEmbedLink = (youtubeLink) => {
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
        } else {
            return null;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    // Selección de categoría
    const toggleCategory = (categoryName) => {
        if (selectedCategories.includes(categoryName)) {
            setSelectedCategories(selectedCategories.filter(c => c !== categoryName));
        } else {
            setSelectedCategories([...selectedCategories, categoryName]);
        }
    };

    // Guardar el ejercicio
    const handleAddExercise = async () => {

        if (!name || !link || selectedCategories.length === 0 || !image) {
            Alert.alert('Mensaje', 'Todos los campos deben estar completos.');
            return;
        }

        const embedLink = getEmbedLink(link);
        if (embedLink === null) {
            Alert.alert('Error', 'El enlace de YouTube no es válido.');
            return;
        }

        if (await Verificar_conexion()) {
            try {
                openLoading()
                const imageUrl = await uploadImageToStorage(image);

                const newExercise = {
                    name,
                    link: embedLink,
                    category: selectedCategories,
                    image: imageUrl,
                    create: true
                };
                await addDoc(collection(db, `users/${idUser}/createExercises`), newExercise);


            } catch (error) {
                Alert.alert('Error','Ocurrio un error al crear el ejercicio')
            } finally {
                modalcloses()
                onCloseLoading()
                Alert.alert('Mensaje', 'Ejercicio añadido con éxito')
            }
        }else{
            Alert.alert('Error', 'No hay conexión a internet')
        }
    };

    const modalcloses = () => {
        onClose();
        setLink('')
        setName('')
        setImage(null)
        setSelectedCategories([])
    }

    return (
        <Modal isVisible={isVisible}
            style={styles.modal}
            avoidKeyboard={true}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Crear ejercicio</Text>
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
                    <Text style={styles.textInputSR}>Seleccione grupos musculares que tabaja: </Text>
                    <ScrollView
                        showsVerticalScrollIndicator={true}
                        style={styles.categoriesScroll}>
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
                        <Text style={styles.txtbtn}>Seleccionar Imagen</Text>
                    </TouchableOpacity>
                    {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.btnAdd} onPress={handleAddExercise}>
                            <Text style={styles.txtbtn}>Añadir Ejercicio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnClose} onPress={modalcloses}>
                            <Text style={styles.txtbtn}>Cerrar</Text>
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'poppins600',
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

export default ModalNewExercise;

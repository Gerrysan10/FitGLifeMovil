import { useContext, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import imageProfile from '../images/Icons/userProfile.png';
import imgedit from '../images/Icons/edit.png';
import { AuthContext } from '../AuthContext';
import ModalProfileEdit from '../components/ModalCount';
import LoadingModal from '../components/ModalLoading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import ModalDelete from '../components/ModalDelete';
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Verificar_conexion } from '../components/CheckConnection';

const ConfirmEliminar = ({ isVisible, deletedataUser, setIsVisible }) => {
    const [password, setPassword] = useState('');
    return (
        <Modal isVisible={isVisible}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Se eliminarán todos los datos almacenados en tu cuenta:{'\n'} <Text style={styles.modaldata}>-Perfil{'\n'} -Rutinas {'\n'} -Entrenamientos</Text> {'\n'} Los datos no se podrán recuperar.</Text>
                <Text style={styles.modalTitle}>Por último, ingresa tu contraseña para eliminar la cuenta</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.btnlisto} onPress={() => { deletedataUser(password) }}>
                        <Text style={styles.txtbtn}>Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnsalir} onPress={() => { setIsVisible(false) }}>
                        <Text style={styles.txtbtn}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}
const Mycount = () => {
    const { user, signIn, signOut } = useContext(AuthContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleUpdateUser = async (dataUser) => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(dataUser));
            signIn(dataUser);
        } catch (error) {
            Alert.alert('Error', 'Ocurrio un error al actualizar los datos del usuario')
        }
    };

    const modalVisibleLoading = (visible) => {
        setIsLoading(visible);
    };

    const openConfirmEliminar = () => {
        setIsModalDeleteVisible(false);
        setIsVisible(true);
    };

    const closeConfirmEliminar = () => {
        setIsModalDeleteVisible(false);
    };

    const deletedataUser = async (password) => {
        if (await Verificar_conexion()) {
            if (password === '') {
                Alert.alert('Error', 'Ingresa tu contraseña para poder eliminar la cuenta');
                return;
            }
            try {
                const credential = EmailAuthProvider.credential(
                    auth.currentUser.email,
                    password
                );

                await reauthenticateWithCredential(auth.currentUser, credential);

            } catch (error) {
                Alert.alert('Error', 'La contraseña es incorrecta.');
                return;
            }
            try {
                setIsLoadingDelete(true);
                const userId = user.id;
                const userUid = user.uid;

                // Delete Firestore collections
                const collectionsToDelete = ['training', 'details', 'routines', 'createExercises'];
                for (const collectionName of collectionsToDelete) {
                    try {
                        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
                        const snapshot = await getDocs(collectionRef);
                        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                        await Promise.all(deletePromises);
                    } catch (error) {
                    }
                }
                try {
                    await deleteDoc(doc(db, `users/${userId}`));
                } catch (error) {
                    Alert.alert('Error', 'Ocurrio un error al eliminar los datos de la cuenta, intentelo más tarde');
                }

                // Delete images from storage
                const imageFolders = [
                    `imagesUsers/user_${userUid}_Routines`,
                    `imagesUsers/user_${userUid}_images`,
                    `imagesUsers/user_${userUid}_Profile`
                ];

                for (const folder of imageFolders) {
                    try {
                        const folderRef = ref(storage, folder);
                        const filesList = await listAll(folderRef);
                        const deletePromises = filesList.items.map(fileRef => deleteObject(fileRef));
                        await Promise.all(deletePromises);
                    } catch (error) {
                    }
                }

                // Clear local storage
                try {
                    await AsyncStorage.removeItem('userData');
                } catch (error) {
                    Alert.alert('Error', 'Ocurrio un error al eliminar la cuenta, intentelo más tarde')
                }

                await auth.currentUser.delete();
                // Sign out
                signOut();
                setIsLoadingDelete(false);
                setIsVisible(false);
                Alert.alert('Cuenta eliminada', 'Tu cuenta y todos los datos asociados han sido eliminados.');
            } catch (error) {
                setIsLoadingDelete(false);
                Alert.alert('Error', 'Hubo un problema al eliminar la cuenta. Por favor, inténtalo de nuevo.');
            }
        } else {
            Alert.alert('Error','No hay conexión a internet');
        }
    };




    return (
        <View style={styles.container}>
            <View style={styles.perfilContainer}>
                <Image style={styles.img} source={user.image ? { uri: user.image } : imageProfile} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Nombre: {user.username}</Text>
                <Text style={styles.infoText}>Teléfono: {user.phone}</Text>
                <Text style={styles.infoText}>Correo: {user.email}</Text>
            </View>
            <TouchableOpacity onPress={handleOpenModal} style={styles.btnEdit}>
                <Text style={styles.textbtn}>Editar perfil</Text>
                <Image source={imgedit} style={styles.imgEdit} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => { setIsModalDeleteVisible(true) }}>
                <Text style={styles.textbtn}>Eliminar cuenta</Text>
            </TouchableOpacity>

            <ModalProfileEdit
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                userData={user}
                handleUpdateUser={handleUpdateUser}
                modalVisibleLoading={modalVisibleLoading}
            />
            <ModalDelete isVisible={isModalDeleteVisible} message={'¿Quiere eliminar su cuenta?'} function1={openConfirmEliminar} onClose={closeConfirmEliminar} />
            <ConfirmEliminar isVisible={isVisible} deletedataUser={deletedataUser} setIsVisible={setIsVisible} />
            <LoadingModal isVisible={isLoading} message={'Actualizando perfil'} />
            <LoadingModal isVisible={isLoadingDelete} message={'Eliminando cuenta'} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: '4%'
    },

    perfilContainer: {
        alignSelf: 'center',
        marginTop: '10%',
        position: 'relative',
    },
    img: {
        width: 150,
        height: 150,
        borderRadius: 150,
        backgroundColor: '#000000',
        borderWidth: 2,
        borderColor: '#E9E9E9'
    },
    imgEdit: {
        width: 25,
        height: 25,
    },
    infoContainer: {
        marginTop: '10%',
        backgroundColor: '#E9E9E9',
        borderRadius: 20,
        padding: 20,
    },
    infoText: {
        fontSize: 16,
        fontFamily: 'poppins600',
        marginBottom: 10,
    },
    btnEdit: {
        width: '45%',
        backgroundColor: '#83badc',
        height: 55,
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'center',
        borderRadius: 30,
        marginTop: '10%',
        flexDirection: 'row',
        paddingHorizontal: 15
    },
    btn: {
        width: '45%',
        backgroundColor: '#FF5D57',
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 30,
        marginTop: '10%'
    },
    textbtn: {
        color: 'white',
        fontFamily: 'poppins600',
        fontSize: 15,
    },
    modalContent: {
        backgroundColor: '#F1FFF6',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',

    },
    modaldata: {
        fontFamily: 'poppins500',
        fontSize: 15
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'center',
        marginTop: '2%',
    },
    btnlisto: {
        backgroundColor: '#6ABDA6',
        width: '45%',
        height: 45,
        justifyContent: 'center',
        borderRadius: 20,
    },
    btnsalir: {
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
});

export default Mycount;
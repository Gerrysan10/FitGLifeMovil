import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import Message from './Message';
import { Verificar_conexion } from './CheckConnection';

const ModalAddExercise = ({ userId, routineId, routineName, isVisible, onClose, exercise }) => {
    const [series, setSeries] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [error, setError] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [replace, setReplace] = useState(false);
    const navigation = useNavigation();

    const closeReplace = () => {
        setReplace(false);
    };

    const handlenavigation = () => {
        setReplace(false)
        navigation.navigate('MisRutinas', { id: routineId, name: routineName });
    };


    const isInteger = (value) => /^\d+$/.test(value);

    const handleAdd = async () => {
        if (!series || !reps || !weight) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        if (!isInteger(series) || !isInteger(reps) || parseInt(series) < 0 || parseInt(reps) < 0) {
            setError('Las series y las repeticiones deben ser enteros positivos.');
            return;
        }

        if (parseFloat(weight)) {
            if (weight < 0) {
                setError('El peso no puede ser menor a 0');
                return;
            }

        } else {
            setError('El peso debe ser un número mayor o igual a 0.');
            return;
        }

        if (await Verificar_conexion()) {
            try {
                let exerciseRef;
                if (exercise.create) {
                    exerciseRef = doc(db, `users/${userId}/createExercises`, exercise.id);
                } else {
                    exerciseRef = doc(db, 'exercises', exercise.id);
                }

                await addDoc(collection(db, `users/${userId}/details`), {
                    routineId: routineId,
                    exercise: exerciseRef,
                    series: parseInt(series),
                    reps: parseInt(reps),
                    weight: [parseFloat(weight), weightUnit]
                });
                closeModal()
                setTimeout(() => setReplace(true), 500);
            } catch (error) {
                setError('Error, Ingrese valores válidos');
            }
        }else{
            Alert.alert('Error','No hay conexión a internet');
        }
    };

    const closeModal = () => {
        onClose();
        setError('')
        setReps('')
        setWeight('')
        setSeries('')
    }

    return (
        <>
            <Message visible={replace} message={'Ejercicio agregado correctamente'} txtbtn1={'Continuar'} txtbtn2={'Ir a mi rutina'} funtion1={closeReplace} funtion2={handlenavigation} />
            <Modal isVisible={isVisible}>
                <View style={styles.modalContent}>
                    {exercise && (
                        <>
                            <Text style={styles.modalTitle}>{exercise.name}</Text>
                            <View style={styles.contVideo}>
                                <WebView
                                    style={styles.video}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    source={{ uri: exercise.link }}
                                />
                            </View>
                            <View style={styles.contSR}>
                                <View style={styles.contInputSR}>
                                    <Text style={styles.textInputSR}>Series</Text>
                                    <TextInput
                                        style={styles.InputSR}
                                        placeholder="Núm. de series"
                                        value={series}
                                        onChangeText={setSeries}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <Text style={styles.textX}>X</Text>
                                <View style={styles.contInputSR}>
                                    <Text style={styles.textInputSR}>Repeticiones</Text>
                                    <TextInput
                                        style={styles.InputSR}
                                        placeholder="Núm. de reps"
                                        value={reps}
                                        onChangeText={setReps}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={styles.contWeight}>
                                <View style={styles.textcontWeight}>
                                    <Text style={styles.textInputSR}>Peso</Text>
                                </View>
                                <View style={styles.picker}>
                                    <Picker
                                        selectedValue={weightUnit}
                                        style={styles.weightUnitPicker}
                                        onValueChange={(itemValue) => setWeightUnit(itemValue)}
                                    >
                                        <Picker.Item label="kg (Kilos)" value="kg" />
                                        <Picker.Item label="lb (Libras)" value="lb" />
                                    </Picker>
                                </View>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Peso"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                            />
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.btnlisto} onPress={handleAdd}>
                                    <Text style={styles.txtbtn}>Agregar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnsalir} onPress={closeModal}>
                                    <Text style={styles.txtbtn}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </Modal>
        </>

    );
};


const styles = StyleSheet.create({
    routineImage: {
        width: 50,
        height: 100,
    },
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
    contVideo: {
        width: '100%',
        height: 200
    },
    video: {
        width: '100%',
        height: '100%',
        marginBottom: 12
    },
    contSR: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        justifyContent: 'space-around',
    },
    contInputSR: {
        alignItems: 'center',
        width: '40%'
    },
    textInputSR: {
        fontFamily: 'poppins600',
    },
    textcontWeight: {
        textAlignVertical: 'center',
        padding: 5,

    },
    contWeight: {
        flexDirection: 'row',
        paddingLeft: 15,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    weightUnitPicker: {
        width: 150,
        height: 50,
    },
    picker: {
        height: 40,
        width: '50%',
        backgroundColor: '#f1f1f1',
        borderRadius: 30,
        justifyContent: 'center',

    },
    textX: {
        fontFamily: 'poppins600',
        alignSelf: 'center'
    },
    InputSR: {
        backgroundColor: '#E7E7E7',
        marginBottom: 20,
        padding: 5,
        borderRadius: 20,
        paddingLeft: 15,
        fontFamily: 'poppins600',
        width: '100%',
    },
    input: {
        backgroundColor: '#E7E7E7',
        marginBottom: 20,
        padding: 5,
        borderRadius: 20,
        paddingLeft: 15,
        fontFamily: 'poppins600',
    },

    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
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
});

export default ModalAddExercise;

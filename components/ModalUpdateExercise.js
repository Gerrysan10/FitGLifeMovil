import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Verificar_conexion } from './CheckConnection';

const ModalUpdateExercise = ({ userId, isVisible, onClose, exercise, onExerciseUpdated, activate }) => {
    const [series, setSeries] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [error, setError] = useState('');

    const isInteger = (value) => /^\d+$/.test(value);
    useEffect(() => {
        if (exercise) {
            setSeries(exercise.series ? exercise.series.toString() : '');
            setReps(exercise.reps ? exercise.reps.toString() : '');
            setWeight(exercise.weight && exercise.weight[0] ? exercise.weight[0].toString() : '');
            setWeightUnit(exercise.weight && exercise.weight[1] ? exercise.weight[1] : 'kg');
        }
    }, [exercise]);

    const handleUpdate = async () => {
        if (!series || !reps || weight === '') { // Permitir que el peso sea 0, pero no vacío
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        if (!isInteger(series) || !isInteger(reps) || parseInt(series) < 1 || parseInt(reps) < 1) {
            setError('Las series y las repeticiones deben ser enteros positivos.');
            return;
        }

        const parsedWeight = parseFloat(weight);
        if (isNaN(parsedWeight) || parsedWeight < 0) {
            setError('El peso no puede ser negativo y debe ser un número válido.');
            return;
        }

        if (!exercise) return;
        if (await Verificar_conexion()) {
            try {
                const updatedExercise = {
                    series: parseInt(series),
                    reps: parseInt(reps),
                    weight: [parsedWeight, weightUnit],
                };
                const exerciseRef = doc(db, `users/${userId}/details/${exercise.id}`);
                await updateDoc(exerciseRef, updatedExercise);
                Alert.alert('Mensaje', 'Ejercicio actualizado correctamente');
            } catch (error) {
                setError('Error al actualizar el ejercicio.');
            } finally {
                onExerciseUpdated();
            }
        }else{
            Alert.alert('Error', 'No hay conexión a internet.');
        }
        onClose();
    };


    return (
        <Modal isVisible={isVisible}>
            <View style={styles.modalContent}>
                {exercise && exercise.exerciseData && (
                    <>
                        <Text style={styles.modalTitle}>{exercise.exerciseData.name}</Text>
                        <View style={styles.contVideo}>
                            <WebView
                                style={styles.video}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                source={{ uri: exercise.exerciseData.link }}
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
                                    editable={activate}
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
                                    editable={activate}
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
                                    enabled={activate}
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
                            editable={activate}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        {activate ? (<View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.btnlisto} onPress={() => handleUpdate()}>
                                <Text style={styles.txtbtn}>Actualizar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnsalir} onPress={onClose}>
                                <Text style={styles.txtbtn}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>) : <View style={styles.buttonContainer2}>
                            <TouchableOpacity style={styles.btnsalir} onPress={onClose}>
                                <Text style={styles.txtbtn}>Salir</Text>
                            </TouchableOpacity>
                        </View>}
                    </>
                )}
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
    textInputSR: {
        fontFamily: 'poppins600',
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
    buttonContainer2: {
        flexDirection: 'row',
        justifyContent: 'center',
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

export default ModalUpdateExercise;

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Verificar_conexion } from './CheckConnection';

const UpdateSeriesModal = ({ isVisible, onClose, exercise, userId, trainingId, onUpdate, setModalLoading }) => {
    const [seriesData, setSeriesData] = useState([]);
    const [visibleBtnSave, setVisibleBtnSave] = useState(false);

    useEffect(() => {
        if (exercise && exercise.seriesData) {
            const updatedSeriesData = exercise.seriesData.map(serie => ({
                ...serie,
                reps: serie.reps?.toString() || '0',
                weight: serie.weight?.toString() || '0'
            }));
            setSeriesData(updatedSeriesData);

            // Verificar si alguna serie tiene 'add === true'
            const hasAddTrue = updatedSeriesData.some(serie => serie.add === true);
            setVisibleBtnSave(hasAddTrue);
        } else {
            setSeriesData([]);
            setVisibleBtnSave(false);
        }
    }, [exercise]);

    const handleInputChange = (index, field, value) => {
        const updatedSeriesData = [...seriesData];
        if (updatedSeriesData[index].add) {
            updatedSeriesData[index] = {
                ...updatedSeriesData[index],
                [field]: value,
            };
            setSeriesData(updatedSeriesData);
        }
    };

    const validateFields = () => {
        // Validar cada serie antes de guardar
        for (let i = 0; i < seriesData.length; i++) {
            const serie = seriesData[i];
            const isInteger = (number) => /^\d+$/.test(number);

            if (serie.add) {
                if (!serie.reps || !isInteger(serie.reps) || parseInt(serie.reps) < 1) {
                    Alert.alert('Error', `Las repeticiones deben ser un número entero mayor o igual a 1 en la serie ${i + 1}`);
                    return false;
                }
                if (!serie.weight || isNaN(parseFloat(serie.weight)) || parseFloat(serie.weight) < 0) {
                    Alert.alert('Error', `El peso debe ser un número mayor o igual a 0 en la serie ${i + 1}`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!visibleBtnSave) {
            Alert.alert('Mensaje', 'No hay datos para actualizar');
            return;
        }

        // Realizar validaciones antes de guardar
        if (!validateFields()) {
            return;
        }
        if (await Verificar_conexion()) {
            setModalLoading(true)

            try {
                if (!exercise || !userId || !trainingId) {
                    Alert.alert('Error', 'Ocurrio un error al actualizar los datos');
                    return;
                }

                // Obtener la referencia del entrenamiento
                const trainingRef = doc(db, `users/${userId}/training/${trainingId}`);
                const trainingSnap = await getDoc(trainingRef);
                if (!trainingSnap.exists()) {
                    Alert.alert('Error', 'No se encontró el entrenamiento');
                    return;
                }

                // Obtener información del entrenamiento
                const trainingData = trainingSnap.data();
                const updatedExercises = [...trainingData.exercises];

                // Obtener el índice de ejercicio desde exercise.index
                const exerciseIndex = exercise.index;  // Aquí accedes a currentExerciseIndex

                // Actualizar los datos del ejercicio específico
                updatedExercises[exerciseIndex] = {
                    ...updatedExercises[exerciseIndex],
                    series: seriesData
                };

                // Guardar los ejercicios actualizados
                await updateDoc(trainingRef, {
                    exercises: updatedExercises
                });
                onUpdate(seriesData);
                setModalLoading(false)
                onClose();
            } catch (error) {
                Alert.alert('Error','Ocurrio un error al actualizar el entrenamiento')
            }
        }else{
            Alert.alert('Error', 'No hay conexión a internet')
        }
    };

    if (!exercise) {
        return null;
    }


    return (
        <Modal isVisible={isVisible} onBackdropPress={onClose}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Actualizar series</Text>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.headtable}>
                        <Text style={[styles.titletable, { width: '30%' }]}>Serie</Text>
                        <Text style={[styles.titletable, { width: '30%' }]}>Reps</Text>
                        <Text style={[styles.titletable, { width: '40%' }]}>Peso</Text>
                    </View>
                    {seriesData.map((serie, index) => (
                        <View style={styles.conttable} key={index}>
                            <Text style={[styles.texttable, { width: '30%' }]}>{index + 1}</Text>
                            <TextInput
                                style={[styles.input, { width: '30%' }]}
                                value={(serie.add) ? serie.reps : '-'}
                                onChangeText={(value) => handleInputChange(index, 'reps', value)}
                                keyboardType="numeric"
                                editable={serie.add}
                            />
                            <View style={[styles.weightContainer, { width: '40%' }]}>
                                <TextInput
                                    style={styles.weightInput}
                                    value={(serie.add) ? serie.weight : '-'}
                                    onChangeText={(value) => handleInputChange(index, 'weight', value)}
                                    keyboardType="numeric"
                                    editable={serie.add}
                                />
                                <Text style={styles.unitText}>{serie.unit}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.btnlisto} onPress={handleSave}>
                        <Text style={styles.txtbtn}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnsalir} onPress={onClose}>
                        <Text style={styles.txtbtn}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'poppins600',
        marginBottom: 15,
    },
    scrollView: {
        maxHeight: 300,
    },
    headtable: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 5,
        marginBottom: 10,
    },
    titletable: {
        textAlign: 'center',
        fontFamily: 'poppins600'
    },
    conttable: {
        flexDirection: 'row',
        marginBottom: 10,
        fontFamily: 'poppins500',
        fontSize: 15
    },
    texttable: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: 'poppins500',
        fontSize: 15
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 5,
        textAlign: 'center',
        fontFamily: 'poppins500',
        fontSize: 14
    },
    weightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weightInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 5,
        textAlign: 'center',
        fontFamily: 'poppins500',
        fontSize: 14
    },
    unitText: {
        marginLeft: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
        marginTop: 20
    },
    btnlisto: {
        backgroundColor: '#6ABDA6',
        width: '40%',
        height: 40,
        justifyContent: 'center',
        borderRadius: 20,
    },
    btnsalir: {
        backgroundColor: '#FF5D57',
        width: '40%',
        height: 40,
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

export default UpdateSeriesModal;
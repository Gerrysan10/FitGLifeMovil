import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';

const ModalWeigthReps = ({ isVisible, weigth, reps, update, onClose }) => {
    const [repsUpdate, setRepsUpdate] = useState('');
    const [weightUpdate, setWeightUpdate] = useState('');
    const [error, setError] = useState('');
  
    useEffect(() => {
      if (weigth !== undefined) {
        setWeightUpdate(weigth.toString());
      }
      if (reps !== undefined) {
        setRepsUpdate(reps.toString());
      }
    }, [weigth, reps]);
  

    const isInteger = (value) => /^\d+$/.test(value);

    const handleAdd = async () => {
        // Primero, valida si los campos están completos
        if (!repsUpdate || !weightUpdate) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        // Valida si las repeticiones son un entero mayor o igual a 1
        if (!isInteger(repsUpdate) || parseInt(repsUpdate) < 1) {
            setError('Las repeticiones deben ser mayores o iguales a 1.');
            return;
        }

        // Valida que el peso sea un número válido mayor o igual a 0
        const parsedWeight = parseFloat(weightUpdate); // Convierte el peso a número
        if (isNaN(parsedWeight) || parsedWeight < 0) {
            setError('El peso debe ser un número mayor o igual a 0.');
            return;
        }

        try {
            onClose();
            await update(weightUpdate, repsUpdate);
          } catch (error) {
            setError('Error al actualizar, ingresa valores válidos.');
          }
    };


    return (
        <>
            <Modal
                isVisible={isVisible}
                onBackdropPress={onClose}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ingresar datos</Text>
                        <View style={styles.contWeight}>
                            <View style={styles.textcontWeight}>
                                <Text style={styles.textInputSR}>Peso</Text>
                            </View>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Peso"
                            value={weightUpdate}
                            onChangeText={setWeightUpdate}
                            keyboardType="numeric"
                        />
                        <View style={styles.contSR}>
                            <View style={styles.contInputSR}>
                                <Text style={styles.textInputSR}>Repeticiones</Text>
                                <TextInput
                                    style={styles.InputSR}
                                    placeholder="Núm. de reps"
                                    value={repsUpdate}
                                    onChangeText={setRepsUpdate}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.btnlisto} onPress={handleAdd}>
                                <Text style={styles.txtbtn}>Listo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnsalir} onPress={onClose}>
                                <Text style={styles.txtbtn}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
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
    contSR: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        justifyContent: 'space-around',
    },
    contInputSR: {
        width: '100%'
    },
    textInputSR: {
        fontFamily: 'poppins600',
        padding: 5,
    },
    textcontWeight: {
        textAlignVertical: 'center',
        padding: 5,
    },
    contWeight: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
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
    txtbtn: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'poppins600',
    },
});

export default ModalWeigthReps;

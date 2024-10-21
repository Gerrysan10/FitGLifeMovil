import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Verificar_conexion } from './CheckConnection';

const ModalAddMeasures = ({ isVisible, category, onClose, userId, fetchMeasurements }) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    // Validar si los campos están completos
    if (!data) {
      setError('Por favor ingrese el campo requerido.');
      return;
    }

    const parsedData = parseFloat(data);
    if (isNaN(parsedData) || parsedData <= 0) {
      setError('Ingrese un valor válido.');
      return;
    }

    if (await Verificar_conexion()) {
      try {
        // Agregar el documento a Firestore
        await addDoc(collection(db, `users/${userId}/measurements`), {
          category: category,
          info: parsedData,
          date: new Date(),
        });

        // Cerrar modal y limpiar el campo de entrada
        setData('');
        setError('');
        onClose();
        fetchMeasurements();
      } catch (error) {
        Alert.alert('Error', 'Ocurrio un error al agregar la medida corporal')
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }

  };

  return (
    <>
      <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingresar datos</Text>
            <View style={styles.contSR}>
              <View style={styles.contInputSR}>
                <TextInput
                  style={styles.InputSR}
                  placeholder={category === 'Peso' ? 'Ingrese el peso (kg)' : 'Ingrese la medida (cm)'}
                  onChangeText={setData}
                  value={data}
                  keyboardType="numeric"
                />
                <Text style={styles.textInputSR}>{category === 'Peso' ? 'kg' : 'cm'}</Text>
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
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  contInputSR: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10
  },
  textInputSR: {
    fontFamily: 'poppins600',
    padding: 5,
    textAlignVertical: 'center',
  },
  InputSR: {
    backgroundColor: '#E7E7E7',
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    fontFamily: 'poppins600',
    width: '80%',
    height: 40,
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

export default ModalAddMeasures;

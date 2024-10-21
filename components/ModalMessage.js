import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

const ModalDelete = ({ isVisible, message }) => {
    const [isModalVisible, setModalVisible] = useState(isVisible);
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{message}</Text>
        <View style={styles.buttonContainer}>
          
          <TouchableOpacity style={styles.btnaceptar} onPress={toggleModal}>
            <Text style={styles.txtbtn}>Aceptar</Text>
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
    width:'90%',
    alignSelf:'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'poppins600',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent:'center',
    width: '80%',
    alignSelf: 'center',
    marginTop:'2%'
  },
  btnaceptar: {
    backgroundColor: '#6ABDA6',
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

export default ModalDelete;

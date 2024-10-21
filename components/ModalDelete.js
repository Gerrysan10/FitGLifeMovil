import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';


const ModalDelete = ({ message,isVisible, onClose, function1 }) => {

  const closeModal = () => {
    onClose();
  };

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnlisto} onPress={function1}>
            <Text style={styles.txtbtn}>Eliminar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnsalir} onPress={closeModal}>
            <Text style={styles.txtbtn}>Cancelar</Text>
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
    width: '90%',
    alignSelf: 'center',
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
});

export default ModalDelete;

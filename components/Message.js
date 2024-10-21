import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';

const Message = ({ visible, message, txtbtn1, txtbtn2, funtion1, funtion2, disable, onClose }) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
    >
      <TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btnlisto} onPress={funtion1} disabled={disable}>
              <Text style={styles.txtbtn}>{txtbtn1}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnsalir} onPress={funtion2} disabled={disable}>
              <Text style={styles.txtbtn}>{txtbtn2}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'poppins600',
        marginBottom:'10%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        alignSelf: 'center',
    },
    btnlisto: {
        backgroundColor: '#6ABDA6',
        width: '45%',
        height: 44,
        justifyContent: 'center',
        borderRadius: 20,
        
    },
    btnsalir: {
        backgroundColor: '#FF5D57',
        width: '45%',
        height: 44,
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

export default Message;

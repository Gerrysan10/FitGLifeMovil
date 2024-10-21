import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

const LoadingModal = ({ isVisible, message }) => {
    return (
        <Modal isVisible={isVisible} style={styles.modal}>
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6ABDA6" />
                <Text style={styles.message}>{message || 'Cargando...'}</Text>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0, 
    },
    container: {
        width: 200,
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        marginTop: 15,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        fontFamily: 'poppins600',
    },
});

export default LoadingModal;

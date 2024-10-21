import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import imggmail from '../images/Icons/gmail.png';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import LoadingModal from '../components/ModalLoading';
import { Verificar_conexion } from '../components/CheckConnection';

const RecoveryPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const title = 'Restablece tu\n contraseña';

    const handleResetPassword = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'El formato del email no es válido');
            return;
        }
        if (email.trim() === '') {
            Alert.alert('Error', 'Por favor, ingresa tu correo electrónico.');
            return;
        }
        if (await Verificar_conexion()) {

            setIsLoading(true);
            try {
                await sendPasswordResetEmail(auth, email)
            } catch (error) {
                Alert.alert('Error', 'ocurrio un error, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
                Alert.alert('Mensaje', 'Se envio el correo, si no recibiste ningún correo verifica que sea el correo electrónico correcto.')
            }
        }else{
            Alert.alert('Error', 'No hay conexión a internet, intenta de nuevo más tarde.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.contTitle}>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={styles.text}>Ingresa tu correo electrónico y te enviaremos un correo para restablecer tu contraseña.</Text>
                <View style={styles.continput}>
                    <Image source={imggmail} style={styles.imgform} resizeMode="contain" />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.button}>
                    <TouchableOpacity style={styles.btnpress} onPress={handleResetPassword}>
                        <View style={styles.btnAdd}>
                            <Text style={styles.textAdd}>Restablecer contraseña</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <LoadingModal isVisible={isLoading} message={'enviando correo'} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardContainer: {
        flex: 1,
    },
    contTitle: {
        marginTop: '10%',
        marginHorizontal: '4%',
    },
    title: {
        fontSize: 26,
        fontFamily: 'poppins600',
    },
    text: {
        marginHorizontal: '4%',
        fontFamily: 'poppins500',
        fontSize: 20,
        marginTop: '5%',
    },
    continput: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
        backgroundColor: '#E9E9E9',
        marginVertical: 10,
        marginHorizontal: '4%',
        marginTop: '20%',
    },
    imgform: {
        width: 30,
        marginHorizontal: 10,
    },
    input: {
        height: 60,
        flex: 1,
        fontSize: 16,
    },
    btnpress: {
        width: '100%',
        height: '100%',
    },
    button: {
        width: '92%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '5%',
        marginHorizontal: '4%',
    },
    btnAdd: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 10,
        backgroundColor: '#6ABDA6',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    addIconContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgAdd: {
        width: '100%',
        height: '100%',
    },
    textAdd: {
        fontSize: 17,
        fontFamily: 'poppins600',
        marginLeft: 7,
        textAlign: 'center',
        color: '#FCFCFC',
    },
});

export default RecoveryPassword;

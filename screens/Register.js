import { useState, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, StatusBar, Image, TextInput, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import ContNavAuth from '../components/ContNavAuth';
import imguser from '../images/Icons/user.png';
import imggmail from '../images/Icons/gmail.png';
import imgphone from '../images/Icons/telefono.png';
import imgpassword from '../images/Icons/password.png';
import { CheckBox } from '@rneui/themed';
import ButtonAuth from '../components/ButtonAuth';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { AuthContext } from '../AuthContext';
import { auth, db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Verificar_conexion } from '../components/CheckConnection';

const RegisterScreen = () => {
  const { signIn } = useContext(AuthContext);
  const navigation = useNavigation();
  const [isCheckedTerms, setIsCheckedTerms] = useState(false);
  const [isCheckedPrivacy, setIsCheckedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
  });



  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      Alert.alert('Error','No se pudieron guardar los datos del usuario correctamente');
    }
  };
  const onSubmit = async () => {

    if (!isCheckedTerms || !isCheckedPrivacy) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones y la política');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      Alert.alert('Error', 'El número de teléfono no es válido');
      return;
    }    
    if (formData.username === '' || formData.email === '' || formData.password === '' || formData.phone === '') {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'El formato del email no es válido');
      return;
    }
    if (await Verificar_conexion()) {
      setIsLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        const userId = user.uid;


        await updateProfile(user, {
          displayName: formData.username,
          phoneNumber: formData.phone,
        });

        const userRef = await addDoc(collection(db, "users"), {
          uid: userId,
          role: 'user',
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          Image: '',
          createdAt: new Date()
        });
        storeUserData({ id: userRef.id, uid: userId, email: formData.email, username: formData.username, phone: formData.phone, image: '' })
        signIn({ id: userRef.id, uid: userId, email: formData.email, username: formData.username, phone: formData.phone, image: '' });

      } catch (error) {
        Alert.alert('Error', 'Error al registrar la cuenta. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onPanGestureEvent = (event) => {
    if (event.nativeEvent.translationX > 100) {
      navigation.navigate('Login');
    }
  };

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END && nativeEvent.translationX > 100) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Text style={styles.titletext}>Hola,</Text>
          <Text style={styles.titletext}>registrate ahora</Text>
          <View style={styles.navcont}>
            <ContNavAuth />
          </View>
          <View style={styles.continput}>
            <Image source={imguser} style={styles.imgform} resizeMode="contain" />
            <TextInput style={styles.input} placeholder='Nombre'
              onChangeText={(text) => setFormData({ ...formData, username: text })}
            />
          </View>
          <View style={styles.continput}>
            <Image source={imgphone} style={styles.imgform} resizeMode="contain" />
            <TextInput style={styles.input} placeholder='Teléfono'
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType='numeric'
              maxLength={10}
            />
          </View>
          <View style={styles.continput}>
            <Image source={imggmail} style={styles.imgform} resizeMode="contain" />
            <TextInput style={styles.input} placeholder='Correo'
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType='email-address'
            />
          </View>
          <View style={styles.continput}>
            <Image source={imgpassword} style={styles.imgform} resizeMode="contain" />
            <TextInput style={styles.input} placeholder='Contraseña'
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={true}
            />
          </View>
          <View style={styles.contcheckbox}>
            <CheckBox
              title={
                <Text style={styles.checkboxText}>
                  He leído y acepto los Términos y Condiciones
                </Text>
              }
              checked={isCheckedTerms}
              onPress={() => setIsCheckedTerms(!isCheckedTerms)}
              containerStyle={styles.checkboxContainer}
              checkedColor='#6ABDA6'
            />
            <CheckBox
              title={
                <Text style={styles.checkboxText}>
                  ¿Usted ha leído y acepta la Política de Privacidad?
                </Text>
              }
              checked={isCheckedPrivacy}
              onPress={() => setIsCheckedPrivacy(!isCheckedPrivacy)}
              containerStyle={styles.checkboxContainer}
              checkedColor='#6ABDA6'
            />
          </View>
          <View style={styles.btn}>
            <ButtonAuth text='Registrate aquí' onPress={onSubmit} />
          </View>
        </KeyboardAvoidingView>
      </PanGestureHandler>
      <Modal
        visible={isLoading}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#6ABDA6" />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: '4%',
    marginTop: '15%'
  },
  navcont: {
    marginVertical: '3%'
  },
  titletext: {
    fontSize: 26,
    fontFamily: 'poppins600'
  },
  continput: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    backgroundColor: '#E9E9E9',
    marginVertical: 7
  },
  imgform: {
    width: 30,
    marginHorizontal: 10,
  },
  input: {
    height: 60,
    flex: 1,
    fontSize: 16
  },
  contcheckbox: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    width: '100%',
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: 'poppins600',
    flexShrink: 1,
  },
  btn: {
    marginTop: '6%'
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default RegisterScreen;

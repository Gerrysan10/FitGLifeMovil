import { useContext, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import Title from '../components/Title';
import ContNavAuth from '../components/ContNavAuth';
import logo from '../images/logo.png';
import imggmail from '../images/Icons/gmail.png';
import imgpassword from '../images/Icons/password.png';
import ButtonAuth from '../components/ButtonAuth';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { AuthContext } from '../AuthContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../firebase';
import LoadingModal from '../components/ModalLoading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Verificar_conexion } from '../components/CheckConnection';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onPanGestureEvent = (event) => {
    if (event.nativeEvent.translationX < -100) {
      navigation.navigate('Register');
    }
  };

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END && nativeEvent.translationX < -100) {
      navigation.navigate('Register');
    }
  };

  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {

    }
  };

  const fetchIdUser = async (useruid) => {
    if (await Verificar_conexion()) {
      try {
        const q = query(collection(db, 'users'), where('uid', '==', useruid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const id = userDoc.id;
          const image = userDoc.data().image;
          const phone = userDoc.data().phone;
          const username = userDoc.data().username;
          const role = userDoc.data().role;

          if (role == 'user') {
            signIn({ id, uid: useruid, email: email, username, phone, image });
            const userdata = {
              id: id,
              uid: useruid,
              email: email,
              username: username,
              phone: phone,
              image: image
            }
            storeUserData(userdata);
          }else{
            await signOut(auth);
            Alert.alert('Error','No puedes iniciar sesión con está cuenta');
          }
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet.');
    }

  };
  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'El formato del email no es válido');
      return;
    }

    if (password.trim() === '') {
      Alert.alert('Error', 'La contraseña no puede estar vacía.');
      return;
    }

    if (await Verificar_conexion()) {
      setIsLoading(true);
      try {
        // Iniciar sesión con Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch y almacenamiento de datos del usuario
        await fetchIdUser(user.uid);

      } catch (error) {
        // Manejo de errores de autenticación
        switch (error.code) {
          case 'auth/user-not-found':
            Alert.alert('Error', 'No existe una cuenta asociada a este correo electrónico.');
            break;
          case 'auth/invalid-credential':
            Alert.alert('Error', 'Correo electrónico o contraseña incorrecta.');
            break;
          case 'auth/too-many-requests':
            Alert.alert('Error', 'Se han realizado demasiados intentos. Por favor, intenta más tarde.');
            break;
          default:
            Alert.alert('Error', 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet.');
    }
  };

  const handleRecovery = () => {
    navigation.navigate('Recovery');
  }
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
          <Title title="Inicio de sesión" />
          <View style={styles.navcont}>
            <ContNavAuth />
          </View>
          <View style={styles.contlogo}>
            <Image source={logo} style={styles.imglogo} resizeMode="contain" />
          </View>
          <View style={styles.continput}>
            <Image source={imggmail} style={styles.imgform} resizeMode="contain" />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.continput}>
            <Image source={imgpassword} style={styles.imgform} resizeMode="contain" />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.contbtn}>
            <ButtonAuth text="Iniciar sesión" onPress={handleLogin} />
          </View>
          <View style={styles.contrecover}>
            <Text style={styles.textrecover}>¿Olvidaste tu contraseña?</Text>
            <TouchableOpacity onPress={handleRecovery}>
              <Text style={styles.recover}>Click aquí</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </PanGestureHandler>
      <LoadingModal isVisible={isLoading} message={'Iniciando sesión'} />
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
    marginTop: '12%',
  },
  contlogo: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imglogo: {
    width: 200,
    height: 140
  },
  continput: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    backgroundColor: '#E9E9E9',
    marginVertical: 10
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
  contbtn: {
    marginTop: 35
  },
  texto: {
    fontFamily: 'poppins500',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30
  },
  contlogins: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10
  },
  contentimg: {
    marginHorizontal: 20,
    width: 55,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 45,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 9,
      },
    }),
    backgroundColor: 'white'
  },
  imglogins: {
    width: 55,
    height: 50,
  },
  contrecover: {
    marginTop: '20%',
    flexDirection: 'row',
    width: '75%',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  textrecover: {
    fontSize: 14,
    fontFamily: 'poppins500'
  },
  recover: {
    fontSize: 14,
    fontFamily: 'poppins600',
    color: 'blue'
  }

});

export default LoginScreen;

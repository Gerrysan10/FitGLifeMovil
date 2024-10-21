import { StyleSheet, Text, View,Linking, Alert } from 'react-native';
import Title from '../components/Title';

const EmailLink = ({ email, subject, body }) => {
  const handleEmailLink = () => {
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(emailUrl).catch(err => Alert.alert('Error', 'no se pudo redirigir correctamente'));
  };

  return (
    <Text style={styles.gmail} onPress={handleEmailLink}>
      {email}.
    </Text>
  );
};

const HelpScreen = () => {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.conttitle}>
          <Title title={'Ayuda'} />
        </View>
          
          <View style={styles.continfo}>
              <Text style={styles.pantallas}>Contacto</Text>
              <Text style={styles.instruccion}>Si tiene preguntas o inquietudes, comuníquese con nosotros a través del correo:</Text>
              <EmailLink  email="soportefitglife@gmail.com" subject="Consulta" body="Escribe tu mensaje aquí" />
            </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  conttitle: {
    marginTop: '10%',
    marginHorizontal: '4%',
  },
  titulo2: {
    fontSize: 20,
    color: '#021f54',
    marginTop: '5%',
    fontFamily: 'poppins600',
  },
  pantallas: {
    fontFamily: 'poppins600',
    fontSize: 18,
  },
  continfo: {
    paddingHorizontal: '5%'
  },
  instruccion: {
    fontFamily: 'poppins600',
    fontSize: 17,
    marginTop: 10,
    color: '#35424a',
  },
  gmail: {
    fontWeight: '500',
    fontSize: 20,
    color: '#026BD4',
    textDecorationLine: 'underline',
  },
});

export default HelpScreen;

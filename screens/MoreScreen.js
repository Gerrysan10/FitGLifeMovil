import { useContext } from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity, Text, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import homeIcon from "../images/Icons/home.png";
import rutinIcon from "../images/Icons/pesa.png";
import historyIcon from "../images/Icons/progress.png";
import measuresIcon from "../images/Icons/measures.png";
import MycountIcon from '../images/Icons/mycount.png';
import helpIcon from '../images/Icons/help.png';
import securityIcon from '../images/Icons/security.png';
import logoutIcon from '../images/Icons/logout.png';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoreScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);

  const handleSingOut = () => {
    signOut();
    auth.signOut();
    deleteLocalUser();
  };

  const deleteLocalUser = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      
    } catch (error) {
      Alert.alert('Error', 'ocurrio un error al cerrar la sesión');
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.contscroll}>
      <TouchableOpacity style={styles.contopc} onPress={() => handleNavigation('Inicio')}>
        <View style={styles.contimg}>
          <Image source={homeIcon} style={{ width: 35, height: 30, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contopc} onPress={() => handleNavigation('Rutinas')}>
        <View style={styles.contimg}>
          <Image source={rutinIcon} style={{ width: 35, height: 20, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Rutinas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contopc} onPress={() => handleNavigation('Progreso')}>
        <View style={styles.contimg}>
          <Image source={historyIcon} style={{ width: 34, height: 34, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Progreso</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.contopc, { borderBottomColor: '#E4E7E2', borderBottomWidth: 1.5 }]} onPress={() => handleNavigation('Medidas')}>
        <View style={styles.contimg}>
          <Image source={measuresIcon} style={{ width: 40, height: 25, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Medidas corporales</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contopc} onPress={() => handleNavigation('Mycount')}>
        <View style={styles.contimg}>
          <Image source={MycountIcon} style={{ width: 30, height: 30, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Mi cuenta</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contopc} onPress={() => handleNavigation('HelpScreen')}>
        <View style={styles.contimg}>
          <Image source={helpIcon} style={{ width: 30, height: 29, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Ayuda</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.contopc, { borderBottomColor: '#E4E7E2', borderBottomWidth: 2 }]} onPress={() => handleNavigation('PrivacityScreen')}>
        <View style={styles.contimg}>
          <Image source={securityIcon} style={{ width: 30, height: 32, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Politica de privacidad</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contopc} onPress={handleSingOut}>
        <View style={styles.contimg}>
          <Image source={logoutIcon} style={{ width: 25, height: 25, tintColor: 'black', marginLeft: 10 }} />
        </View>
        <Text style={styles.texts}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contscroll: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  contopc: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contimg: {
    width: '12%'
  },
  texts: {
    fontFamily: 'poppins600',
    fontSize: 17,
    marginLeft: 40
  }
});

export default MoreScreen;

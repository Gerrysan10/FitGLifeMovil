import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ContNavAuth = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handlenavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.nav}>
      <TouchableOpacity
        onPress={() => handlenavigation('Login')}
        style={[
          styles.btnopc,
          route.name === 'Login' && styles.selected
        ]}
      >
        <Text
          style={[
            styles.navtext,
            route.name === 'Login' && styles.selectedText
          ]}
        >
          Iniciar sesión
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlenavigation('Register')}
        style={[
          styles.btnopc,
          route.name === 'Register' && styles.selected
        ]}
      >
        <Text
          style={[
            styles.navtext,
            route.name === 'Register' && styles.selectedText
          ]}
        >
          Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
    nav: {
        flexDirection: 'row',
        width: '65%',
        justifyContent: 'space-between',
    },
    navtext: {
        fontSize: 17,
        fontFamily: 'poppins500',
        color: 'black', 
    },
    btnopc: {
        paddingBottom: 5,
    },
    selectedText: {
        color: '#6ABDA6', 
    },
    selected: {
        borderBottomWidth: 2,
        borderBottomColor: '#6ABDA6',
    }
});

export default ContNavAuth;

import React, { useContext, useState,useEffect} from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// screens
import LoginScreen from "./screens/Login";
import RegisterScreen from "./screens/Register";
import HomeScreen from "./screens/HomeScreen";
import RoutinesScreen from "./screens/RoutinesScreen";
import RecordsScreen from "./screens/RecordsScreen";
import MoreScreen from "./screens/MoreScreen";
import MeasuresScreen from "./screens/MeasuresScreen";
// HomeStack
import CategoryScreen from "./screens/CategoryScreen";
import MyRoutinesDetails from "./screens/MyRoutinesDetails";
import WorkingScreen from "./screens/WorkingScreen";
import ExerciseScreen from "./screens/ExerciseScreen";

//Authstack
import RecoveryPassword from "./screens/RecoveryPassword";
//RoutinesStack
import ExerciseRoutines from "./screens/ExerciseRoutines";
//RecordStack
import DetailsMeasures from "./screens/DetailsMeasures";
//MoreSTack
import Mycount from "./screens/Mycount";
import HelpScreen from "./screens/HelpScreen";
import PrivacityScreen from "./screens/PrivacityScreen";
// images
import homeIcon from "./images/Icons/home.png";
import rutinIcon from "./images/Icons/pesa.png";
import historyIcon from "./images/Icons/progress.png";
import measuresIcon from "./images/Icons/measures.png";
import moreIcon from "./images/Icons/menu.png";
import userIcon from './images/Icons/user.png';
import returnIcon from './images/Icons/return.png'

const Tab = createMaterialBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const RoutinesStack = createNativeStackNavigator();
const RecordsStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();
const MeasureStack = createNativeStackNavigator();

const HeaderIcons = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.navprincipal}>
      <TouchableOpacity onPress={() => navigation.navigate('Mycount')}>
        <Image source={userIcon} style={styles.iconuser} />
      </TouchableOpacity>
    </View>
  );
};
const HeaderIconLeft = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.navsecundary}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={returnIcon} style={styles.iconreturn} />
      </TouchableOpacity>
    </View>
  );
};

const HeaderTextrigth = () => {
  return (
    <View style={styles.navcount}>
      <Text style={styles.textcount}>Mi cuenta</Text>
    </View>
  );
};

function MyStackHome() {
  return (
    <HomeStack.Navigator initialRouteName="HomeScreen">
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerRight: () => <HeaderIcons />,
          headerTitle: '',
        }}
      />
      <HomeStack.Screen
        name="Categorias"
        component={CategoryScreen}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }}
      />
      <HomeStack.Screen
        name="Ejercicios"
        component={ExerciseScreen}
        options={{

          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }}
      />
      <HomeStack.Screen
        name="MisRutinas"
        component={MyRoutinesDetails}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }}
      />

      <HomeStack.Screen
        name="Entrenando"
        component={WorkingScreen}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }}
      />
      <HomeStack.Screen name="Mycount" component={Mycount}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />,
          headerRight: () => <HeaderTextrigth />,
        }} />

    </HomeStack.Navigator>
  );
}


function MyStackRoutines() {
  return (
    <RoutinesStack.Navigator initialRouteName="RutinasScreen">
      <RoutinesStack.Screen name="RutinasScreen" component={RoutinesScreen}
        options={{
          headerRight: () => <HeaderIcons />,
          headerTitle: '',
        }} />
      <RoutinesStack.Screen name="RoutineDetails" component={ExerciseRoutines}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }} />
      <RoutinesStack.Screen name="Mycount" component={Mycount}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />,
          headerRight: () => <HeaderTextrigth />,
        }} />
     
    </RoutinesStack.Navigator>
  );
}

function MyStackRecords() {
  return (
    <RecordsStack.Navigator initialRouteName="RecordsScreen">
      <RecordsStack.Screen name="RecordsScreen" component={RecordsScreen}
        options={{
          headerRight: () => <HeaderIcons />,
          headerTitle: '',
        }} />
        
      <RecordsStack.Screen name="Mycount" component={Mycount}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />,
          headerRight: () => <HeaderTextrigth />,
        }} />
    </RecordsStack.Navigator>
  );
}

function MyStackMore() {
  return (
    <MoreStack.Navigator initialRouteName="MoreScreen">
      <MoreStack.Screen name="MoreScreen" component={MoreScreen}
        options={{
          headerRight: () => <HeaderIcons />,
          headerTitle: '',
        }} />
      <MoreStack.Screen name="Mycount" component={Mycount}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />,
          headerRight: () => <HeaderTextrigth />,
        }} />
      <MoreStack.Screen name="HelpScreen" component={HelpScreen}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }} />
      <MoreStack.Screen name="PrivacityScreen" component={PrivacityScreen}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }} />

    </MoreStack.Navigator>
  );
};

function MyStackMeasures() {
  return (
    <MeasureStack.Navigator initialRouteName="MeasuresScreen">
      <MeasureStack.Screen name="MeasuresScreen" component={MeasuresScreen}
        options={{
          headerRight: () => <HeaderIcons />,
          headerTitle: '',
        }} />
        <MeasureStack.Screen name="DetailsMeasures" component={DetailsMeasures}
         options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />
        }} />
      <MeasureStack.Screen name="Mycount" component={Mycount}
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderIconLeft />,
          headerRight: () => <HeaderTextrigth />,
        }} />
    </MeasureStack.Navigator>
  );
};

function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      activeColor="#6ABDA6"
      inactiveColor="black"
      barStyle={{
        backgroundColor: "white",
        height: 72,
        elevation: 10,
        borderTopWidth: 2,
        borderTopColor: '#E1E1E1',
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={MyStackHome}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Image source={homeIcon} style={[styles.icon, { tintColor: color }]} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Rutinas"
        component={MyStackRoutines}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Image source={rutinIcon} style={[styles.icon, { tintColor: color }]} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Progreso"
        component={MyStackRecords}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Image source={historyIcon} style={[styles.icon, { tintColor: color }]} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Medidas"
        component={MyStackMeasures}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Image source={measuresIcon} style={[styles.icon, { tintColor: color }]} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Más"
        component={MyStackMore}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Image source={moreIcon} style={[styles.icon, { tintColor: color }]} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Recovery" component={RecoveryPassword} 
      options={{
        headerTitle: '',
        headerLeft: () => <HeaderIconLeft />,
      }}/>
    </AuthStack.Navigator>
  );
}

export default function Navigation() {
  const { user, signIn } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        signIn(JSON.parse(userData));
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {user ? <MyTabs /> : <AuthStackNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  navprincipal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '96%',
  },

  iconuser: {
    width: 32,
    height: 32,
    borderRadius: 30,
    backgroundColor: '#6ABDA6'
  },
  iconnotification: {
    width: 30,
    height: 30,
    tintColor: '#05903E'
  },
  iconreturn: {
    width: 34,
    height: 34,
    marginRight: 20
  },
  navcount:{
    width:'50%',
    marginRight:'25%',
    alignItems:'center'
  },
  textcount:{
    fontSize:21,
    fontWeight:'500'
  }
});

import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ListRoutines = ({ routines, isLoading, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const handlenavigation = (item) => {
    navigation.navigate('RoutineDetails', { id: item.id, name: item.name, image: item.image });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh(); // Llama a la función de refresh que viene de los props
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#123abc" />
        <Text>Cargando</Text>
      </View>
    );
  }

  const routineItem = ({ item, index }) => (
    <TouchableOpacity 
      onPress={() => handlenavigation(item)} 
      style={[styles.routineItem, index % 2 === 0 ? styles.odd : styles.even]}
    >
      <View style={[styles.contImg, index % 2 === 0 ? styles.colorback1 : styles.colorback2]}>
        <Image source={{uri: item.image}} style={styles.routineImage} />
      </View>
      <Text style={styles.routineText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.listRoutines}>
      <FlatList
        data={routines}
        renderItem={routineItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#123abc']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listRoutines: {
    height: '65%',
    width: '100%',
    paddingVertical: 30,
  },
  spinnerContainer: {
    width: '100%',
    height: '65%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineItem: {
    flexDirection: 'row',
    width: '92%',
    height: 70,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 7,
    borderRadius: 15,
    marginHorizontal: '4%',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  contImg: {
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: '#757575',
    width: 60,
    height: 60,
    padding: 2,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  routineImage: {
    width: '75%',
    height: '75%',
  },
  routineText: {
    marginLeft: 15,
    fontSize: 18,
    fontFamily: 'poppins500',
  },
  even: {
    backgroundColor: '#A9D3AB',
  },
  odd: {
    backgroundColor: '#6ABDA6',
  },
  colorback1: {
    backgroundColor: '#A9D3AB',
  },
  colorback2: {
    backgroundColor: '#E7E6E6',
  }
});

export default ListRoutines;


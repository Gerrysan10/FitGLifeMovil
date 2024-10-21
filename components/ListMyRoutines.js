import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator, Platform, RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import imgvacio from '../images/Icons/vacio.png';
import ModalEdit from './ModalEdit';
import LoadingModal from '../components/ModalLoading';

const ListMyRoutines = ({ routines, userUid, isLoading, reloading, userId }) => {
  const navigation = useNavigation();
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);

  // Estados para manejar el modal de edición
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  // Estado para manejar el refresh
  const [refreshing, setRefreshing] = useState(false);

  const handlenavigation = (item) => {
    navigation.navigate('MisRutinas', { id: item.id, name: item.name });
  };

  const handleLongPress = (routine) => {
    setSelectedRoutine(routine);
    setIsEditModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false); // Cerrar el modal
    setSelectedRoutine(null);     // Limpiar la rutina seleccionada
  };

  const handleUpdateRoutine = () => {
    reloading();
    setIsEditModalVisible(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloading();  // Llama a la función reloading que actualiza la lista
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

  return (
    <View style={styles.listRoutines}>
      {routines.length > 0 ? (
        <FlatList
          data={routines}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handlenavigation(item)}
              onLongPress={() => handleLongPress(item)}
              style={[styles.routineItem, index % 2 === 0 ? styles.odd : styles.even]}
            >
              <View style={[styles.contImg, index % 2 === 0 ? styles.colorback1 : styles.colorback2]}>
                <Image source={{ uri: item.image }} style={styles.routineImage} resizeMode="cover" />
              </View>
              <Text style={styles.routineText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#123abc']}
            />
          }
        />
      ) : (
        <ScrollView  refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#123abc']}
          />
        }>
          <View style={styles.emptyContainer}>
          <Image style={styles.imgvacio} source={imgvacio} />
          <Text style={styles.textvacio}>Sin rutinas</Text>
          </View>
        </ScrollView>
      )}

      {selectedRoutine && (
        <ModalEdit
          isVisible={isEditModalVisible}
          onClose={handleCloseModal}
          userId={userId}
          uidUser={userUid}
          routineId={selectedRoutine.id}
          routineData={selectedRoutine}
          handleUpdateRoutine={handleUpdateRoutine}
          modalVisibleLoading={setModalVisibleLoading}
        />
      )}
      <LoadingModal isVisible={modalVisibleLoading} message={'Realizando operación, espere un momento'} />
    </View>
  );
};

const styles = StyleSheet.create({
  listRoutines: {
    height: '65%',
    width: '100%',
    paddingVertical: 30,
  },
  scrollcontainer:{
    flex:1,
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
    width: '100%',
    height: '100%',
    borderRadius: 30,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:'20%'
  },
  imgvacio: {
    width: 120,
    height: 120,
  },
  textvacio: {
    fontSize: 18,
    fontFamily: 'poppins500',
    color: '#8C908E'
  }
});

export default ListMyRoutines;

import { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import imgadd from '../images/Icons/add.png';
import Title from '../components/Title';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp, deleteDoc, doc, orderBy } from "firebase/firestore";
import ModalAddMeasures from '../components/ModalAddMeasures';
import imgvacio from '../images/Icons/vacio.png';
import ModalDelete from '../components/ModalDelete';
import { Verificar_conexion } from '../components/CheckConnection';

const DetailsMeasures = () => {
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const userId = user.id;
  const { name } = route.params;
  const [details, setDetails] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idDelete, setIdDelete] = useState(null)

  const fetchMeasurements = async () => {
    if (await Verificar_conexion()) {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, `users/${userId}/measurements`),
          where("category", "==", name),
          orderBy("date", "desc")
        );

        const snapshot = await getDocs(q);
        const fetchedDetails = snapshot.docs.map((doc) => {
          const data = doc.data();
          const date = data.date instanceof Timestamp
            ? data.date.toDate()
            : new Date(data.date);

          return {
            id: doc.id,
            date: date,
            info: data.info,
          };
        });


        const formattedDetails = fetchedDetails.map(detail => ({
          id: detail.id,
          date: detail.date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          info: detail.info,
        }));

        setDetails(formattedDetails);
      } catch (error) {
        Alert.alert('Error','Ocurrio un error al obtener las medidas')
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'No hay conexión a internet');
    }
  };

  const deleteMeasurement = async () => {
    if (await Verificar_conexion()) {
      closeDelete()
      try {
        await deleteDoc(doc(db, `users/${userId}/measurements`, idDelete));
        Alert.alert("Éxito", "La medida ha sido eliminada.");
        fetchMeasurements();
      } catch (error) {
        Alert.alert("Error", "No se pudo eliminar la medida. Inténtalo de nuevo.");
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet');
    }
  };

  const openDelete = (id) => {
    setIdDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDelete = () => {
    setModalDeleteVisible(false);
  };


  useEffect(() => {
    fetchMeasurements();
  }, [name]);

  const onClose = () => {
    setModalVisible(!isModalVisible);
  };

  const DataHistorial = () => {
    return (
      <>
        {details.length > 0 ? (
          <>
            {details.map((detail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{detail.date}</Text>
                <Text style={styles.tableCell}>{detail.info} {name === 'Peso' ? 'Kg' : 'cm'}</Text>
                <View style={styles.tableCell}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => openDelete(detail.id)}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Image style={styles.imgvacio} source={imgvacio} />
            <Text style={styles.textvacio}>Sin historial</Text>
          </View>
        )}
      </>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.conttitle}>
        <Title title={name} />
      </View>
      <View style={styles.contInfo}>
        <View style={styles.button}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.btnAdd}>
              <View style={styles.addIconContainer}>
                <Image source={imgadd} style={styles.imgAdd} resizeMode="contain" />
              </View>
              <Text style={styles.textAdd}>Agregar</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.title}>
          <Text style={styles.titleg}>Historial</Text>
        </View>
        {isLoading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#123abc" />
            <Text>Cargando</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Fecha</Text>
              <Text style={styles.tableHeaderCell}>Medida</Text>
              <Text style={styles.tableHeaderCell}>Acción</Text>
            </View>
            <ScrollView style={styles.scrollView}>
              <DataHistorial />
            </ScrollView>
          </View>
        )}
      </View>
      <ModalAddMeasures
        isVisible={isModalVisible}
        category={name}
        userId={userId}
        onClose={onClose}
        fetchMeasurements={fetchMeasurements}
      />
      <ModalDelete isVisible={isModalDeleteVisible} message={"¿Estás seguro de que quieres eliminar esta medida?"} onClose={closeDelete} function1={deleteMeasurement} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    height: 70,
  },
  spinnerContainer: {
    width: '100%',
    height: '65%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: '30%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgvacio: {
    width: 120,
    height: 120,
  },
  textvacio: {
    fontSize: 18,
    fontFamily: 'poppins500',
    color: '#8C908E'
  },
  conttitle: {
    marginTop: '10%',
    marginHorizontal: '4%',
  },
  contInfo: {
    marginTop: '10%',
    marginHorizontal: '4%',
  },
  button: {
    width: '100%',
    height: 50,
  },
  btnAdd: {
    width: 150,
    height: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#BEEADD',
    alignItems: 'center',
    borderRadius: 20,
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
  },
  titleg: {
    fontFamily: 'poppins600',
    marginTop: '8%',
    fontSize: 17,
    borderBottomWidth: 1.5,
    borderColor: '#A5AD9E',
  },
  scrollView: {
    minHeight: '70%',
    maxHeight: '80%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    padding: 4,
  },
  tableHeaderCell: {
    width: '33.3%',
    fontFamily: 'poppins600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    alignItems: 'center',
  },
  tableCell: {
    width: '33.3%',
    textAlign: 'center',
    fontFamily: 'poppins400',
    alignItems: 'center',
  },
  deleteButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#FF6B6B',
    padding: 5,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontFamily: 'poppins500',
    fontSize: 14,
  },
});

export default DetailsMeasures;
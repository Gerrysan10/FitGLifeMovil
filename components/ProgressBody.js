import { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Dimensions, Image, RefreshControl, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, orderBy, query, where, Timestamp, limit } from "firebase/firestore";
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';
import imgvacio from '../images/Icons/vacio.png';
import { Verificar_conexion } from './CheckConnection';

const screenWidth = Dimensions.get('window').width;

const ProgressBody = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bodyMeasurements, setBodyMeasurements] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Peso');
  const { user } = useContext(AuthContext);
  const userId = user.id;
  const [refreshing, setRefreshing] = useState(false);

  const fetchBodyMeasurements = async () => {
    if (await Verificar_conexion()) {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, `users/${userId}/measurements`),
          where("category", "==", selectedCategory),
          orderBy("date", "desc"),
          limit(30)
        );
        const measurementsSnapshot = await getDocs(q);
        const data = measurementsSnapshot.docs.map(doc => {
          const docData = doc.data();
          let date;
          if (docData.date instanceof Timestamp) {
            date = docData.date.toDate();
          } else if (typeof docData.date === 'string') {
            date = new Date(docData.date);
          } else {
            date = new Date();
          }
          return {
            date: date,
            info: docData.info,
            category: docData.category
          };
        });

        setBodyMeasurements(data);
        setIsLoading(false);
        setRefreshing(false)
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error','Ocurrio un error al obtener las medidas');
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet')
    }
  };
  useEffect(() => {
    fetchBodyMeasurements();
    setSelectedPoint(null);
  }, [selectedCategory, userId]);

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return 'Fecha inválida';
    }
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleDataPointClick = (data) => {
    const index = bodyMeasurements.length - 1 - data.index;
    const measurement = bodyMeasurements[index];
    const selectedData = {
      date: formatDate(measurement.date),
      value: measurement.info,
      label: selectedCategory,
    };
    setSelectedPoint(selectedData);
  };


  if (isLoading) {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#123abc" />
        <Text>Cargando</Text>
      </View>
    );
  }

  const data = {
    labels: bodyMeasurements.map(measurement => formatDate(measurement.date)).reverse(),
    datasets: [
      {
        data: bodyMeasurements.map(measurement => parseFloat(measurement.info)).reverse(),
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
    propsForLabels: {
      fontSize: 13,
      rotation: 0,
      originX: 0,
      textAnchor: 'middle',
    }
  };

  const chartWidth = Math.max(screenWidth, bodyMeasurements.length * 100);

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl
        refreshing={refreshing}
        onRefresh={fetchBodyMeasurements}
        colors={['#123abc']}
      />}
    >
      <View style={styles.contpicker}>
        <View style={styles.conttextpicker}>
          <Text style={styles.title}>Seleccione categoría:</Text>
        </View>
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item style={styles.textpicker} label="Peso (kg)" value="Peso" />
            <Picker.Item style={styles.textpicker} label="Altura (cm)" value="Altura" />
            <Picker.Item style={styles.textpicker} label="Pecho (cm)" value="Pecho" />
            <Picker.Item style={styles.textpicker} label="Cintura (cm)" value="Cintura" />
            <Picker.Item style={styles.textpicker} label="Caderas (cm)" value="Cadera" />
            <Picker.Item style={styles.textpicker} label="Muslo (cm)" value="Muslo" />
            <Picker.Item style={styles.textpicker} label="Bíceps (cm)" value="Bíceps" />
            <Picker.Item style={styles.textpicker} label="Pantorrilla (cm)" value="Pantorrilla" />
          </Picker>
        </View>
      </View>
      {bodyMeasurements.length > 0 ? (<>
        <Text style={styles.titleg}>Gráfica</Text>
        <Text style={styles.chartTitle}>Progreso en la medida</Text>
        <ScrollView horizontal>
          <LineChart
            data={data}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            onDataPointClick={handleDataPointClick}
          />
        </ScrollView>
        {selectedPoint && (
          <View style={styles.selectedPoint}>
            <Text style={styles.infoSelect}>Fecha: {selectedPoint.date}</Text>
            <Text style={styles.infoSelect}>
              {selectedPoint.label}: {selectedPoint.value} {(selectedCategory == 'Peso') ? 'kg' : 'cm'}
            </Text>
          </View>
        )}
        <Text style={styles.titleg}>Historial</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Fecha</Text>
            <Text style={styles.tableHeaderCell}>{selectedCategory}</Text>
          </View>
          {bodyMeasurements.map((measurement, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{formatDate(measurement.date)}</Text>
              <Text style={styles.tableCell}>{measurement.info} {(selectedCategory == 'Peso') ? 'kg' : 'cm'}</Text>
            </View>
          ))}
        </View>
      </>) : (
        <View style={styles.emptyContainer}>
          <Image style={styles.imgvacio} source={imgvacio} />
          <Text style={styles.textvacio}>No hay datos para mostrar</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contpicker: {
    flexDirection: 'row',
    width: '100%',
    marginTop: '5%',
  },
  conttextpicker: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontFamily: 'poppins600',
    textAlignVertical: 'center',
  },
  chartTitle: {
    fontSize: 13,
    fontFamily: 'poppins400',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  picker: {
    height: 40,
    width: '50%',
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    justifyContent: 'center',
  },
  textpicker: {
    fontSize: 15,
  },
  titleg: {
    fontFamily: 'poppins600',
    marginTop: '8%',
    fontSize: 17,
    borderBottomWidth: 1.5,
    borderColor: '#A5AD9E',
  },
  chart: {
    borderRadius: 16,
  },
  selectedPoint: {
    alignItems: 'center',
    marginVertical: 16,
  },
  table: {
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    padding: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%'
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
  infoSelect: {
    fontSize: 14,
    fontFamily: 'poppins500',
  }
});

export default ProgressBody;

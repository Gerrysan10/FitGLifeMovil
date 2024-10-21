import { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Dimensions, Image, RefreshControl, TextInput, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, limit, getDoc, doc } from "firebase/firestore";
import { AuthContext } from '../AuthContext';
import imgvacio from '../images/Icons/vacio.png';
import { Verificar_conexion } from './CheckConnection';

const screenWidth = Dimensions.get('window').width;

const ProgressRoutines = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState({});
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [exerciseList, setExerciseList] = useState([]);
  const { user } = useContext(AuthContext);
  const userId = user.id;
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getExerciseName = async (exerciseRef) => {
    if (await Verificar_conexion()) {
      try {
        const exerciseDoc = await getDoc(doc(db, exerciseRef.path));

        if (exerciseDoc.exists()) {
          const exerciseData = exerciseDoc.data();
          return exerciseData.name;
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    }else{
      Alert.alert('Error', 'No hay conexión a internet');
    }
  };

  const fetchTrainingData = async () => {
    if (await Verificar_conexion()) {
      setIsLoading(true)
      try {
        const q = query(collection(db, `users/${userId}/training`), orderBy("endTime", "desc"), limit(30));
        const trainingSnapshot = await getDocs(q);
        const data = {};
        const exerciseSet = new Set();

        for (const doc of trainingSnapshot.docs) {
          const training = doc.data();
          if (training.endTime != null) {
            const date = training.endTime.toDate();

            for (const exercise of training.exercises) {
              if (!exercise.series.some(serie => serie.add)) continue;

              const exerciseName = await getExerciseName(exercise.exercise);
              if (!exerciseName) continue;

              exerciseSet.add(exerciseName);
              if (!data[exerciseName]) {
                data[exerciseName] = [];
              }

              const maxWeight = Math.max(...exercise.series.filter(s => s.add).map(s => s.weight));
              data[exerciseName].push({
                date,
                weight: maxWeight,
                reps: exercise.reps,
                series: exercise.series.filter(s => s.add)
              });
            }
          }
        }

        setExerciseData(data);
        const sortedExercises = Array.from(exerciseSet).sort();
        setExerciseList(sortedExercises);
        setSelectedExercise(sortedExercises[0] || '');
        setIsLoading(false);
        setRefreshing(false);
      } catch (error) {
        Alert.alert('Error', 'Ocurrio un error al obtener el progreso')
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'No hay conexion a internet')
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  useEffect(() => {
    setSelectedPoint(null)
  }, [selectedExercise]);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleDataPointClick = (data) => {
    const index = selectedExerciseData.length - 1 - data.index;
    const measurement = selectedExerciseData[index];
    const selectedData = {
      date: measurement.date,
      weight: measurement.weight,
      reps: measurement.reps,
    };
    setSelectedPoint(selectedData);
  };

  if (isLoading) {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#123abc" />
        <Text>Cargando datos de entrenamiento...</Text>
      </View>
    );
  }

  const selectedExerciseData = exerciseData[selectedExercise] || [];
  const data = {
    labels: selectedExerciseData.map(item => formatDate(item.date)).reverse(),
    datasets: [
      {
        data: selectedExerciseData.map(item => item.weight).reverse(),
        color: (opacity = 1) => `rgba(106, 189, 166, ${opacity})`,
        strokeWidth: 2
      }
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

  const chartWidth = Math.max(screenWidth, selectedExerciseData.length * 100);

  const filteredExerciseList = exerciseList.filter(exercise =>
    exercise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScrollView
      refreshControl={<RefreshControl
        refreshing={refreshing}
        onRefresh={fetchTrainingData}
        colors={['#123abc']}
      />}
      style={styles.container}>
      {exerciseList.length > 0 ? (
        <>
          <View style={styles.contpicker}>
            <View style={styles.conttextpicker}>
              <Text style={styles.title}>Filtrar:</Text>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Ejercicios por coincidencia"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.contpicker}>
            <View style={styles.conttextpicker}>
              <Text style={styles.title}>Seleccione ejercicio:</Text>
            </View>
            <View style={styles.picker}>
              <Picker
                selectedValue={selectedExercise}
                onValueChange={(itemValue) => setSelectedExercise(itemValue)}
              >
                {filteredExerciseList.map((exercise, index) => (
                  <Picker.Item key={index} style={styles.textpicker} label={exercise} value={exercise} />
                ))}
              </Picker>
            </View>
          </View>
          <Text style={styles.titleP}>{selectedExercise}</Text>
          <Text style={styles.titleg}>Gráfica</Text>
          <Text style={styles.chartTitle}>Progreso de peso en el ejercicio</Text>
          <ScrollView horizontal>
            <LineChart
              data={data}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              onDataPointClick={(data) => handleDataPointClick(data)}
            />
          </ScrollView>
          {selectedPoint && (
            <View style={styles.selectedPoint}>
              <Text style={styles.infoSelect}>Fecha: {formatDate(selectedPoint.date)}</Text>
              <Text style={styles.infoSelect}>Peso: {selectedPoint.weight} kg</Text>
            </View>
          )}
          <Text style={styles.titleg}>Historial</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Fecha</Text>
              <Text style={styles.tableHeaderCell}>Peso Máx (kg)</Text>
              <Text style={styles.tableHeaderCell}>Reps</Text>
              <Text style={styles.tableHeaderCell}>Series</Text>
            </View>
            {selectedExerciseData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{formatDate(item.date)}</Text>
                <Text style={styles.tableCell}>{item.weight}</Text>
                <Text style={styles.tableCell}>{item.reps}</Text>
                <Text style={styles.tableCell}>{item.series.length}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Image style={styles.imgvacio} source={imgvacio} />
          <Text style={styles.textvacio}>Sin datos de entrenamiento</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    height: '30%',
    marginTop: '40%',
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
    color: '#8C908E',
    textAlign: 'center'
  },
  infoSelect: {
    fontSize: 14,
    fontFamily: 'poppins500',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    width: '50%',
    borderWidth: 1,
    height: 40,
    borderRadius: 20,
    padding: 5,
    borderColor: '#bbbbbb',
    fontSize: 16,
  },
  contpicker: {
    flexDirection: 'row',
    width: '100%',
    marginTop: '5%'
  },
  conttextpicker: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontFamily: 'poppins600',
    textAlignVertical: 'center'
  },
  picker: {
    height: 40,
    width: '50%',
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    justifyContent: 'center'
  },
  textpicker: {
    fontSize: 15,
  },
  titleP: {
    fontFamily: 'poppins500',
    marginTop: '8%',
    fontSize: 17,
    color: '#0c560c'
  },
  titleg: {
    fontFamily: 'poppins600',
    marginTop: '5%',
    fontSize: 17,
    borderBottomWidth: 1.5,
    borderColor: '#A5AD9E'
  },
  chartTitle: {
    fontSize: 13,
    fontFamily: 'poppins400',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
  },
  selectedPoint: {
    alignItems: 'center',
    marginTop: 8,
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
});

export default ProgressRoutines;

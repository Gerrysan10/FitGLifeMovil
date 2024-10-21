import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import Title from '../components/Title';
import { useNavigation } from '@react-navigation/native';
import imgpeso from "../images/measures/weight.png";
import imgaltura from "../images/measures/altura.png";
import imgpecho from "../images/measures/chest.png";
import imgbiceps from "../images/measures/biceps.png";
import imgmuslo from "../images/measures/thigh.png";
import imgcintura from "../images/measures/waist.png";
import imgcadera from "../images/measures/hip.png";
import imgpantorrilla from "../images/measures/calf.png";

const MeasuresScreen = () => {
  const navigation = useNavigation();
  const categories = [
    { id: 1, name: 'Peso', image: imgpeso },
    { id: 2, name: 'Altura', image: imgaltura },
    { id: 3, name: 'Pecho', image: imgpecho },
    { id: 4, name: 'Bíceps', image: imgbiceps },
    { id: 5, name: 'Muslo', image: imgmuslo },
    { id: 6, name: 'Cintura', image: imgcintura },
    { id: 7, name: 'Cadera', image: imgcadera },
    { id: 8, name: 'Pantorrilla', image: imgpantorrilla },
  ];

  const handlenavigation = (name) => {
    navigation.navigate('DetailsMeasures',{name});
  };

  const renderCategory = ({ item }) => {
    const containerStyle = [
      styles.categoryContainer,
      { backgroundColor: item.id % 2 === 0 ? '#D4EFD6' : '#9CD0C1' },
    ];
  
    return (
      <TouchableOpacity onPress={() => handlenavigation(item.name)} style={containerStyle}>
        <Image source={item.image} style={styles.categoryImage} />
        <Text style={styles.categoryText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Title title={'Medidas corporales'} />
      </View>
      <View style={styles.containerMeasures}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
          showsVerticalScrollIndicator={false} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: '10%',
    marginHorizontal: '4%',
  },
  containerMeasures: {
    flex: 1, 
  },
  flatListContainer: {
    paddingHorizontal: '4%',
  },
  categoryContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  categoryImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'poppins600',
    textAlign: 'center',
  },
});

export default MeasuresScreen;

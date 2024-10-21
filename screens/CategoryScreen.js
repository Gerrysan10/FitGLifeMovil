import { useState } from 'react';
import { StyleSheet, Text, Image, FlatList, TouchableOpacity, View } from 'react-native';
import HeaderSearch from '../components/HeaderSearch';
import { useNavigation, useRoute } from '@react-navigation/native';
import imgcuadriceps from '../images/categories/cuadricep.png';
import imgtriceps from '../images/categories/triceps.png';
import imgbiceps from '../images/categories/biceps.png';
import imgpantorrilla from '../images/categories/pantorrilla.png';
import imgtrapecio from '../images/categories/trapecio.png';
import imgpecho from '../images/categories/pecho.png';
import imghombro from '../images/categories/hombro.png';
import imggluteo from '../images/categories/gluteos.png';
import imgfemoral from '../images/categories/femoral.png';
import imgespalda from '../images/categories/espalda.png';
import imgoblicuo from '../images/categories/oblicuo.png';
import imgabdomen from '../images/categories/abdominal.png';
import imgantebrazo from '../images/categories/antebrazo.png';
import imgbraquial from '../images/categories/braquial.png';

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, name } = route.params;
  
  const categories = [
    { id: 1, name: 'Cuadríceps', image: imgcuadriceps },
    { id: 2, name: 'Tríceps', image: imgtriceps },
    { id: 3, name: 'Pecho', image: imgpecho },
    { id: 4, name: 'Espalda', image: imgespalda },
    { id: 5, name: 'Bíceps', image: imgbiceps },
    { id: 6, name: 'Femoral', image: imgfemoral },
    { id: 7, name: 'Hombro', image: imghombro },
    { id: 8, name: 'Glúteo', image: imggluteo },
    { id: 9, name: 'Pantorrilla', image: imgpantorrilla },
    { id: 10, name: 'Trapecio', image: imgtrapecio },
    { id: 11, name: 'Oblicuo', image: imgoblicuo },
    { id: 12, name: 'Abdomen', image: imgabdomen },
    { id: 13, name: 'Antebrazo', image: imgantebrazo },
    { id: 14, name: 'Braquial', image: imgbraquial },
  ];

  // Estado para el texto de búsqueda y las categorías filtradas
  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);

  // Función para manejar el filtro de categorías
  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredCategories(categories); // Si no hay texto, muestra todas las categorías
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  // Función para navegar a la pantalla de ejercicios
  const handlenavigation = (nameExercise) => {
    navigation.navigate('Ejercicios', { id, name, nameExercise });
  };

  // Renderiza cada categoría en el FlatList
  const renderCategory = ({ item }) => {
    const containerStyle = [
      styles.categoryContainer,
      { backgroundColor: item.id % 2 === 0 ? '#A9D3AB' : '#6ABDA6' },
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
      {/* HeaderSearch ahora pasa la función de búsqueda */}
      <HeaderSearch title="¿Qué quieres entrenar?" functionsearch={handleSearch} />
      <Text style={styles.textsub}>Categorías</Text>
      <FlatList
        data={filteredCategories}  // Usar categorías filtradas en lugar de todas
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textsub: {
    fontSize: 18,
    fontFamily: 'poppins600',
    marginHorizontal: '4%',
    marginTop: '4%',
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

export default CategoryScreen;

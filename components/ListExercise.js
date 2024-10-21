import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Platform, ActivityIndicator } from 'react-native';
import ModalAddExercise from './ModalAddExercise';

const ListExercise = ({userId,routineId,routineName,ListExercises, isLoading, openEdit}) => {

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const handlenavigation = (exercise) => {
        setSelectedExercise(exercise);
        setModalVisible(true);
    };


    const routineItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => handlenavigation(item)}
            onLongPress={()=> openEdit(item)}
            style={[styles.routineItem, index % 2 === 0 ? styles.odd : styles.even]}
        >
            <View style={[styles.contImg, index % 2 === 0 ? styles.colorback2 : styles.colorback1]}>
                <Image source={{uri: item.image}} style={styles.routineImage} />
            </View>
            <View>
                <Text 
                    style={styles.exerciseText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.name}
                </Text>
            </View>
        </TouchableOpacity>
    );
    

    if (isLoading) {
        return (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#123abc" />
            <Text>Cargando</Text>
          </View>
        );
      }

    return (
        <View style={styles.listExercise}>
            <FlatList
                data={ListExercises}
                renderItem={routineItem}
                keyExtractor={(item) => item.id.toString()}
            />
            {selectedExercise && (
                <ModalAddExercise
                    userId = {userId}
                    routineId ={routineId}
                    routineName={routineName}
                    isVisible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    exercise={selectedExercise}
                    
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    spinnerContainer: {
        width:'100%',
        height:'65%',
        justifyContent: 'center',
        alignItems: 'center',
      },
    listExercise: {
        height: '64%',
        width: '100%',
        marginBottom: '2%',
        marginTop: '5%',
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
        borderRadius: 60,
        borderWidth: 0.5,
        borderColor: '#757575',
        width: 60,
        height: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    routineImage: {
        borderRadius: 60,
        width: '100%',
        height: '100%',
    },
    exerciseText: {
        marginLeft: '5%',
        fontSize: 15,
        fontFamily: 'poppins500',
        width:250
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
});

export default ListExercise;

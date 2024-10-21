import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Title = ({title}) => {
  return (
    <View style={styles.header}>
          <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 40,
        marginBottom: 10,
      },
      text: {
        fontSize: 26,
        fontFamily:'poppins600'
      },
      
});

export default Title;
import { StyleSheet, Text,TouchableOpacity } from 'react-native';

const ButtonAuth = ({text,onPress}) => {
    
    return (
        <TouchableOpacity style={styles.btn} onPress={onPress}>
            <Text style={styles.textbtn}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn:{
        width:'100%',
        height:50,
        backgroundColor:'#6ABDA6',
        justifyContent:'center',
        borderRadius:40
    },
    textbtn:{
        textAlign:'center',
        color:'white',
        fontFamily:'poppins600',
        fontSize:16
    }
});

export default ButtonAuth;
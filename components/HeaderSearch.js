import Search from './Search';
import Title from './Title';
import { StyleSheet, View } from 'react-native';

const HeaderSearch = ({ title, functionsearch }) => {
    return (
        <View style={styles.contheader}>
            <Title title={title} />
            <Search  functionsearch={functionsearch}/>
        </View>
    );
}

const styles = StyleSheet.create({
    contheader: {
        paddingHorizontal: '4%',
        marginTop:'10%'
    },
});

export default HeaderSearch;
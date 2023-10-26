import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from '../../components/Themed';

export default function GameId() {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Game ID: {id}</Text>;
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
});
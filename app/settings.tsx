import {StyleSheet, useColorScheme, Appearance} from 'react-native';
import {useNavigation} from 'expo-router';

import {Text, View} from '../components/Themed';
import Separator from '../components/Separator';
import {useEffect} from 'react';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {bluePrimary} from "../constants/Css";

export default function SettingsScreen() {
    const navigation = useNavigation();
    const currentTheme = useColorScheme();

    useEffect(() => {
        navigation.setOptions({title: 'Réglages'});
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Réglages</Text>
            <View style={{flexDirection: 'row'}}>
                <BouncyCheckbox
                    isChecked={currentTheme === 'dark'}
                    textComponent={<Text style={styles.text}>La partie est finie dès qu'un joueur a gagné</Text>}
                    onPress={console.log}
                    fillColor={bluePrimary}
                    unfillColor="#334155"
                    size={25}
                />
            </View>
            <Separator/>
            <View style={{flexDirection: 'row'}}>
                <BouncyCheckbox
                    isChecked={currentTheme === 'dark'}
                    textComponent={<Text style={styles.text}>Mode sombre</Text>}
                    // onPress={() => Appearance.setColorScheme(currentTheme === 'dark' ? 'light' : 'dark')}
                    fillColor={bluePrimary}
                    unfillColor="#334155"
                    size={25}
                />
            </View>
            <View>
                <Text style={{textAlign: 'center'}}>Cette option sera bientôt disponible, en attendant vous pouvez
                    changer le mode sombre dans les paramètres de votre téléphone.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    text: {
        margin: 20,
        fontSize: 16,
    },
});

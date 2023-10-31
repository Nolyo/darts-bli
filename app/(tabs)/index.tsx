import {Container, View} from '../../components/Themed';
import Separator from '../../components/Separator';
import ButtonLink from '../../components/ButtonLink';
import {StyleSheet} from "react-native";
import React from "react";
import {ImageBackground} from "react-native";

export default function TabOneScreen() {

    return (
        <Container style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/dartsbbli.png')}
                resizeMode="cover"
                style={styles.image}
            >
                <View style={styles.container}>
                    <ButtonLink href='/game/new'>
                        Nouvelle partie
                    </ButtonLink>
                    <Separator/>
                    <ButtonLink href='/game/find' style={{color: '#fff'}}>
                        Chercher une partie
                    </ButtonLink>
                </View>
            </ImageBackground>
        </Container>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0553',
    },
    image: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',

    },
});
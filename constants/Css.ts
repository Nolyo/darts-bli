import {StyleSheet} from "react-native";

export const backgroundColor = '#030712';
export const bluePrimary = '#0284c7';
export const multiplierSimple = '#16a34a';
export const multiplierDouble = '#ea580c';
export const multiplierTriple = '#b91c1c';

export default StyleSheet.create({
    card: {
        backgroundColor: bluePrimary,
        borderRadius: 10,
        borderColor: '#FFF',
        borderWidth: 2,
        padding: 10,
        marginVertical: 25,
        marginHorizontal: 20,
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardText: {
        color: '#fff',
        fontSize: 25,
        alignSelf: 'center'
    },
    containerBoxDarts: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '100%',
    },
    boxDarts: {
        marginHorizontal: 10,
        marginVertical: 5,
        fontSize: 18,
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: '#334155',
        padding: 10,
        width: 45,
        textAlign: 'center',
        borderRadius: 4
    },
    boxDartsDouble: {
        width: 90,
    },
    multiplierBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginVertical: 20,
        marginHorizontal: 20,
    },
    multiplier: {
        padding: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#334155',
        fontSize: 18,
        borderRadius: 4
    },
    tempDart: {
        borderRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 10,
        minWidth: 80,
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 32,
        borderWidth: 5,
        borderStyle: 'solid',
        borderColor: '#fff',
        backgroundColor: '#334155',
    },
    trashDartIcon: {
        position: 'absolute',
        right: -10,
        top: -10,
        fontSize: 20,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 50,
        width: 30,
        height: 30,
        textAlign: 'center',
        lineHeight: 27,
    },
    tempDartScore: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
    },
    tempDartDetail: {
        fontSize: 11,
        color: '#fff',
    },
    resumeDarts: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
        flex: 1,
        alignItems: 'flex-end'
    },
    relative: {
        position: 'relative'
    },
    noGame: {color: multiplierTriple, marginVertical: 20, fontSize: 26},
    flexBoxCenter: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    modalSettings: {
        position: 'absolute',
        top: 150,
        left: '5%',
        backgroundColor,
        paddingHorizontal: 10,
        borderRadius: 10,
        width: '90%',
        borderWidth: 1,
        borderColor: '#fff',
        minHeight: 200,
        flex: 1
    },
    flexBox: {flex: 1, alignItems: 'center', width: '100%'},
    bgImage: {
        flex: 1,
        width: '100%',
        size: 'cover',
    },
});
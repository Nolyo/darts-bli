import { StyleSheet } from 'react-native';
import { Text } from './Themed';
import { Link } from 'expo-router';


export default function ButtonLink(props: {href: any, children?: any}) {
    return (
        <Link href={props.href} style={styles.button}>
            <Text>{props.children}</Text>
        </Link>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#0ea5e9',
    },
});
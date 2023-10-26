import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Themed';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

type Props = {
    href: any;
    children?: string | JSX.Element;
    asChild?: boolean;
    icon?: any;
    style?: StyleProp<ViewStyle | TextStyle>;
    iconStyle?: StyleProp<ViewStyle | TextStyle>;
};

export default function ButtonLink(props: Props) {
    return (
        <Link
            href={props.href}
            style={[styles.button, props.style]}
            asChild={props.asChild}
        >
            {props.children ? <Text>{props.children}</Text> : null}
            {props.icon ? (
                <Pressable>
                    {({ pressed }) => (
                        <FontAwesome
                            name={props.icon}
                            size={25}
                            color="#fff"
                            style={[{ opacity: pressed ? 0.5 : 1 }, props.iconStyle]}
                        />
                    )}
                </Pressable>
            ): null}
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
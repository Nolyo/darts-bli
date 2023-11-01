import {Pressable, StyleSheet, useColorScheme} from 'react-native';
import {Text} from './Themed';
import {Link} from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {StyleProp, ViewStyle, TextStyle} from 'react-native';

type Props = {
    href: any;
    children?: string | JSX.Element;
    asChild?: boolean;
    icon?: any;
    style?: StyleProp<ViewStyle | TextStyle>;
    iconStyle?: StyleProp<ViewStyle | TextStyle>;
};

export default function ButtonLink(props: Props) {
    const theme = useColorScheme();

    return (
        <Pressable>
            {({pressed}) => (
                <Link
                    href={props.href}
                    style={[styles.button, props.style]}
                    asChild={props.asChild}
                >
                    {props.children ? <Text>{props.children}</Text> : null}
                    {props.icon ? (
                        <FontAwesome
                            name={props.icon}
                            size={25}
                            color={theme === 'dark' ? '#fff' : '#000'}
                            style={[{opacity: pressed ? 0.5 : 1}, props.iconStyle]}
                        />
                    ) : null}
                </Link>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#0ea5e9',
    },
});
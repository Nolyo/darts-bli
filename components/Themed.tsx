/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {ImageBackground, Text as DefaultText, useColorScheme, View as DefaultView} from 'react-native';

import Colors from '../constants/Colors';
import styles from "../constants/Css";

type ThemeProps = {
    lightColor?: string;
    darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
    const theme = useColorScheme() ?? 'dark';
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors[theme][colorName];
    }
}

export function Text(props: TextProps) {
    const {style, lightColor, darkColor, ...otherProps} = props;
    const color = useThemeColor({light: lightColor, dark: darkColor}, 'text');

    return <DefaultText style={[{color}, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
    const {style, lightColor, darkColor, ...otherProps} = props;
    const backgroundColor = useThemeColor({light: lightColor, dark: darkColor}, 'background');

    return <DefaultView style={[{backgroundColor}, style]} {...otherProps} />;
}

export function Title(props: ViewProps) {
    const {style, ...otherProps} = props;

    return <Text style={[{fontSize: 20, fontWeight: 'bold', marginTop: 20}, style]} {...otherProps} />;
}

export function Container(props: ViewProps) {
    const {style, ...otherProps} = props;

    return <View style={[{flex: 1, alignItems: 'center', justifyContent: 'center'}, style]} {...otherProps} />;
}

export function ImageBg(props: ViewProps) {
    const {style, children, lightColor, darkColor, ...otherProps} = props;
    const backgroundColor = useThemeColor({light: lightColor, dark: darkColor}, 'background');

    console.log(backgroundColor)
    return <ImageBackground
        source={require('../assets/images/dartsbbli.png')}
        resizeMode="cover"
        style={[styles.bgImage, {backgroundColor}, props.style]}
        {...otherProps}
    > {children}
    </ImageBackground>;
}

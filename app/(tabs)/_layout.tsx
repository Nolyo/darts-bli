import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Tabs} from 'expo-router';
import {useColorScheme} from 'react-native';

import Colors from '../../constants/Colors';
import ButtonLink from '../../components/ButtonLink';
import {View} from '../../components/Themed';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
export function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
    style?: {};
    onPress?: () => void;
}) {
    return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    const aboutLink = () => (
        <View style={{flexDirection: 'row', backgroundColor: 'transparent'}}>
            <ButtonLink
                href="/about"
                icon="info-circle"
                style={{backgroundColor: "transparent"}}
            />
            <ButtonLink
                href="/settings"
                icon="cogs"
                style={{backgroundColor: "transparent"}}
                iconStyle={{marginRight: 12}}
            />
        </View>
    );

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dart\'s bli (alpha)',
                    tabBarIcon: ({color}) => <TabBarIcon name="home" color={color}/>,
                    headerRight: aboutLink,
                }}
            />
            <Tabs.Screen
                name="two"
                options={{
                    title: 'Météo',
                    tabBarIcon: ({color}) => <TabBarIcon name="sun-o" color={color}/>,
                }}
            />
        </Tabs>
    );
}

import React, {useEffect} from 'react';
import {useAssets} from "expo-asset";
import { Image } from 'expo-image';

type Props = {
    asset: any
    style?: any
}
const MyImage = (props: Props) => {
    const [assets, error] = useAssets([props.asset]);

    // @ts-ignore
    return assets ? <Image source={assets[0]} {...props} /> : null;
};

export default MyImage;
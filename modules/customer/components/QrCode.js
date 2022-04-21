import React from 'react'
import {View} from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'
import {RNCamera} from 'react-native-camera'

export default function QrCode({navigation})
{
    const scanSuccess = (data) => {
        
    }

    return (
        <QRCodeScanner
            onRead={(e)=>scanSuccess(e.data)}
            flashMode={RNCamera.Constants.FlashMode.torch}
        ></QRCodeScanner>
    )
}
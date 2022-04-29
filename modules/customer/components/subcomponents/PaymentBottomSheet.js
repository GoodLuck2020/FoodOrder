import React from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import Modal from 'react-native-modal';

import Images from '../../../theme/Images';
import Styles from "../../../theme/Styles";
import {formatCardNumber} from "../../../theme/functions";

export default class PaymentBottomSheet extends React.Component {
    render() {
        const {
            isVisible,
            onClose,
            cards,
            selectedCard,
            onSelect
        } = this.props;
        return (
            <Modal
                onBackButtonPress={onClose}
                onBackdropPress={onClose}
                isVisible={isVisible}
                style={styles.container}
            >
                <View style={styles.contentView}>
                    <View style={[styles.oneRowCenter, {width: '100%'}]}>
                        <Text style={styles.sheetTitleText}>Choose Payment</Text>
                        <TouchableOpacity
                            style={styles.sheetCloseButton}
                            onPress={() => onClose()}
                        >
                            <Image
                                style={styles.sheetCloseImage}
                                source={Images.icon_close}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.rowCenterBetween}>
                        <View style={styles.payCardWrapper}>
                            <Image style={styles.applePayImage} source={Images.icon_apple_pay} />
                            <Text style={styles.paymentText}>Apple Pay</Text>
                            <Image style={[styles.checkImage, {marginTop: 20, marginLeft: 'auto'}]} source={Images.icon_unchecked} />
                        </View>
                        <View style={styles.payCardWrapper}>
                            <Image style={styles.paypalImage} source={Images.icon_paypal} />
                            <Text style={styles.paymentText}>Pay Pal</Text>
                            <Image style={[styles.checkImage, {marginTop: 20, marginLeft: 'auto'}]} source={Images.icon_unchecked} />
                        </View>
                    </View>
                    <Text style={styles.subText}>Credit</Text>
                    {cards && cards.map((item, index) => (
                        <TouchableOpacity style={[Styles.rowCenterBetween, styles.border]} key={index} onPress={() => onSelect(item)}>
                            <Text style={styles.cardText}>{formatCardNumber(item.number)}</Text>
                            <Image style={styles.checkImage} source={selectedCard && selectedCard.number == item.number ? Images.icon_checked : Images.icon_unchecked} />
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        margin: 0,
    },

    contentView: {
        backgroundColor: '#EEF3FC',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },

    oneRowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    sheetTitleText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15,
    },

    sheetCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
    },

    sheetCloseImage: {
        width: 18,
        height: 18,
    },

    sheetButton: {
        marginTop: 15,
        marginBottom: 10,
    },

    subText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 15
    },

    payCardWrapper: {
        backgroundColor: 'white',
        padding: 15,
        width: '48%',
        borderRadius: 5
    },

    applePayImage: {
        width: 50,
        height: 30,
        resizeMode: 'contain'
    },

    paypalImage: {
        width: 70,
        height: 30,
        resizeMode: 'contain'
    },

    paymentText: {
        color: '#7D849A',
        fontSize: 14
    },

    border: {
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
        paddingBottom: 10,
        marginBottom: 15
    },

    cardText: {
        color: '#7D849A',
        fontSize: 15
    },

    checkImage: {
        width: 24,
        height: 24
    }
});

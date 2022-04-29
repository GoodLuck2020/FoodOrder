import React from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import Modal from 'react-native-modal';

import Images from '../../../theme/Images';
import Styles from "../../../theme/Styles";

export default class AddressBottomSheet extends React.Component {
    render() {
        const {
            isVisible,
            onClose,
            addresses,
            selectedAddress,
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
                        <Text style={styles.sheetTitleText}>Choose Delivery Address</Text>
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
                    {addresses && addresses.map((item, index) => (
                        <TouchableOpacity style={[Styles.rowCenterBetween, styles.border]} key={index} onPress={() => onSelect(item)}>
                            <View style={[Styles.rowCenterBetween, {width: '100%'}]}>
                                <View>
                                    <Text style={styles.categoryText}>Home</Text>
                                    <Text style={styles.addressText}>{item.address}</Text>
                                </View>
                                <Image style={styles.checkImage} source={selectedAddress && selectedAddress.address == item.address ? Images.icon_checked : Images.icon_unchecked} />
                            </View>

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

    border: {
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
        paddingBottom: 10,
        marginBottom: 15,
    },

    categoryText: {
        color: '#222222',
        fontSize: 17
    },

    addressText: {
        color: '#7D849A',
        fontSize: 15
    },

    checkImage: {
        width: 24,
        height: 24
    }
});

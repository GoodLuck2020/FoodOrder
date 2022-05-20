import React, {Component} from 'react';
import {View, StyleSheet, FlatList, Text, Image, TouchableOpacity, Dimensions, Alert} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import Toast from 'react-native-easy-toast';

import Styles from "../../../theme/Styles";
import Images from "../../../theme/Images";
import RoundTextInput from "./RoundTextInput";
import RoundButton from "./RoundButton";
import {formatCardNumber} from "../../../theme/functions";
import PaymentBottomSheet from "./PaymentBottomSheet";
import AddressBottomSheet from "./AddressBottomSheet";
import Stripe from "tipsi-stripe";
import config from "../../config";
import {Auth} from "aws-amplify";
import Loading from "react-native-loading-spinner-overlay";

const sWidth = Dimensions.get('window').width;

export default class CheckoutScreen extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            restaurant: null,
            profile: null,
            menuItems: [],
            promoCode: '',
            comment: '',
            selectedAddress: null,
            selectedPayment: null,

            isShowPaymentSheet: false,
            isShowAddressSheet: false,
        };
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener(
            'focus',
            this.willFocusPage,
        );
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
        this.focusListener();
    }

    willFocusPage = () => {
        if (this.props.route && this.props.route.params) {
            const {restaurant, profile, items, promoCode, payment} = this.props.route.params;
            if (profile && profile.customerInfo && profile.customerInfo.address) {
                this.setState({selectedAddress: profile.customerInfo.address});
            }
            this.setState({restaurant, profile, menuItems: items, promoCode, selectedPayment: payment});
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Content //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    _renderContent() {
        const { restaurant, profile, selectedPayment, selectedAddress, comment, isShowPaymentSheet, isShowAddressSheet } = this.state;
        const restaurantName = restaurant ? restaurant.Profile.restaurantInfo.restaurantName : '';
        const addresses = profile && profile.customerInfo ? [profile.customerInfo.address] : [];
        const cards = profile && profile.paymentOptions && profile.paymentOptions.cards ? profile.paymentOptions.cards : [];
        return (
            <View style={styles.contentWrapper}>
                <View style={styles.itemWrapper}>
                    <View style={Styles.rowCenter}>
                        <Image style={styles.itemImage} source={Images.icon_order} />
                        <Text style={styles.itemTitleText}>My Order</Text>
                    </View>
                    <View style={[Styles.rowCenterBetween, styles.border]}>
                        <View style={Styles.rowCenter}>
                            <Image style={styles.contentImage} source={Images.icon_location} />
                            <Text style={styles.contentText}>{restaurantName}</Text>
                        </View>
                        <Text style={styles.priceText}>${this.getTotal()}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.itemWrapper} onPress={this.onSelectAddress}>
                    <View style={Styles.rowCenter}>
                        <Image style={styles.itemImage} source={Images.icon_location} />
                        <Text style={styles.itemTitleText}>Delivery Address</Text>
                    </View>
                    {selectedAddress ?
                        (
                            <View style={[Styles.rowCenterBetween, styles.border]}>
                                <Text style={styles.contentText}>{selectedAddress.address}</Text>
                            </View>
                        ) : null
                    }
                </TouchableOpacity>
                <View style={styles.itemWrapper}>
                    <View style={Styles.rowCenter}>
                        <Image style={styles.itemImage} source={Images.icon_card} />
                        <Text style={styles.itemTitleText}>Payment Method</Text>
                    </View>
                    {selectedPayment ?
                        (
                            <View style={[Styles.rowCenterBetween, styles.border]}>
                                <Text style={styles.contentText}>xxxx xxxx xxxx {selectedPayment.card.last4}</Text>
                            </View>
                        ) : null
                    }
                </View>
                <View style={styles.itemWrapper}>
                    <RoundTextInput
                        label={'COMMENT'}
                        type="textview"
                        value={comment}
                        returnKeyType="done"
                        onChangeText={text => this.setState({comment: text})}
                        onSubmitEditing={this.onSendOrder}
                    />
                </View>
                {/*<PaymentBottomSheet*/}
                {/*    isVisible={isShowPaymentSheet}*/}
                {/*    onClose={() => this.setState({ isShowPaymentSheet: false })}*/}
                {/*    cards={cards}*/}
                {/*    selectedCard={selectedPayment}*/}
                {/*    onSelect={this.onChangePayment}*/}
                {/*/>*/}
                <AddressBottomSheet
                    isVisible={isShowAddressSheet}
                    onClose={() => this.setState({ isShowAddressSheet: false })}
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSelect={this.onChangeAddress}
                />
            </View>
        )
    }

    onSelectAddress = () => {
        this.setState({isShowAddressSheet: true});
    }

    onSelectPayment = () => {
        this.setState({isShowPaymentSheet: true});
    }

    onChangeAddress = (item) => {
        this.setState({selectedAddress: item, isShowAddressSheet: false});
    }

    onChangePayment = (item) => {
        this.setState({selectedPayment: item, isShowPaymentSheet: false});
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Footer //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    _renderFooter() {
        return (
            <View style={styles.footerWrapper}>
                <RoundButton
                    theme={'main'}
                    enabled={true}
                    title={'SEND ORDER'}
                    onPress={this.onSendOrder}
                />
            </View>
        )
    }

    onSendOrder = () => {
        const { selectedPayment, menuItems, restaurant, profile, promoCode } = this.state;
        if (!selectedPayment) {
            this.toast.show('Please select a payment card.', 2000);
            return;
        }
        let total = this.getTotal();
        const restaurantName = restaurant ? restaurant.Profile.restaurantInfo.restaurantName : '';
        const restaurantInfo = restaurant && restaurant.Profile.restaurantInfo ? restaurant.Profile.restaurantInfo : null;
        const items = [];
        for (const menu of menuItems) {
            items.push({
                item: menu.item_name,
                price: menu.item_price,
            });
        }
        try {
            Alert.alert(
                'Confirm',
                'Are you sure you want to pay for this order?',
                [
                    {
                        text: 'Yes',
                        onPress: () => {
                            this.setState({isLoading: true});
                            Stripe.setOptions({publishableKey: config.pk_test});
                            Auth.currentUserInfo().then(async (info) => {
                                const body = {
                                    amount: total,
                                    token: selectedPayment.tokenId,
                                    description:
                                        info.username + ' has purchased ' + restaurantName,
                                };

                                const response = await fetch(
                                    'https://veml8u1rjb.execute-api.us-west-1.amazonaws.com/beta/payment',
                                    {
                                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                                        mode: 'cors', // no-cors, *cors, same-origin
                                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                                        credentials: 'same-origin', // include, *same-origin, omit
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Connection: 'keep-alive',
                                            // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
                                        },
                                        redirect: 'follow', // manual, *follow, error
                                        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                                        body: JSON.stringify(body), // body data type must match “Content-Type” header
                                    },
                                );

                                let data = await response.json();
                                console.log('payment =====>', data);

                                if (data.statusCode === 200) {
                                    let orderDetail = {
                                        incomingId: info.username,
                                        order: {
                                            customerName:
                                                profile.customerInfo.customerName.firstName +
                                                ' ' +
                                                profile.customerInfo.customerName.lastName,
                                            restaurantId: restaurant.RestaurantId,
                                            restaurantName: restaurantName,
                                            menuId: '',
                                            menuItems: items,
                                            promoBought: [promoCode],
                                            referralCode: '',
                                            orderTotal: total,
                                            timeOrderPlaced: new Date(),
                                            status: 'Awaiting Confirmation',
                                            timeOrderCompleted: ''
                                        },
                                    };

                                    console.log('submit order =====>', orderDetail);

                                    let response = await fetch(
                                        'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/setuporders',
                                        {
                                            method: 'POST', // *GET, POST, PUT, DELETE, etc.
                                            mode: 'cors', // no-cors, *cors, same-origin
                                            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                                            credentials: 'same-origin', // include, *same-origin, omit
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Connection: 'keep-alive',
                                                // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
                                            },
                                            redirect: 'follow', // manual, *follow, error
                                            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                                            body: JSON.stringify(orderDetail),
                                        },
                                    );

                                    this.props.navigation.popToTop();

                                    this.props.navigation.navigate('Orders');
                                } else {
                                    Alert.alert('Payment has failed');
                                }
                                this.setState({isLoading: false});
                            });
                        },
                    },
                    { text: 'No' },
                ],
                { cancelable: false },
            );
        } catch (e) {
            this.setState({isLoading: false});
        }
    }

    getTotal() {
        const { menuItems } = this.state;
        let subtotal = 0;
        let delivery = 0;
        for (const item of menuItems) {
            subtotal += item.item_price * item.quantity;
        }
        let total = parseFloat((subtotal + delivery).toFixed(2));
        return total;
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Render //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    render() {
        const {isLoading, restaurant} = this.state;
        return (
            <View style={{flex: 1, backgroundColor: '#EFF3FC'}}>
                <SafeAreaInsetsContext.Consumer>
                    {insets => (
                        <View style={{flex: 1}}>
                            <View style={styles.container}>
                                {restaurant &&
                                <>
                                    {this._renderContent()}
                                    {this._renderFooter()}
                                </>
                                }
                            </View>
                        </View>
                    )}
                </SafeAreaInsetsContext.Consumer>
                <Toast ref={ref => (this.toast = ref)} />
                <Loading visible={isLoading} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        padding: 15
    },
    border: {
        marginHorizontal: 30,
        paddingBottom: 5,
        borderColor: '#E2E2E2',
        borderBottomWidth: 1,
        marginTop: 10
    },
    itemWrapper: {
      paddingVertical: 10
    },
    itemImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain'
    },
    itemTitleText: {
        fontSize: 18,
        color: '#222222',
        marginLeft: 10
    },
    contentImage: {
        width: 14,
        height: 14,
        resizeMode: 'contain'
    },
    contentText: {
        fontSize: 15,
        color: '#7D849A',
        marginLeft: 10
    },
    priceText: {
        color: '#E83939',
        fontSize: 18
    },
    footerWrapper: {
        backgroundColor: 'white',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
    }
});

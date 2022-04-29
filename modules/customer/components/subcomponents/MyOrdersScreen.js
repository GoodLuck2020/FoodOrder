import React, {Component} from 'react';
import {View, StyleSheet, FlatList, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import Toast from 'react-native-easy-toast';
import FastImage from 'react-native-fast-image';
import { SwipeListView } from 'react-native-swipe-list-view';
import {Auth} from "aws-amplify";

import Styles from "../../../theme/Styles";
import Images from "../../../theme/Images";
import RoundTextInput from "./RoundTextInput";
import RoundButton from "./RoundButton";
import {Button} from "react-native-elements";
import Modal from "react-native-modal";

const sWidth = Dimensions.get('window').width;

export default class MyOrdersScreen extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            restaurant: null,
            profile: null,
            menuItems: [],
            promoCode: '',
            promoCodeError: '',

            isShowSelectPaymentModal: false
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
            const {restaurant, profile} = this.props.route.params;
            const objectConstructor = ({}).constructor;
            const menu = restaurant && restaurant.Menu && restaurant.Menu.constructor != objectConstructor ? JSON.parse(restaurant.Menu) : null;
            let items = [];
            if (menu) {
                if (menu.items) {
                    items = menu.items;
                } else {
                    items = menu;
                }
            }
            for (let i = 0; i < items.length; i++) {
                items[i]['key'] = i;
                items[i]['quantity'] = 1;
                items[i]['item_price'] = items[i]['price'] ? items[i]['price'] : (items[i]['item_price'] ? items[i]['item_price'] : '0.0')
                items[i]['item_name'] = items[i]['itemName'] ? items[i]['itemName'] : (items[i]['item_name'] ? items[i]['item_name'] : '')
                items[i]['item_description'] = items[i]['description'] ? items[i]['description'] : (items[i]['item_description'] ? items[i]['item_description'] : '')
            }
            this.setState({restaurant, profile, menuItems: items});
        }
    }

    capitalize(str) {
       return str.charAt(0).toUpperCase() + str.slice(1);
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Restaurant //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    _renderRestaurant() {
        const { restaurant } = this.state;
        const image = restaurant && restaurant.Profile.picture ? {uri: restaurant.Profile.picture} : Images.icon_restaurant_placeholder;
        const name = restaurant ? restaurant.Profile.restaurantInfo.restaurantName : '';
        let type = '';
        const address = restaurant ? restaurant.Profile.restaurantInfo.restaurantAddress.address : '';
        const reviewRate = '5.0';
        if (restaurant && restaurant.Profile.restaurantInfo.restaurantType) {
            for (let i = 0; i < restaurant.Profile.restaurantInfo.restaurantType.typeTags.length; i++) {
                if (i == restaurant.Profile.restaurantInfo.restaurantType.typeTags.length - 1) {
                    type += this.capitalize(restaurant.Profile.restaurantInfo.restaurantType.typeTags[i]);
                } else {
                    type += this.capitalize(restaurant.Profile.restaurantInfo.restaurantType.typeTags[i]) + ', ';
                }
            }
        }
        return (
            <View style={styles.restaurantWrapper}>
                <FastImage style={styles.restaurantImage} source={image} />
                <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantNameText}>{name}</Text>
                    <Text style={[styles.restaurantTypeText, {marginVertical: 5}]}>{type}</Text>
                    <View style={Styles.rowCenter}>
                        <View style={Styles.rowCenter}>
                            <Image style={styles.detailImage} source={Images.icon_star} />
                            <Text style={styles.restaurantTypeText}>{reviewRate}</Text>
                        </View>
                        {address ?
                            (<View style={Styles.rowCenter}>
                                <Text style={styles.restaurantTypeText}> - </Text>
                                <Image style={styles.detailImage} source={Images.icon_location} />
                                <Text style={styles.restaurantTypeText}>{address}</Text>
                            </View>) : null
                        }
                    </View>
                </View>
            </View>
        )
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Menus //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    _renderMenus() {
        const { restaurant, menuItems } = this.state;

        return (
            <View style={{flex: 1, flexGrow: 1}}>
                <SwipeListView
                    style={styles.listContainer}
                    data={menuItems}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => item.key}
                    renderItem={({item, index}) => {
                        const menuImage = item.picture ? {uri: item.picture} : Images.icon_food_placeholder;
                        const menuTitle = item.item_name || '';
                        const price = item.item_price || '0.0';
                        const quantity = item.quantity + '';
                        return (
                            <View style={styles.menuWrapper}>
                                <Image style={styles.menuImage} source={menuImage} />
                                <View style={styles.menuInfo}>
                                    <Text style={styles.menuTitleText}>{menuTitle}</Text>
                                    <View style={styles.priceWrapper}>
                                        <Text style={styles.menuPriceText}>${price}</Text>
                                        <View style={styles.priceSelector}>
                                            <TouchableOpacity style={styles.priceBtn}
                                              onPress={() => this.onSubtractQuantity(item)}>
                                                <Text style={styles.priceBtnText}>-</Text>
                                            </TouchableOpacity>
                                            <View style={styles.priceBtn}>
                                                <Text style={[styles.priceBtnText, {fontSize: 16}]}>{quantity}</Text>
                                            </View>
                                            <TouchableOpacity style={styles.priceBtn}
                                                              onPress={() => this.onPlusQuantity(item)}>
                                                <Text style={styles.priceBtnText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )
                    }}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => {
                                    rowMap[data.item.key].closeRow();
                                    this.onEdit(data.item.key);
                                }}>
                                <Image
                                    source={Images.icon_edit_white}
                                    style={styles.trashIcon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.trashBtn}
                                onPress={() => {
                                    rowMap[data.item.key].closeRow();
                                    this.onTrash(data.item.key);
                                }}>
                                <Image
                                    source={Images.icon_trash_white}
                                    style={styles.trashIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    rightOpenValue={-120}
                />
            </View>
        )
    }

    onEdit(key) {

    }

    onTrash(key) {
        const { menuItems } = this.state;
        const index = menuItems.findIndex((item) => item.key == key);
        if (index >= 0) {
            menuItems.splice(index, 1);
        }
        this.setState({menuItems});
    }

    onPlusQuantity(item) {
        const { menuItems } = this.state;
        const index = menuItems.findIndex((menu) => menu.key == item.key);
        if (index >= 0) {
            menuItems[index].quantity++;
            this.setState({menuItems});
        }
    }

    onSubtractQuantity(item) {
        const { menuItems } = this.state;
        const index = menuItems.findIndex((menu) => menu.key == item.key);
        if (index >= 0) {
            if (menuItems[index].quantity > 1) {
                menuItems[index].quantity--;
                this.setState({menuItems});
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Total //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    _renderTotal() {
        const { restaurant, menuItems, promoCode, promoCodeError} = this.state;
        let subtotal = 0;
        let delivery = 0;
        let total = 0;
        for (const item of menuItems) {
            subtotal += item.item_price * item.quantity;
        }
        total = subtotal + delivery;
        return (
            <View style={styles.totalWrapper}>
                <View style={Styles.rowCenterBetween}>
                    <Text style={styles.promoText}>PromoCode</Text>
                    <RoundTextInput
                        style={{width: 200}}
                        type="text"
                        textAlign={'right'}
                        value={promoCode}
                        errorMessage={promoCodeError}
                        returnKeyType="next"
                        onChangeText={text => this.setState({promoCode: text, promoCodeError: ''})}
                    />
                </View>
                <View style={styles.subTotalWrapper}>
                    <View style={Styles.rowCenterBetween}>
                        <Text style={styles.totalTitleText}>Subtotal</Text>
                        <Text style={styles.totalTitleText}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={[Styles.rowCenterBetween, Styles.mt1]}>
                        <Text style={styles.deliveryTitleText}>Delivery</Text>
                        <Text style={styles.deliveryText}>Free</Text>
                    </View>
                </View>
                <View style={[Styles.rowCenterBetween, Styles.mt2]}>
                    <Text style={styles.totalTitleText}>Total</Text>
                    <Text style={styles.totalTitleText}>${total.toFixed(2)}</Text>
                </View>
            </View>
        )
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Footer //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    _renderFooter() {
        let delivery = 0;
        let total = this.getSubTotal() + delivery;
        return (
            <View style={styles.footerWrapper}>
                <RoundButton
                    theme={'main'}
                    enabled={total > 0 ? true : false}
                    title={'CHECKOUT'}
                    onPress={this.onCheckOut}
                />
            </View>
        )
    }

    onCheckOut = () => {
        const { menuItems, profile, restaurant, promoCode } = this.state;
        if (promoCode == null || promoCode.length == 0) {
            this.setState({promoCodeError: 'Please input a valid code'});
        } else {
            this.props.navigation.navigate('Checkout', {items: menuItems, promoCode: promoCode, restaurant, profile});
        }
    }

    getSubTotal() {
        const { menuItems } = this.state;
        let subtotal = 0;
        for (const item of menuItems) {
            subtotal += item.item_price * item.quantity;
        }
        return parseFloat(subtotal.toFixed(2));
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
                                        {this._renderRestaurant()}
                                        {this._renderMenus()}
                                        {this._renderTotal()}
                                        {this._renderFooter()}
                                    </>
                                }
                            </View>
                        </View>
                    )}
                </SafeAreaInsetsContext.Consumer>
                <Toast ref={ref => (this.toast = ref)} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    restaurantWrapper: {
        margin: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
        flexDirection: 'row',
        alignItems: 'center',
    },
    restaurantImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    restaurantInfo: {
        marginLeft: 15,
    },
    restaurantNameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    },
    restaurantTypeText: {
        fontSize: 14,
        color: '#7D849A',
    },
    detailImage: {
        width: 15,
        height: 15,
        marginRight: 5,
        resizeMode: 'contain'
    },
    listContainer: {
        flex: 1,
        marginHorizontal: 15
    },
    menuWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: 'white',
        marginBottom: 10,
        height: 80
    },
    menuImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
        borderRadius: 5
    },
    menuInfo: {
      marginLeft: 15
    },
    menuTitleText: {
      color: 'black',
      fontSize: 16
    },
    menuPriceText: {
        fontSize: 14,
        color: '#7D849A',
    },
    rowBack: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    priceWrapper: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: sWidth - 140
    },
    priceSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF3FC',
    },
    priceBtn: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    priceBtnText: {
        color: '#7D849A',
        fontSize: 20
    },
    editBtn: {
        backgroundColor: '#FF7F56',
        width: 60,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 0.5,
        borderColor: 'white'
    },
    trashBtn: {
        backgroundColor: '#FF7F56',
        width: 60,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5
    },
    trashIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    totalWrapper: {
        paddingTop: 10,
        marginHorizontal: 15,
        paddingBottom: 30
    },
    promoText: {
        color: 'black',
        fontSize: 16
    },
    subTotalWrapper: {
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
        marginTop: 20
    },
    totalTitleText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold'
    },
    deliveryTitleText: {
        color: '#7D849A'
    },
    deliveryText: {
        color: '#00824B',
        fontSize: 18
    },
    footerWrapper: {
        backgroundColor: 'white',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
    }
});

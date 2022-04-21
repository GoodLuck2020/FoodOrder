import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {ListItem, Text, Button, Icon} from 'react-native-elements';
import Loading from 'react-native-loading-spinner-overlay';
import {Auth} from 'aws-amplify';
import Stripe from 'tipsi-stripe';
import config from '../../config';
import {Alert} from 'react-native';
import Modal from 'react-native-modal';
import {RFValue} from 'react-native-responsive-fontsize';
import {TouchableOpacity} from 'react-native-gesture-handler';
import md5 from 'md5';

function CardContainer({card, defaultCard, onSelect}) {
  const cardArray = card.number.split(' ');
  const cardNumber = cardArray
    .map((item, index) => {
      let itemNumber = '';
      for (let indexNum = 0; indexNum < item.length; indexNum++) {
        itemNumber += 'X';
      }
      if (index < cardArray.length - 1) {
        return itemNumber;
      } else {
        return item;
      }
    })
    .join(' ');
  return (
    <View style={styles.cardcontainer}>
      <View style={{flex: 1}}>
        <Text>{card.name}</Text>
        <Text>{cardNumber}</Text>
      </View>
      <TouchableOpacity
        style={styles.check}
        onPress={() => onSelect(card.name)}>
        {defaultCard && (
          <Icon name="check" size={RFValue(20, 580)} color="#F86D64" />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function OrderReview({navigation, route}) {
  let customerOrder = route.params.order;
  let restaurantInfo = route.params.restaurant;
  let profile = route.params.profile;
  const promotion = route.params.promotion;
  const [loading, setLoading] = useState(false);
  const cards = profile.paymentOptions.cards;
  console.log(restaurantInfo);

  const getCode = (restaurant, profile, promotion) => {
    return md5(
      restaurant.RestaurantId +
        promotion.title +
        promotion.discount +
        profile.CustomerId,
    );
  };

  const [visible, setVisible] = useState(false);

  const card = cards.length === 1 ? cards[0] : undefined;

  const [selectedCard, setSelectedCard] = useState('');
  // Will eventually need to grab the restaurant name from order
  let orderSubtotal = 0.0;
  let orderTotal = 0.0;
  let discountPrice = 0;
  /*
    TODO: THE ORDER SUBTOTAL DOESN'T ACCOUNT FOR ADD-ONS
    TODO: ADD UP FEES AND GET ACTUAL TOTAL
  */
  const getOrderSubtotal = () => {
    discountPrice = 0;
    const validPromotion = promotion.filter(item => {
      if (
        new Date(item.expired) < new Date() ||
        new Date(item.from) > new Date()
      ) {
        return false;
      }

      return true;
    });

    console.log(profile.Promotion);

    customerOrder.items.map(orderItem => {
      // console.log(orderItem.itemName);
      orderSubtotal += parseFloat(orderItem.price * (orderItem.quantity ?? 1));
      orderTotal += parseFloat(orderItem.price * (orderItem.quantity ?? 1));
      specificPromotion = validPromotion.filter(
        item =>
          item.type === 'specific' &&
          orderItem.code === getCode(restaurantInfo, profile, item) &&
          profile.Promotion?.indexOf(orderItem.code) > -1,
      );
      specificPromotion.forEach(item => {
        if (item.itemToAdd === orderItem.itemName) {
          orderTotal -= Number(item.discount);
          discountPrice += Number(item.discount);
        }
      });

      validPromotion
        .filter(
          item =>
            item.type === 'order' &&
            orderItem.code === getCode(restaurantInfo, profile, item) &&
            profile.Promotion?.indexOf(orderItem.code) > -1,
        )
        .forEach(item => {
          orderTotal -= Number(item.discount);
          discountPrice += Number(item.discount);
        });
    });
  };

  /*
    GENERATES A STRING TO DISPLAY OPTIONS SELECTED
  */
  const getOptions = item => {
    let options = '';

    item.options.forEach(option => {
      option.optionList.forEach((addon, index) => {
        options +=
          ' - ' +
          addon.optionName +
          (index < option.optionList.length ? '\n' : '');
      });
    });

    if (item.specialInstructions) {
      options += 'Special Instructions: ' + item.specialInstructions;
    }

    return options;
  };

  const payment = async cardItem => {
    if (!cardItem) {
      return;
    }
    try {
      setLoading(true);
      Stripe.setOptions({publishableKey: config.pk_test});
      Auth.currentUserInfo().then(info => {
        Stripe.createTokenWithCard({
          number: cardItem.number,
          cvc: cardItem.cvc,
          expMonth: parseInt(cardItem.expiry.split('/')[0]),
          expYear: parseInt(cardItem.expiry.split('/')[1]),
          name: cardItem.name,
        }).then(async tokeninfo => {
          const body = {
            amount: orderTotal,
            token: tokeninfo.tokenId,
            description:
              info.username + ' has purchased ' + customerOrder.restaurantName,
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
          console.log('order detail =====>', info, restaurantInfo, customerOrder, profile);

          if (data.statusCode === 200) {
            let orderDetail = {
              incomingId: info.username,
              order: {
                customerName:
                    profile.customerInfo.customerName.firstName +
                    ' ' +
                    profile.customerInfo.customerName.lastName,
                restaurantId: restaurantInfo.RestaurantId,
                restaurantName: customerOrder.restaurantName,
                menuId: '',
                menuItems: customerOrder.items,
                promoBought: [''],
                referralCode: '',
                orderTotal,
                timeOrderPlaced: new Date(),
                status: 'Awaiting Confirmation',
                timeOrderCompleted: ''
              },
            };

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

            console.log('payment =====>', await response.json());

            navigation.navigate('MenuDisplay', {paymentSuccess: true});

            navigation.navigate('Orders');
          } else {
            Alert.alert('Payment has failed');
          }
          setLoading(false);
        });
      });
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.general}>
        {/* <Text style={styles.restaurantName}>Restaurant Name</Text> */}
        <Text style={styles.restaurantName}>
          {customerOrder.restaurantName}
        </Text>
        {getOrderSubtotal()}
        {/* <Text style={styles.itemSectionTitle}>Items</Text> */}
        {route.params.order.items.map(orderItem => {
          return (
            <View key={orderItem.itemName}>
              <ListItem
                title={orderItem.itemName}
                titleStyle={styles.orderItemTitle}
                rightTitle={
                  '$' + orderItem.price + ' * ' + (orderItem.quantity ?? 1)
                }
                subtitle={orderItem.specialInstructions}
                //subtitle={getOptions(orderItem) || false}
                subtitleStyle={styles.orderItemDescription}
                containerStyle={styles.orderItemContainer}
                // onPress={() => console.log('Pressed')}
                bottomDivider
              />
            </View>
          );
        })}
        <Text style={styles.itemOrderTotalTitle}>Order Total</Text>
        <View style={styles.orderTotalContainer}>
          <ListItem title="Subtotal:" rightTitle={'$' + orderSubtotal} />
          {/* TODO: GET FEES AND SALES TAX FROM DATA */}
          <ListItem
            title="Delivery Fees:"
            rightTitle={'$' + (0.0).toFixed(2)}
          />
          <ListItem title="Service Fees:" rightTitle={'$' + (0.0).toFixed(2)} />
          <ListItem title="Sales Tax:" rightTitle={'$' + (0.0).toFixed(2)} />
          <ListItem title="Total: " rightTitle={'$' + orderTotal.toFixed(2)} />
        </View>
      </ScrollView>
      {/* <Button title={'Proceed To Checkout $' + orderSubtotal} /> */}
      {/* TODO: CREATE AND NAVIGATE TO PAYMENT SCREEN */}
      <Button
        title={'Pay $' + orderTotal}
        buttonStyle={styles.buttonStyle}
        onPress={() => (card ? payment(card) : setVisible(true))}
      />
      <Loading visible={loading} />
      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        style={{justifyContent: 'flex-end'}}>
        <View style={styles.modalInside}>
          {cards.map(item => (
            <CardContainer
              key={item.name}
              card={item}
              defaultCard={item.name === selectedCard}
              onSelect={name => setSelectedCard(name)}
            />
          ))}

          <Button
            buttonStyle={styles.buttonStyle}
            title="Pay Now"
            onPress={() => {
              payment(cards.find(item => item.name === selectedCard));
              setVisible(false);
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantName: {
    marginTop: 80,
    textAlign: 'center',
    fontSize: 20,
  },
  itemSectionTitle: {
    fontSize: 22,
    padding: 15,
    fontWeight: 'bold',
  },
  itemOrderTotalTitle: {
    fontSize: 22,
    padding: 15,
    fontWeight: 'bold',
  },
  orderItemContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  orderItemTitle: {},
  orderItemDescription: {
    fontSize: 12,
    color: '#111',
  },
  orderSubtotal: {
    fontSize: 25,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
  },
  modalInside: {
    backgroundColor: 'white',
    padding: 5,
    paddingTop: 15,
    paddingBottom: 15,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  cardcontainer: {
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#979797',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
  },
  check: {
    width: RFValue(30, 580),
    height: RFValue(30, 580),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(15, 580),
    borderWidth: 1,
    borderColor: '#F86D64',
  },
});

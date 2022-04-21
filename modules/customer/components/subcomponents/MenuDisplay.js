import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {ListItem, Text, Button} from 'react-native-elements';

// var currentOrder = {
//   orderId: '',
//   restaurantName: '',
//   status: 'Awaiting Confirmation',
//   orderTotal: '',
//   items: [],
//   dropoffName: '',
//   dropoffAddress: '',
//   dropoffPhoneNumber: '',
//   dropoffInstructions: '',
//   dateOrderPlaced: '',
//   timeOrderPlaced: '',
//   timeOrderOutForDelivery: '',
//   timeOrderDelivered: '',
//   requiresId: false,
// }; //TODO: populate with things from jasons profile function

export default function MenuDisplay({navigation, route}) {
  const [currentOrder, setCurrentOrder] = React.useState({
    orderId: '',
    restaurantName: '',
    status: 'Awaiting Confirmation',
    orderTotal: '',
    items: [],
    dropoffName: '',
    dropoffAddress: '',
    dropoffPhoneNumber: '',
    dropoffInstructions: '',
    dateOrderPlaced: '',
    timeOrderPlaced: '',
    timeOrderOutForDelivery: '',
    timeOrderDelivered: '',
    requiresId: false,
  }); //TODO: populate with things from jasons profile function

  React.useEffect(() =>
    navigation.addListener('focus', () => {
      console.log(route.params.paymentSuccess);
      // USED TO CLEAR CART IF SWITCHING RESTAURANTS
      if (
        currentOrder.restaurantName !==
          route.params.restaurant.Profile.restaurantInfo.restaurantName ||
        route.params.paymentSuccess
      ) {
        setCurrentOrder({
          ...currentOrder,
          items: [],
          restaurantName:
            route.params.restaurant.Profile.restaurantInfo.restaurantName,
        });
        navigation.setParams({paymentSuccess: false});
      }
      // ADDS ITEM TO ORDER
      if (route.params.addToCart) {
        // currentOrder.items.push(route.params.itemToAdd);
        setCurrentOrder({
          ...currentOrder,
          items: [...currentOrder.items, route.params.itemToAdd],
        });
        // console.log('Current Order:' + '\n' + currentOrder.items);
        navigation.setParams({
          addToCart: false,
          itemToAdd: null,
        });
      }
    }),
  );

  const menu =
    typeof route.params.restaurant.Menu === 'string'
      ? JSON.parse(route.params.restaurant.Menu)
      : route.params.restaurant.Menu;
  return (
    <>
      <ScrollView>
        {menu.items?.map(item => {
          return (
            <View key={'_menu_item_' + item.itemName + item.itemPrice}>
              {menuListItemDisplay(item, navigation, route)}
            </View>
          );
        })}
      </ScrollView>
      {currentOrder.items.length > 0 ? (
        <Button
          // title="View Order"
          title={`Proceed to Checkout (${currentOrder.items.length})`}
          onPress={() =>
            // navigation.navigate('Home', {
            //   screen: 'Order Review',
            //   params: {order: currentOrder},
            // })
            navigation.navigate('Order Review', {
              order: currentOrder,
              restaurant: route.params.restaurant.Profile,
              promotion: route.params.restaurant.Promotion
                ? JSON.parse(route.params.restaurant.Promotion)
                : [],
            })
          }
          buttonStyle={styles.buttonStyle}
        />
      ) : null}
    </>
  );
}

/*
  TODO: FIX ROUTE PARAMS TO BE CONSISTENT
*/
const menuListItemDisplay = (item, navigation, route) => {
  if (item.picture === '') {
    return (
      <ListItem
        title={item.itemName}
        subtitle={item.itemDescription}
        bottomDivider
        chevron
        onPress={() => {
          navigation.navigate('AddItemToCart', {
            item: item,
            addToCart: false,
            itemToAdd: null,
            restaurant: route.params.restaurant,
          });
        }}
      />
    );
  }
  return (
    <ListItem
      title={item.itemName}
      subtitle={item.itemDescription}
      leftAvatar={{source: {uri: item.picture}}}
      bottomDivider
      chevron
      onPress={() => navigateToAddItemToCart(item, navigation, route)}
    />
  );
};

const navigateToAddItemToCart = (item, navigation, route) => {
  var orderItem = {
    itemName: item.itemName,
    itemDescription: item.itemDescription,
    itemQuantity: 1,
    options: [],
    specialInstructions: '',
  };
  navigation.navigate('AddItemToCart', {
    item,
    menuItem: item,
    orderItem: orderItem,
    addToCart: false,
    restaurant: route.params.restaurant,
  });
};

const styles = StyleSheet.create({
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 5,
  },
  categoryEditorButton: {
    color: '#03a5fc',
  },
  menuListView: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  addCategoryIcon: {
    position: 'absolute',
    right: 0,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
  },
});

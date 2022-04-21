import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {StackActions} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ListItem, Button} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';
import OrderDetails from './subcomponents/OrderDetails/OrderDetails';
import testOrders from './subcomponents/testOrders';
import Modal from 'react-native-modal';
import {Auth} from 'aws-amplify';
import {TabRouter} from 'react-navigation';

//JSON Object
var ordersList = testOrders();

const Stack = createStackNavigator();

let getorderlist = null;

export default class Orders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ordersList: props.route.params.data,
      numberOfOrders: 0,
    };

    ordersList = props.route.params.data;
    //bind functions
    this.countOrders = this.countOrders.bind(this);
  }

  countOrders = () => {
    var count = 0;
    ordersList.Orders.map(order => {
      if (order.status !== 'Completed') {
        count++;
      }
    });
    this.state.numberOfOrders = count;
  };

  render() {
    this.countOrders();
    return (
      <Stack.Navigator intialRouteName="Orders">
        <Stack.Screen
          name="Orders"
          component={OrdersList}
          // style={styles.general}
          initialParams={{
            ordersList: this.state.ordersList,
            numberOfOrders: this.state.numberOfOrders,
          }}
          options={({navigation}) => ({
            title: 'Orders',
            headerStyle: {
              backgroundColor: '#fff',
            },
          })}
        />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetails}
          options={({route}) => ({
            title: 'Order Details',
          })}
        />
      </Stack.Navigator>
    );
  }
}

function OrdersList({navigation, route}) {
  const [orderupdate, setorderupdate] = useState(false);

  const [checked, setChecked] = useState([]);

  useEffect(() => {
    let body = JSON.stringify({
      incoming_Id: 'd4f09d26-ee0b-4591-921e-f2f1c6c51604',
    });
    fetch(
      'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/restaurants/getorders',
      {
        method: 'POST',
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
        body: body,
      },
    )
      .then(async res => {
        let response = await res.json();
        console.log('responseexe', response);
      })
      .catch(err => console.log('responsedataerror', err));
  }, []);

  useEffect(() => {
    const fetchOrder = () => {
      Auth.currentUserInfo().then(userinfo => {
        let body = JSON.stringify({
          incoming_Id: userinfo.username,
        });
        fetch(
          'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/restaurants/getorders',
          {
            method: 'POST',
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
            body: body,
          },
        )
          .then(async res => {
            let response = await res.json();
            console.log('response', JSON.parse(response).orders);
            navigation.setParams({
              ...route.params,
              ordersList: {Orders: JSON.parse(response).orders.Orders},
            });
          })
          .catch(err => console.log('responsedataerror', err));
      });
    };

    navigation.addListener('focus', fetchOrder);

    return () => {
      navigation.removeListener('focus', fetchOrder);
    };
  }, [navigation, route.params]);

  const awaitingOrders = route.params.ordersList.Orders.filter(
    item =>
      item.status === 'Awaiting Confirmation' &&
      checked.indexOf(item.order_id) === -1,
  );

  const getSubtotal = () => {
    let amount = 0;
    awaitingOrders[0].items.forEach(item => {
      amount += item.price * (item.quantity ? item.quantity : 1);
    });

    return amount;
  };

  const accept = () => {
    updateStatus('Being Prepared');
    navigation.setParams({
      ...route.params,
      ordersList: {
        Orders: route.params.ordersList.Orders.map(item =>
          item.order_id === awaitingOrders[0].order_id
            ? {...awaitingOrders[0], status: 'Being Prepared'}
            : item,
        ),
      },
    });
    setChecked([...checked, awaitingOrders[0].order_id]);
  };

  const reject = () => {
    updateStatus('Rejected');
    navigation.setParams({
      ...route.params,
      ordersList: {
        Orders: route.params.ordersList.Orders.map(item =>
          item.order_id === awaitingOrders[0].order_id
            ? {...awaitingOrders[0], status: 'Rejected'}
            : item,
        ),
      },
    });
    setChecked([...checked, awaitingOrders[0].order_id]);
  };

  const updateStatus = async status => {
    let body = {
      incoming_id: awaitingOrders[0].order_id,
      status,
    };
    const response = await fetch(
      'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/orders/updateOrder',
      {
        method: 'POST',
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
        body: JSON.stringify(body),
      },
    );

    console.log(await response.json());
  };

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{flex: 1}}>
        <Text h2 style={styles.orderHeadings}>
          {'Active Orders (' +
            route.params.ordersList.Orders.filter(
              item => item.status !== 'Completed',
            ).length +
            ')'}
        </Text>
        <View style={{flex: 1, minHeight: 200}}>
          {route.params.ordersList.Orders.map(order => {
            if (order.status !== 'Completed') {
              return (
                <TouchableOpacity
                  style={styles.order}
                  //TO DO: Bind this as a function
                  onPress={() => {
                    let newOrder = JSON.parse(JSON.stringify(order));
                    console.log('Old status: ' + order.status);
                    navigation.navigate('OrderDetails', {
                      navigation: navigation,
                      ordersList: ordersList,
                      newOrder: newOrder,
                      order: order,
                    });
                  }}>
                  <View key={'order_display_' + order.dropoffName}>
                    <Text h4 style={styles.dropoffName}>
                      {order.dropoffName}
                    </Text>
                    <Text h5 style={styles.orderDate}>
                      {order.dateOrderPlaced}
                    </Text>
                    <Text h5 style={styles.orderItemCount}>
                      {order.items.length + ' items'}
                    </Text>
                    <Text h2 style={styles.orderPrice}>
                      {'$' + order.orderTotal}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
          })}
        </View>
        <Text h2 style={styles.orderHeadings}>
          {'Order History'}
        </Text>
        <View style={{flex: 1, minHeight: 200}}>
          {route.params.ordersList.Orders.map(order => {
            if (order.status === 'Completed') {
              return (
                <TouchableOpacity
                  style={styles.order}
                  onPress={() => {
                    navigation.navigate('OrderDetails', {
                      ordersList: ordersList,
                      order: order,
                    });
                  }}>
                  <View key={'completed_order_display_' + order.dropoffName}>
                    <Text h4 style={styles.dropoffName}>
                      {order.dropoffName}
                    </Text>
                    <Text h5 style={styles.orderDate}>
                      {order.dateOrderPlaced}
                    </Text>
                    <Text h5 style={styles.orderItemCount}>
                      {order.items.length + ' items'}
                    </Text>
                    <Text h2 style={styles.orderPrice}>
                      {'$' + order.orderTotal}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
          })}
        </View>
      </View>
      {awaitingOrders.length > 0 && (
        <Modal isVisible={awaitingOrders.length > 0}>
          <View style={styles.modalInside}>
            <Text style={styles.restaurantName}>
              {awaitingOrders[0].customerName}
            </Text>
            {awaitingOrders[0].items.map(orderItem => {
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
            <View style={styles.orderTotalContainer}>
              <ListItem
                title="Subtotal:"
                rightTitle={'$' + getSubtotal().toFixed(2)}
              />
              <ListItem
                title="Service Fees:"
                rightTitle={'$' + (0.0).toFixed(2)}
              />
              <ListItem
                title="Sales Tax:"
                rightTitle={'$' + (0.0).toFixed(2)}
              />
              <ListItem
                title="Total: "
                rightTitle={'$' + awaitingOrders[0].orderTotal}
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 15,
                justifyContent: 'space-between',
              }}>
              <Button
                buttonStyle={[styles.buttonStyle, {backgroundColor: '#60BA46'}]}
                title="Accept"
                onPress={accept}
              />
              <Button
                buttonStyle={styles.buttonStyle}
                title="Decline"
                onPress={reject}
              />
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const statusArray = [
  'Awaiting Confirmation',
  'Being Prepared',
  'Ready for Delivery',
  'Out for Delivery',
];

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  order: {
    borderBottomWidth: 2,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  orderHeadings: {
    // textAlign: 'left',
    // color: '#313131',
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 24,
    backgroundColor: '#fff',
  },
  dropoffName: {
    textAlign: 'left',
    color: '#313131',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    marginTop: 10,
  },
  orderDate: {
    marginLeft: 10,
    fontSize: 16,
  },
  orderItemCount: {
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 15,
  },
  orderPrice: {
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#313131',
    marginRight: 10,
    // marginTop: 2,
    marginBottom: 15,
  },
  modalInside: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
  },
  restaurantName: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 20,
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
    paddingTop: 5,
    paddingBottom: 5,
  },
});

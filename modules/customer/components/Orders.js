import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {StackActions} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Loading from 'react-native-loading-spinner-overlay';
import {ScrollView} from 'react-native-gesture-handler';
import OrderDetails from './subcomponents/OrderDetails/OrderDetails';
import {Auth} from 'aws-amplify';

//JSON Object

const Stack = createStackNavigator();

export default class Orders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Stack.Navigator intialRouteName="Orders">
        <Stack.Screen
          name="Orders"
          component={OrdersList}
          // style={styles.general}
          initialParams={{}}
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
          options={({navigation}) => ({
            title: 'Order Details',
          })}
        />
      </Stack.Navigator>
    );
  }
}

function OrdersList({navigation, route}) {
  const [orders, setOrders] = useState([]);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    navigation.addListener('focus', () => {
      setloading(true);
      Auth.currentUserInfo().then(info => {
        let body = {
          incoming_id: info.username,
        };

        fetch(
          'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/customerorders',
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
        )
          .then(async res => {
            let response = await res.json();
            setloading(false);
            console.log('responseexe', response);
            setOrders(response);
          })
          .catch(err => {
            console.log('responsedataerror', err);
            setloading(false);
          });
      });
    });
  }, [navigation]);
  return (
    <ScrollView style={{flex: 1}}>
      <View style={{flex: 1}}>
        <Text h2 style={styles.orderHeadings}>
          {'Active Orders (' + orders.length + ')'}
        </Text>
        <View style={{flex: 1, minHeight: 200}}>
          {orders.map(order => {
            console.log(order);
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
                      ordersList: orders,
                      newOrder: newOrder,
                      order: order,
                    });
                  }}>
                  <View key={'order_display_' + order.dropoffName}>
                    <Text h5 style={styles.orderDate}>
                      {order.dateOrderPlaced}
                    </Text>
                    <Text h4 style={styles.dropoffName}>
                      {order.dropOfName}
                    </Text>
                    <Text h4 style={styles.dropoffName}>
                      {order.status}
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
          {orders.map(order => {
            if (order.status === 'Completed') {
              return (
                <TouchableOpacity
                  style={styles.order}
                  onPress={() => {
                    navigation.navigate('OrderDetails', {
                      ordersList: orders,
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
      <Loading visible={loading} />
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
    marginTop: 10,
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
});

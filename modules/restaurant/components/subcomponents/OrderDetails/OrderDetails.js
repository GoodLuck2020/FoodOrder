import React from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Input,
  Button,
  ButtonGroup,
  Icon,
  Text,
  ListItem,
} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import {Auth} from 'aws-amplify';

export default class OrderDetails extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.ordersList = props.route.params.ordersList;
    this.order = props.route.params.order;
    this.state = {
      selectedIndex: 0,
    };
    const {selectedIndex} = this.state;
  }

  alertStatusChange = selectedIndex => {
    this.setState({selectedIndex});
    var newStatus = buttons[selectedIndex].value;
    Alert.alert(
      'Order Status Change',
      'Do you want to update this order status to ' + newStatus + '?',
      [
        {
          text: 'Confirm Update',
          onPress: async () => {
            console.log('Confirm button pressed');
            this.order.status = buttons[selectedIndex].value;
            var newStatusIndex = buttons
              .map(item => item.value)
              .indexOf(this.order.status);
            this.setState({selectedIndex: newStatusIndex});

            console.log(this.order.order_id);
            let body = {
              incoming_id: this.order.order_id,
              status: buttons[selectedIndex].value,
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
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  checkForItemDescription(item) {
    if (item.itemDescription !== '') {
      return (
        <Text style={styles.orderDetailsItemDescription}>
          {item.itemDescription}
        </Text>
      );
    }
  }

  checkForSpecialInstructions(item) {
    if (item.specialInstructions !== '') {
      return (
        <Text style={styles.orderDetailsSpecialInstructions}>
          {'Special Instructions: ' + item.specialInstructions}
        </Text>
      );
    }
  }

  render() {
    return (
      <View style={styles.general}>
        <View style={styles.orderDetailsHeader}>
          <Text h4 style={styles.dropoffName}>
            {this.order.dropoffName}
          </Text>
          <Text h4 style={styles.orderDetailsPrice}>
            {'$' + this.order.orderTotal}
          </Text>
        </View>
        {this.props.route.params.order.status !== 'Completed' && (
          <>
            <Text style={styles.orderStatus}>{'Order Status:'}</Text>
            <ButtonGroup
              onPress={this.alertStatusChange}
              selectedIndex={buttons
                .map(item => item.value)
                .indexOf(this.order.status)}
              buttons={buttons.map(item => item.title)}
              innerBorderStyle={{width: 1.5}}
              buttonStyle={styles.orderStatusButtons}
              containerStyle={{height: 200}}
              selectedButtonStyle={{backgroundColor: '#03a5fc'}}
              vertical={true}
            />
          </>
        )}

        <Text h5 style={styles.orderItemCount}>
          {this.order.items.length + ' items'}
        </Text>
        {this.order.items.map((item, i) => {
          return (
            <View
              style={styles.orderDetailsItem}
              key={this.order.orderId + '_' + item.itemName + '_' + i}>
              <Text style={styles.orderDetailsItemName}>{item.itemName}</Text>
              {this.checkForItemDescription(item)}
              {this.checkForSpecialInstructions(item)}
            </View>
          );
        })}
      </View>
    );
  }
}

const buttons = [
  {title: 'Awaiting Confirmation', value: 'Awaiting Confirmation'},
  {title: 'Being Prepared', value: 'Being Prepared'},
  {title: 'Ready For Pick Up', value: 'OUT for Delivery'},
  {title: 'Complete Order', value: 'Completed'},
];

const styles = StyleSheet.create({
  general: {
    flex: 1,
    backgroundColor: '#fff',
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  orderHeadings: {
    textAlign: 'left',
    color: '#313131',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 24,
    backgroundColor: '#fff',
  },
  dropoffName: {
    textAlign: 'left',
    color: '#313131',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    marginTop: 20,
    flex: 2,
  },
  orderStatusButtons: {
    height: 50,
  },
  orderStatus: {
    color: '#242424',
    fontSize: 22,
    marginLeft: 10,
    textAlign: 'left',
  },
  orderDate: {
    marginLeft: 10,
    fontSize: 16,
  },
  orderItemCount: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: 17,
    color: '#838383',
  },
  orderDetailsItem: {
    borderBottomWidth: 2,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  orderDetailsItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#313131',
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 10,
  },
  orderDetailsPrice: {
    textAlign: 'right',
    flex: 1,
    marginRight: 10,
    marginTop: 20,
  },
  orderDetailsItemDescription: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    fontSize: 18,
    color: '#363636',
  },
  orderDetailsSpecialInstructions: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
    fontSize: 16,
    color: '#363636',
  },
});

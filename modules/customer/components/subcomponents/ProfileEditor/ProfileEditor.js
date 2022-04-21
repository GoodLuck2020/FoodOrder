import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, ListItem, Icon, Button} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import {EditTextAttribute} from './AttributeEditor';
import {EditAddress} from './EditAddress';
//function to hit api for update profile lambda
import {updateDynamoCustomer} from './updateDynamoCustomer';
var toEdit;

export default class ProfileEditor extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.profile = props.route.params.profile;
    let newItem = props.route.params.profile;
    toEdit = props.route.params.toEditor;
    this.state = {
      isNew: props.route.params.new,
      item: newItem,
    };
  }

  updateProfileItem = changedItem => {
    this.setState({
      item: changedItem,
    });
  };

  render() {
    return (
      <>
        {
          <ExistingProfileView
            item={this.state.item}
            navigation={this.navigation}
            updateProfileItem={this.updateProfileItem}
          />
        }
      </>
    );
  }
}

const ExistingProfileView = props => {
  let EditorStack = createStackNavigator();
  return (
    <EditorStack.Navigator
      mode="modal"
      headerMode="none"
      initialRouteName="Attributes">
      <EditorStack.Screen
        name="Attributes"
        component={Attributes}
        initialParams={{
          item: props.item,
          menu: props.menu,
        }}
        options={{headerShown: false}}
      />
      <EditorStack.Screen
        name="Editor"
        component={EditItem}
        initialParams={{
          item: props.item,
          menu: props.menu,
        }}
      />
    </EditorStack.Navigator>
  );
};

let EditItem = ({navigation, route}) => {
  //route.params.toChange
  if (
    route.params.toChange === 'defaultAddress' ||
    route.params.toChange === 'defaultCard'
  ) {
    return (
      <EditAddress
        navigation={navigation}
        item={route.params.item}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
      />
    );
  } else {
    return (
      <EditTextAttribute
        navigation={navigation}
        item={route.params.item}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
      />
    );
  }
};

function Attributes({navigation, route}) {
  if (toEdit === 'addressNavigation') {
    return (
      <ScrollView>
        <Text h4 style={editorStyles.titles}>
          Default Address
        </Text>
        <ListItem
          title={route.params.item.customerInfo.customerAddress.default.address}
          subtitle={
            route.params.item.customerInfo.customerAddress.default.city.toString() +
            ', ' +
            route.params.item.customerInfo.customerAddress.default.state.toString() +
            ' ' +
            route.params.item.customerInfo.customerAddress.default.zip.toString()
          }
          bottomDivider
          chevron
          onPress={() =>
            navigation.navigate('Editor', {
              toChange: 'defaultAddress',
              item: route.params.item,
            })
          }
        />
        <View style={editorStyles.addressBlock}>
          <Button
            icon={<Icon name="add" size={20} color="#03a5fc" />}
            title=" Saved Addresses"
            style={editorStyles.categoryEditorButton}
            type="clear"
            onPress={() => {
              navigation.navigate('Editor', {
                toChange: 'savedAddresses',
                item: route.params.item,
                attribute: 'Save New Address',
              });
            }}
          />
        </View>
        {route.params.item.customerInfo.customerAddress.savedAddresses.map(
          (savedAdd, index) => {
            return (
              <View key={savedAdd.address + index}>
                <ListItem
                  title={savedAdd.address.toString()}
                  subtitle={
                    savedAdd.city.toString() +
                    ', ' +
                    savedAdd.state.toString() +
                    ' ' +
                    savedAdd.zip.toString()
                  }
                  value={savedAdd.address}
                  bottomDivider
                  rightIcon={{
                    name: 'delete',
                    onPress: () => {
                      route.params.item.customerInfo.customerAddress.savedAddresses = route.params.item.customerInfo.customerAddress.savedAddresses.filter(
                        e => e !== savedAdd,
                      );
                      navigation.setParams({
                        item: route.params.item,
                      });
                      updateDynamoCustomer(route.params.item);
                    },
                  }}
                  onPress={() => {
                    //Will be editor for listitem clicked
                    // navigation.navigate('Editor', {
                    //   toChange: 'savedAddresses',
                    //   item: route.params.item,
                    // });
                    console.log(this.value);
                  }}
                />
              </View>
            );
          },
        )}
      </ScrollView>
    );
  } else if (toEdit === 'paymentNav') {
    return (
      <ScrollView>
        <Text h4 style={editorStyles.titles}>
          Default Payment
        </Text>
        <ListItem
          title={route.params.item.paymentOptions.default.cardNumber.toString()}
          subtitle={
            'Expires: ' +
            route.params.item.paymentOptions.default.expirationMonth.toString() +
            '/' +
            route.params.item.paymentOptions.default.expirationYear.toString()
          }
          bottomDivider
          chevron
          onPress={() =>
            navigation.navigate('Editor', {
              toChange: 'defaultCard',
              item: route.params.item,
            })
          }
        />
        <View style={editorStyles.addressBlock}>
          <Button
            icon={<Icon name="add" size={20} color="#03a5fc" />}
            title=" Saved Cards"
            style={editorStyles.categoryEditorButton}
            type="clear"
            onPress={() => {
              navigation.navigate('Editor', {
                toChange: 'savedCards',
                item: route.params.item,
                attribute: 'Save New Card',
              });
            }}
          />
        </View>
        {route.params.item.paymentOptions.cards.map((savedCard, index) => {
          return (
            <View key={savedCard.cardNumber + index}>
              <ListItem
                title={savedCard.cardNumber.toString()}
                subtitle={
                  'Expires: ' +
                  savedCard.expirationMonth.toString() +
                  '/' +
                  savedCard.expirationYear.toString()
                }
                bottomDivider
                rightIcon={{
                  name: 'delete',
                  onPress: () => {
                    route.params.item.paymentOptions.cards = route.params.item.paymentOptions.cards.filter(
                      e => e !== savedCard,
                    );
                    //navigation.goBack();
                    navigation.setParams({
                      item: route.params.item,
                    });
                    updateDynamoCustomer(route.params.item);
                  },
                }}
                onPress={() => {
                  //Will be editor for listitem clicked
                  // navigation.navigate('Editor', {
                  //   toChange: 'existingCard',
                  //   item: route.params.item,
                  //   attribute: 'Save New Card',
                  // });
                }}
              />
            </View>
          );
        })}
      </ScrollView>
    );
  } else if (toEdit === 'customerDetailsNav') {
    return (
      <ScrollView>
        <Text h4 style={editorStyles.titles}>
          Customer Details
        </Text>
      </ScrollView>
    );
  }
}

const editorStyles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
  addAddress: {
    alignSelf: 'flex-end',
  },
  addressBlock: {
    justifyContent: 'center',
  },
  categoryEditorButton: {
    color: '#03a5fc',
    textAlign: 'center',
    padding: 10,
  },
});

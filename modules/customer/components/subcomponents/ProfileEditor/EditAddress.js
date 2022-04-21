import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Button, Text, Icon} from 'react-native-elements';
// import {Picker} from '@react-native-community/picker';
import {updateDynamoCustomer} from './updateDynamoCustomer';
var dataType;
var currentDisplay;
var tempProfile;
var profileNav;
var editType;

export class EditAddress extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    profileNav = props.navigation;
    tempProfile = props.item;
    //console.group(tempProfile);
    if (props.toChange === 'defaultAddress') {
      dataType = tempProfile.customerInfo.customerAddress.savedAddresses;
      editType = 'changingAddress';
      this.state = {
        currentDisplay:
          tempProfile.customerInfo.customerAddress.default.address,
        item: props.item,
      };
    } else {
      dataType = tempProfile.paymentOptions.cards;
      editType = 'changingCard';
      this.state = {
        currentDisplay: tempProfile.paymentOptions.default.cardNumber,
        item: props.item,
      };
    }
  }
  render() {
    if (editType === 'changingAddress') {
      return (
        <ScrollView>
          <View>
            <Text h4 style={styles.orderStatus}>
              {'Default Address'}
            </Text>
            {/* <Picker
              selectedValue={this.state.currentDisplay}
              style={styles.statusPicker}
              onValueChange={itemValue => {
                currentDisplay = itemValue;
                //change dropdown
                this.setState({
                  currentDisplay: currentDisplay,
                });
              }}>
              {dataType.map((savedAddresses, index) => {
                return (
                  <Picker.Item
                    label={savedAddresses.address}
                    value={savedAddresses.address}
                    key={savedAddresses.address + index}
                  />
                );
              })}
            </Picker> */}
            <Button
              title=" Set Default Address"
              icon={<Icon name="check" size={15} color="white" />}
              onPress={() => {
                tempProfile.customerInfo.customerAddress.default.address = currentDisplay;
                //also make sure we change the zip/city/state based off of address they chose
                tempProfile.customerInfo.customerAddress.savedAddresses.map(
                  (savedAdd, index) => {
                    if (currentDisplay === savedAdd.address) {
                      tempProfile.customerInfo.customerAddress.default.zip =
                        savedAdd.zip;
                      tempProfile.customerInfo.customerAddress.default.city =
                        savedAdd.city;
                      tempProfile.customerInfo.customerAddress.default.state =
                        savedAdd.state;
                      tempProfile.customerInfo.customerAddress.default.address =
                        savedAdd.address;
                    }
                  },
                );
                updateDynamoCustomer(tempProfile);
                profileNav.navigate('User Profile', {
                  profile: tempProfile,
                });
              }}
            />
          </View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView>
          <View>
            <Text h4 style={styles.orderStatus}>
              {'Default Card'}
            </Text>
            <Picker
              selectedValue={this.state.currentDisplay}
              style={styles.statusPicker}
              onValueChange={itemValue => {
                currentDisplay = itemValue;
                //change dropdown
                this.setState({
                  currentDisplay: currentDisplay,
                });
              }}>
              {dataType.map((savedCards, index) => {
                return (
                  <Picker.Item
                    label={savedCards.cardNumber}
                    value={savedCards.cardNumber}
                    key={savedCards.cardNumber + index}
                  />
                );
              })}
            </Picker>
            <Button
              title=" Set Default Card"
              icon={<Icon name="check" size={15} color="white" />}
              onPress={() => {
                tempProfile.paymentOptions.default.cardNumber = currentDisplay;
                updateDynamoCustomer(tempProfile);
                profileNav.navigate('User Profile', {
                  profile: tempProfile,
                });
              }}
            />
          </View>
        </ScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
  },
  saveButton: {
    textAlign: 'center',
    padding: 10,
    paddingTop: 20,
  },
  deleteButton: {
    textAlign: 'center',
    padding: 10,
    paddingTop: 10,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
  hours: {
    textAlign: 'center',
    padding: 10,
  },
  statusPicker: {
    borderTopWidth: 3,
    borderTopColor: '#03a5fc',
  },
  orderStatus: {
    textAlign: 'center',
    justifyContent: 'center',
    color: '#313131',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    marginTop: 20,
    marginBottom: 10,
  },
});

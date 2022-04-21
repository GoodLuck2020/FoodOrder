/* eslint-disable react-native/no-inline-styles */
import {View, StyleSheet, Alert} from 'react-native';
import {Input, Button, Icon, Text} from 'react-native-elements';
import React, {useState} from 'react';
// import {Picker} from '@react-native-community/picker';
import {Dimensions} from 'react-native';
//function to hit api for update profile lambda
import {updateDynamoCustomer} from './updateDynamoCustomer';

export function EditTextAttribute(props) {
  var updatedValue = '';
  var dataType;
  //Dimension variables
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  //Hook variables for address
  const [addressAddress, setAddress] = useState('');
  const [addressState, setState] = useState('');
  const [addressZip, setZip] = useState('');
  const [addressCity, setCity] = useState('');
  //Hook variables for card
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardTyping, setCardTyping] = useState('');
  const [cardNumbers, setCardNumbers] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  if (props.toChange === 'emailAddress') {
    dataType = props.item.customerInfo.contactInformation;

    return (
      <View style={styles.general}>
        <Input
          label={props.attribute}
          placeholder={`${dataType[props.toChange]}`}
          onChangeText={value => {
            updatedValue = value;
          }}
        />
        <Button
          icon={<Icon name="check" size={20} color="white" />}
          title=" Save Changes"
          buttonStyle={styles.defaultButton}
          onPress={() => {
            if (updatedValue.trim() === '') {
              Alert.alert('Please enter an email address');
            } else if (dataType[props.toChange] !== updatedValue) {
              dataType[props.toChange] = updatedValue;
              updateDynamoCustomer(props.item);
              props.navigation.navigate('User Profile', {
                profile: props.item,
              });
            }
          }}
        />
      </View>
    );
  } else if (props.toChange === 'phoneNumber') {
    dataType = props.item.customerInfo.contactInformation.contactNumber;

    return (
      <View style={styles.general}>
        <Input
          label={props.attribute}
          placeholder={`${dataType[props.toChange]}`}
          onChangeText={value => {
            updatedValue = value;
          }}
        />
        <Button
          icon={<Icon name="check" size={20} color="white" />}
          title=" Save Changes"
          buttonStyle={styles.defaultButton}
          onPress={() => {
            if (updatedValue.trim() === '') {
              Alert.alert('Please enter a phone number');
            } else if (dataType[props.toChange] !== updatedValue) {
              dataType[props.toChange] = updatedValue;
              updateDynamoCustomer(props.item);
              props.navigation.navigate('User Profile', {
                profile: props.item,
              });
            }
          }}
        />
      </View>
    );
  } else if (
    props.toChange === 'savedAddresses' ||
    props.toChange === 'existingAddress'
  ) {
    dataType = props.item.customerInfo.customerAddress.savedAddresses;
    var updatedAddress = {
      address: '',
      zip: '',
      city: '',
      state: '',
    };
    return (
      <View style={styles.general}>
        <Text h4 style={styles.titles}>
          {props.attribute}
        </Text>
        <Input
          placeholder={'Address'}
          onChangeText={value => {
            setAddress(value.trim());
          }}
        />
        <Input
          placeholder={'City'}
          onChangeText={value => {
            setCity(value.trim());
          }}
        />
        <View style={{flexDirection: 'row'}}>
          {/* <Picker
            selectedValue={addressState}
            style={{
              width: windowWidth / 3,
              height: 44,
              marginLeft: 25,
            }}
            itemStyle={{
              height: 44,
            }}
            onValueChange={value => {
              updatedAddress.state = value;
              //change dropdown
              setState(value.trim());
            }}>
            <Picker.Item label={'State'} value={''} />
            <Picker.Item label={'CA'} value={'CA'} />
          </Picker> */}
          <Input
            placeholder={'Zip'}
            inputContainerStyle={{
              width: windowWidth / 3,
              marginLeft: 25,
            }}
            onChangeText={value => {
              setZip(value.trim());
            }}
          />
        </View>
        <Button
          icon={<Icon name="check" size={20} color="white" />}
          title=" Save Changes"
          buttonStyle={styles.defaultButton}
          onPress={() => {
            updatedAddress.address = addressAddress;
            updatedAddress.city = addressCity;
            updatedAddress.state = addressState;
            updatedAddress.zip = addressZip;
            if (
              updatedAddress.address.trim() === '' ||
              updatedAddress.city.trim() === '' ||
              updatedAddress.state.trim() === '' ||
              updatedAddress.zip.trim() === ''
            ) {
              Alert.alert('Please fill all address fields');
            } else {
              dataType.push(updatedAddress);
              updateDynamoCustomer(props.item);
              props.navigation.navigate('User Profile', {
                profile: props.item,
              });
            }
          }}
        />
      </View>
    );
  } else if (props.toChange === 'savedCards') {
    dataType = props.item.paymentOptions.cards;
    var updatedCard = {
      cardType: '',
      cardNumber: '',
      nameOnCard: '',
      cvv: '',
      expirationMonth: '',
      expirationYear: '',
    };
    return (
      <View style={styles.general}>
        <Text h4 style={styles.titles}>
          {props.attribute}
        </Text>
        <Input
          placeholder={'Card Number'}
          onChangeText={value => {
            setCardNumbers(value.trim());
          }}
        />
        <Input
          placeholder={'Name on Card'}
          onChangeText={value => {
            setCardName(value.trim());
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            width: 225,
          }}>
          <Input
            inputContainerStyle={{
              width: windowWidth / 2,
            }}
            placeholder={'Card Type'}
            onChangeText={value => {
              setCardTyping(value.trim());
            }}
          />
          <Input
            inputContainerStyle={{
              width: windowWidth / 4,
            }}
            placeholder={'CVV'}
            onChangeText={value => {
              setCardCvv(value.trim());
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <Picker
            selectedValue={expMonth}
            style={{
              width: windowWidth / 3,
              height: 44,
              marginLeft: 25,
            }}
            itemStyle={{
              height: 44,
            }}
            onValueChange={value => {
              updatedCard.expirationMonth = value;
              //change dropdown
              setExpMonth(value);
            }}>
            <Picker.Item label={'Exp Month'} value={''} />
            <Picker.Item label={'01'} value={'01'} />
            <Picker.Item label={'02'} value={'02'} />
            <Picker.Item label={'03'} value={'03'} />
            <Picker.Item label={'04'} value={'04'} />
            <Picker.Item label={'05'} value={'05'} />
            <Picker.Item label={'06'} value={'06'} />
            <Picker.Item label={'07'} value={'07'} />
            <Picker.Item label={'08'} value={'08'} />
            <Picker.Item label={'09'} value={'09'} />
            <Picker.Item label={'10'} value={'10'} />
            <Picker.Item label={'11'} value={'11'} />
            <Picker.Item label={'12'} value={'12'} />
          </Picker>
          <Picker
            selectedValue={expYear}
            style={{
              width: windowWidth / 3,
              height: 44,
              marginLeft: 25,
            }}
            itemStyle={{
              height: 44,
            }}
            onValueChange={value => {
              updatedCard.expirationYear = value;
              //change dropdown
              setExpYear(value);
            }}>
            <Picker.Item label={'Exp Year'} value={''} />
            <Picker.Item label={'2020'} value={'2020'} />
            <Picker.Item label={'2021'} value={'2021'} />
            <Picker.Item label={'2022'} value={'2022'} />
            <Picker.Item label={'2023'} value={'2023'} />
          </Picker>
        </View>
        <Button
          icon={<Icon name="check" size={20} color="white" />}
          title=" Save Changes"
          buttonStyle={styles.defaultButton}
          onPress={() => {
            //set values to profile copy
            updatedCard.cvv = cardCvv;
            updatedCard.cardNumber = cardNumbers;
            updatedCard.cardType = cardTyping;
            updatedCard.nameOnCard = cardName;
            updatedCard.expirationMonth = expMonth;
            updatedCard.expirationYear = expYear;
            if (
              updatedCard.cardType === '' ||
              updatedCard.cardNumber === '' ||
              updatedCard.nameOnCard === '' ||
              updatedCard.cvv === '' ||
              updatedCard.expirationMonth === '' ||
              updatedCard.expirationYear === ''
            ) {
              Alert.alert('Please enter all card fields');
            } else {
              dataType.push(updatedCard);
              updateDynamoCustomer(props.item);
              props.navigation.navigate('User Profile', {
                profile: props.item,
              });
            }
          }}
        />
      </View>
    );
  } else if (props.toChange === 'customerName') {
    dataType = props.item.customerInfo;
    var updatedFirstName;
    var updatedLastName;

    return (
      <View style={styles.general}>
        <Input
          label={'First Name'}
          placeholder={`${dataType[props.toChange].firstName}`}
          onChangeText={value => {
            updatedFirstName = value;
          }}
          containerStyle={styles.defaultInput}
        />
        <Input
          label={'Last Name'}
          placeholder={`${dataType[props.toChange].lastName}`}
          onChangeText={value => {
            updatedLastName = value;
          }}
        />
        <Button
          icon={<Icon name="check" size={20} color="white" />}
          title=" Save Changes"
          buttonStyle={styles.defaultButton}
          onPress={() => {
            if (
              dataType[props.toChange].firstName !== updatedFirstName ||
              dataType[props.toChange].lastName !== updatedLastName
            ) {
              //check if input is blank, default to whats in data
              if (updatedFirstName === '' || !updatedFirstName) {
                dataType[props.toChange].firstName =
                  dataType[props.toChange].firstName;
              } else {
                dataType[props.toChange].firstName = updatedFirstName;
              }
              if (updatedLastName === '' || !updatedLastName) {
                dataType[props.toChange].lastName =
                  dataType[props.toChange].lastName;
              } else {
                dataType[props.toChange].lastName = updatedLastName;
              }
              updateDynamoCustomer(props.item);
              props.navigation.navigate('User Profile', {
                profile: props.item,
              });
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
  },
  statusPicker: {
    width: 200,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    marginBottom: 10,
  },
  defaultButton: {
    width: 200,
    marginLeft: 100,
    padding: 10,
    marginTop: 50,
  },
});

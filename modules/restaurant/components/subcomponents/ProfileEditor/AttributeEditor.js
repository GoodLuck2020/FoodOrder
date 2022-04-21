/* eslint-disable react-native/no-inline-styles */
import {View, StyleSheet, Alert} from 'react-native';
import {Input, Button, Icon, Text} from 'react-native-elements';
import React, {useState} from 'react';

import {Dimensions} from 'react-native';
import {validatePrice, validateDistance} from './AttributeValidator';
import {updateDynamoRestaurant} from './updateDynamoRest';

export function EditTextAttribute(props) {
  var updatedValue = '';
  var dataType;
  //Dimension variables
  const windowWidth = Dimensions.get('window').width;
  //Hook variables for address
  const [addressAddress, setAddress] = useState('');
  const [addressState, setState] = useState('');
  const [addressZip, setZip] = useState('');
  const [addressCity, setCity] = useState('');

  if (props.toChange === 'restaurantAddress') {
    dataType = props.item.restaurantInfo;

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
            if (
              dataType.restaurantAddress.address.trim() === '' ||
              dataType.restaurantAddress.city.trim() === '' ||
              dataType.restaurantAddress.state.trim() === '' ||
              dataType.restaurantAddress.zip.trim() === ''
            ) {
              Alert.alert('Please fill all address fields');
            } else {
              dataType.restaurantAddress.address = addressAddress;
              dataType.restaurantAddress.city = addressCity;
              dataType.restaurantAddress.state = addressState;
              dataType.restaurantAddress.zip = addressZip;
              updateDynamoRestaurant(props.item);
              props.navigation.navigate('Profile', {
                profile: props.item,
              });
            }
          }}
        />
      </View>
    );
  } else {
    if (
      props.toChange === 'flatFee' ||
      props.toChange === 'maxRadius' ||
      props.toChange === 'flatFeeRadius' ||
      props.toChange === 'additionalDeliveryFee'
    ) {
      dataType = props.item.deliveryOptions;
      if (
        props.toChange === 'flatFee' ||
        props.toChange === 'additionalDeliveryFee'
      ) {
        var inputDisplay = `$ ${dataType[props.toChange]}`;
      } else {
        var inputDisplay = `${dataType[props.toChange]} mile(s)`;
      }
    } else {
      dataType = props.item.restaurantInfo;
      var inputDisplay = `${dataType[props.toChange]}`;
    }
    return (
      <View style={styles.general}>
        <Input
          label={props.attribute}
          placeholder={`${inputDisplay}`}
          onChangeText={value => {
            updatedValue = value;
          }}
        />
        <Button
          icon={<Icon name="check" size={15} color="white" />}
          title=" Save Changes"
          buttonStyle={styles.defaultButton}
          onPress={() => {
            if (
              props.toChange === 'flatFee' ||
              props.toChange === 'additionalDeliveryFee'
            ) {
              if (validatePrice(updatedValue)) {
                if (dataType[props.toChange] !== updatedValue) {
                  dataType[props.toChange] = updatedValue;
                  updateDynamoRestaurant(props.item);
                  props.navigation.navigate('Profile', {
                    profile: props.item,
                  });
                }
              } else {
                Alert.alert('Please enter a valid fee');
              }
            } else if (
              props.toChange === 'maxRadius' ||
              props.toChange === 'flatFeeRadius'
            ) {
              if (validateDistance(updatedValue)) {
                updatedValue = parseFloat(
                  updatedValue.replace('$', '').replace(' ', ''),
                );
                if (dataType[props.toChange] !== updatedValue) {
                  dataType[props.toChange] = updatedValue;
                  updateDynamoRestaurant(props.item);
                  props.navigation.navigate('Profile', {
                    profile: props.item,
                  });
                }
              } else {
                Alert.alert('Please enter a valid distance');
              }
            } else {
              if (dataType[props.toChange] !== updatedValue) {
                dataType[props.toChange] = updatedValue;
                updateDynamoRestaurant(props.item);
                props.navigation.navigate('Profile', {
                  profile: props.item,
                });
              }
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
  },
  statusPicker: {
    width: 200,
  },
  defaultButton: {
    width: 200,
    marginLeft: 100,
    padding: 10,
    marginTop: 50,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    marginBottom: 10,
  },
});

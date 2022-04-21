import React, {useState} from 'react';
import {Text, Input, Button} from 'react-native-elements';
import {View, StyleSheet, ScrollView, AsyncStorage} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';
import PhoneInput from 'react-native-phone-number-input';
import {Auth} from 'aws-amplify';
import SelectPicker from 'react-native-picker-select';

export default function Signup({authState, onStateChange}) {
  const [data, setData] = useState({
    email: '',
    password: '',
    phonenumber: '',
    userType: 'customer',
  });

  const [error, seterror] = useState('');

  const signUp = () => {
    if (!data.userType) {
      seterror('You have to select the user type');
      return;
    }
    Auth.signUp({
      username: data.email,
      password: data.password,
      attributes: {email: data.email, phone_number: data.phonenumber},
    })
      .then(res => {
        AsyncStorage.setItem(
          'userdata',
          JSON.stringify({
            email: data.email,
            userId: res.userSub,
            userType: data.userType,
            phoneNumber: data.phonenumber,
          }),
        );

        setData({
          email: '',
          password: '',
          phonenumber: '',
          userType: 'customer',
        });
        seterror('');
        onStateChange('confirmSignUp');
      })
      .catch(err => seterror(err.message));
  };

  if (authState == 'signUp') {
    return (
      <ScrollView style={style.container}>
        <Text h4 h4Style={{fontSize: RFValue(18, 580)}}>
          Create a new account
        </Text>
        <View style={{marginTop: 15}}>
          {error != '' && (
            <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
          )}
          <Input
            label="Email *"
            value={data.email}
            autoCapitalize="none"
            inputStyle={style.inputStyle}
            inputContainerStyle={{borderBottomWidth: 0}}
            style={{marginTop: 15}}
            labelStyle={{color: 'black', fontWeight: 'normal'}}
            onChangeText={value => setData({...data, email: value})}
          />
          <Input
            label="Password *"
            value={data.password}
            secureTextEntry={true}
            autoCapitalize="none"
            inputStyle={style.inputStyle}
            inputContainerStyle={{borderBottomWidth: 0}}
            style={{marginTop: 15}}
            labelStyle={{color: 'black', fontWeight: 'normal'}}
            onChangeText={value => setData({...data, password: value})}
          />
          <View style={{paddingLeft: 15, paddingRight: 15}}>
            <Text>Phone Number *</Text>
            <PhoneInput
              defaultCode="US"
              layout="first"
              withDarkTheme
              withShadow
              value={data.phonenumber}
              containerStyle={{
                marginTop: 5,
                borderWidth: 1,
                borderColor: '#888',
              }}
              onChangeFormattedText={value =>
                setData({...data, phonenumber: value})
              }
            />
          </View>
          <View style={{paddingLeft: 15, paddingRight: 15, marginTop: 15}}>
            <Text>User Type</Text>
            <SelectPicker
              items={[
                {label: 'Customer', value: 'customer'},
                {label: 'Restaurant', value: 'restaurant'},
              ]}
              textInputProps={{
                style: {
                  width: wp('100') - 70,
                  height: 50,
                  marginTop: 5,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderColor: '#AAA',
                  borderWidth: 1,
                  padding: 5,
                  fontSize: RFValue(15, 580),
                  color: '#888',
                },
              }}
              value={data.userType}
              onValueChange={value =>
                setData({
                  ...data,
                  userType: value,
                })
              }
            />
          </View>
          <Button
            buttonStyle={style.buttonStyle}
            title="NEXT"
            onPress={signUp}
          />
          <Button
            type="clear"
            title="Sign In"
            titleStyle={{color: '#AAAA00'}}
            buttonStyle={{marginTop: 25}}
            onPress={() => onStateChange('signIn')}
          />
        </View>
      </ScrollView>
    );
  } else {
    return null;
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: wp('100'),
    height: hp('100'),
    padding: 24,
  },
  inputStyle: {
    flex: 1,
    marginTop: 5,
    borderRadius: 5,
    borderColor: '#888',
    borderWidth: 1,
    paddingLeft: 15,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
    marginTop: 30,
  },
});

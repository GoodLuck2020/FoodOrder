// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from '@react-native-community/google-signin';

//TODO: get this external module connected async with google and facebook login sdk
import React from 'react';
import {SignIn} from 'aws-amplify-react-native';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';
import {Input, Button} from 'react-native-elements';
import {Auth} from 'aws-amplify';
import {AuthState} from '@aws-amplify/ui-components';
export default class signIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
    };
  }

  signin = () => {
    try {
      let self = this;
      Auth.signIn({username: this.state.email, password: this.state.password})
        .then(() => {
          self.props.onStateChange('signedIn');
        })
        .catch(err => this.setState({error: err.message}));
    } catch (e) {
      this.setState({error: e.message});
    }
  };

  render() {
    if (
      this.props.authState == 'signIn' ||
      this.props.authState == 'signedUp'
    ) {
      return (
        <ImageBackground
          source={require('../assets/bg.png')}
          style={{
            width: wp('100'),
            height: hp('100'),
            marginTop: Platform.OS == 'ios' ? -20 : 0,
          }}>
          <View
            style={{
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 64,
              paddingBottom: 24,
              flex: 1,
            }}>
            <View style={{flex: 1}}>
              <Image
                source={require('../assets/logo_white.png')}
                style={style.logo}
                resizeMode="cover"
              />
              {/* <Text style={style.signintext}>Sign in to continue</Text> */}
              <View style={{marginTop: 50}}>
                <Input
                  autoCapitalize="none"
                  placeholder="Email Address"
                  placeholderTextColor="white"
                  TextColor="white"
                  inputStyle={{color: 'white'}}
                  containerStyle={{paddingHorizontal: 0}}
                  inputContainerStyle={{
                    borderBottomColor: '#ffffff88',
                    borderBottomWidth: 1,
                    marginLeft: 0,
                  }}
                  onChangeText={value => this.setState({email: value})}
                />
                <Input
                  autoCapitalize="none"
                  placeholder="Password"
                  placeholderTextColor="white"
                  inputStyle={{color: 'white'}}
                  containerStyle={{paddingHorizontal: 0}}
                  inputContainerStyle={{
                    borderBottomColor: '#ffffff88',
                    borderBottomWidth: 1,
                  }}
                  secureTextEntry={true}
                  onChangeText={value => this.setState({password: value})}
                />
                <Button
                  title="SIGN IN"
                  buttonStyle={{
                    backgroundColor: '#F86D64',
                    paddingTop: 15,
                    paddingBottom: 15,
                    marginTop: 30,
                  }}
                  onPress={this.signin}
                />
                <TouchableOpacity
                  style={{marginTop: 30}}
                  onPress={() => this.props.onStateChange('forgotPassword')}>
                  <Text style={style.forgot}>Forgot your password?</Text>
                </TouchableOpacity>
                {this.state.error != '' && (
                  <Text style={style.error}>{this.state.error}</Text>
                )}
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text style={style.forgot}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => this.props.onStateChange('signUp')}>
                <Text style={[style.forgot, {fontWeight: 'bold'}]}>
                  SIGN UP
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      );
    } else {
      return null;
    }
  }
}

const style = StyleSheet.create({
  logo: {
    width: wp('80'),
    height: wp('23'),
    alignSelf: 'center',
  },
  signintext: {
    color: 'white',
    fontSize: RFValue(17, 580),
    marginTop: 5,
  },
  forgot: {
    color: 'white',
    fontSize: RFValue(15, 580),
    textAlign: 'center',
  },
  error: {
    color: '#FB322F',
    textAlign: 'center',
    marginTop: 15,
  },
});

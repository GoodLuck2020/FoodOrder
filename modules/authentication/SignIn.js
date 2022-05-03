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
    Dimensions,
    SafeAreaView
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';
import {Input, Button} from 'react-native-elements';
import {Auth} from 'aws-amplify';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {AuthState} from '@aws-amplify/ui-components';

import Images from "../theme/Images";

const sWidth = Dimensions.get('window').width;
const sHeight = Dimensions.get('window').height;

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
          <View style={{flex: 1}}>
              <Image source={Images.login_bg} style={styles.loginBg} />
              <SafeAreaView style={{flex: 1}}>
                  <View style={styles.container}>
                      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                          <View style={styles.contentView}>
                              <View style={{flex: 1}}>
                                  <Image
                                      source={Images.logo}
                                      style={styles.logo}
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
                                          onChangeText={value => this.setState({email: value, error: ''})}
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
                                          onChangeText={value => this.setState({password: value, error: ''})}
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
                                      {this.state.error != '' && (
                                          <Text style={styles.error}>{this.state.error}</Text>
                                      )}
                                      <TouchableOpacity
                                          style={{marginTop: 15}}
                                          onPress={() => this.props.onStateChange('forgotPassword')}>
                                          <Text style={styles.forgot}>Forgot your password?</Text>
                                      </TouchableOpacity>
                                      <Button
                                          title="SIGN UP"
                                          buttonStyle={{
                                              backgroundColor: '#F86D64',
                                              paddingTop: 15,
                                              paddingBottom: 15,
                                              marginTop: 30,
                                          }}
                                          onPress={() => this.props.onStateChange('signUp')}
                                      />
                                  </View>
                              </View>
                          </View>
                      </KeyboardAwareScrollView>
                  </View>
              </SafeAreaView>
          </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
    loginBg: {
        position: 'absolute',
        left: -10,
        top: -50,
        width: sWidth + 20,
        height: sHeight + 30,
        resizeMode: 'cover',
    },
    logo: {
        width: sWidth - 50,
        height: 100,
        resizeMode: 'contain',
    },
    container: {
        flex: 1,
    },
    contentView: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: (sHeight - 600) / 2
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
    marginTop: 10,
  },

});

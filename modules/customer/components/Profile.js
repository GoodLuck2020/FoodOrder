import React, {useEffect, useState, useCallback} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileEditor from './subcomponents/ProfileEditor/ProfileEditor';
import {ListItem, Text, Button, Input, Icon} from 'react-native-elements';
import {EditTextAttribute} from './subcomponents/ProfileEditor/AttributeEditor';
import SelectPhotos from './subcomponents/ProfileEditor/PhotoSelector';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';
import SelectPicker from 'react-native-picker-select';
import state from '../../restaurant/components/state.json';
import PhoneInput from 'react-native-phone-number-input';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {updateDynamoCustomer} from './subcomponents/ProfileEditor/updateDynamoCustomer';
import Loading from 'react-native-loading-spinner-overlay';
import {CreditCardInput} from 'react-native-credit-card-input-view';

//import testProfile from './subcomponents/testProfile';
import {Auth} from 'aws-amplify';
import AWS from 'aws-sdk';
import {decode} from 'base64-arraybuffer';
import config from '../../customer/config';

var profile;
//var profile = testProfile();
const Stack = createStackNavigator();

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    Auth.currentUserInfo();
    this.state = {
      signedIn: false,
      name: '',
      protoUrl: '',
      profile: props.route.params.data,
    };
    profile = this.state.profile;
  }

  editProfile = newProfile => {
    this.setState({profile: newProfile});
  };

  render() {
    return (
      <Stack.Navigator initialRouteName="Profile">
        <Stack.Screen
          name="User Profile"
          component={Edit}
          initialParams={{
            profile: this.state.profile,
            needsUpdate: false,
          }}
          options={({navigation, route}) => ({
            headerRight: props =>
              !route.params.edit ? (
                <Button
                  icon={<Icon name="create" color="#03a5fc" />}
                  title="Edit"
                  type="clear"
                  onPress={() => navigation.setParams({edit: true})}
                />
              ) : (
                <></>
              ),
          })}
        />
        <Stack.Screen
          name="Payment Method"
          component={PaymentMethod}
          initialParams={{
            profile: this.state.profile,
          }}
          options={({navigation}) => ({})}
        />
        <Stack.Screen
          name="Editor"
          component={EditProfile}
          initialParams={{
            item: this.state.profile,
          }}
          options={({navigation}) => ({
            title: 'Profile Editor',
          })}
        />
        <Stack.Screen
          name="ProfileEditor"
          component={ProfileEditor}
          options={({navigation}) => ({
            title: 'Profile Editor',
          })}
        />
      </Stack.Navigator>
    );
  }
}

const PaymentMethod = ({navigation, route}) => {
  const [valid, setValid] = useState(false);
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const onChangeCard = form => {
    setValid(form.valid);
    setCard(form.values);
  };

  const submitMethod = () => {
    if (valid) {
      let profile = route.params.profile;
      profile.paymentOptions.cards = [card, ...profile.paymentOptions.cards];
      navigation.navigate('User Profile', {profile: profile, update: true});
    }
  };

  return (
    <View style={{padding: 24, flex: 1}}>
      <Text h4 style={styles.titles}>
        Add Payment Method
      </Text>
      <View style={{flex: 1, marginTop: 50}}>
        <CreditCardInput
          requiresName={true}
          useVertical={true}
          allowScroll={true}
          requiresCvc={true}
          imageFront={false}
          imageBack={false}
          cardScale={0}
          labels={{
            expiry: 'Expiration',
            name: 'Name',
            cvc: 'CVC',
            number: 'Card Number',
          }}
          onChange={onChangeCard}
        />
      </View>
      <Button
        buttonStyle={styles.buttonStyle}
        title="Save Payment Method"
        onPress={submitMethod}
      />
    </View>
  );
};

const CreditCard = ({card, setDefault, onDelete, editable}) => {
  const cardArray = card.number.split(' ');
  const cardNumber = cardArray
    .map((item, index) => {
      let itemNumber = '';
      for (let indexNum = 0; indexNum < item.length; indexNum++) {
        itemNumber += 'X';
      }
      if (index < cardArray.length - 1) {
        return itemNumber;
      } else {
        return item;
      }
    })
    .join(' ');
  return (
    <TouchableOpacity style={styles.cardcontainer}>
      <View style={{flex: 1}}>
        <Text>{card.name}</Text>
        <Text>{cardNumber}</Text>
      </View>
      {/* <TouchableOpacity style={styles.check} onPress={setDefault}>
        {card.default && (
          <Icon name="check" size={RFValue(20, 580)} color="#F86D64" />
        )}
      </TouchableOpacity> */}
      {editable && (
        <TouchableOpacity style={{marginLeft: 15}} onPress={onDelete}>
          <Icon
            name="trash"
            type="entypo"
            size={RFValue(20, 580)}
            color="#F86D64"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

function Edit({navigation, route}) {
  const [image, setImage] = useState(null);
  const [profiledata, setProfiledata] = useState(profile);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    if (route.params.edit) {
      setImage(null);
    }
  }, [route.params.edit]);

  useEffect(() => {
    if (route.params.update) {
      navigation.setParams({update: false});
      setProfiledata(route.params.profile);
      saveprofile(route.params.profile);
    }
  }, [navigation, route.params.profile, route.params.update, saveprofile]);

  const updateimage1 = (keyString, blob) => {
    return new Promise((resolve, reject) => {
      var s3 = new AWS.S3({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      });

      let body = decode(blob);

      s3.upload(
        {
          Bucket: config.bucket,
          Key: keyString,
          Body: body,
          ContentType: 'image/jpg',
          ACL: 'public-read',
        },
        (err, data) => {
          console.log(err);
          if (!err) {
            resolve(data.Location);
          } else {
            reject(err);
          }
        },
      );
    });
  };

  const uploadS3bucket = async () => {
    let blob = await RNFetchBlob.fs.readFile(image.uri, 'base64');
    const info = await Auth.currentUserInfo();
    // const responseimg = await fetch(
    //   'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/updates3bucket',
    //   {
    //     method: 'POST',
    //     mode: 'cors',
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     credentials: 'same-origin', // include, *same-origin, omit
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //       Connection: 'keep-alive',
    //       // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
    //     },
    //     body: JSON.stringify(body),
    //   },
    // );

    // const responsejson = await responseimg.json();

    let keyString =
      'customers/' + info.username + '/' + new Date().getTime() + '.jpg';

    return await updateimage1(keyString, blob);
  };

  const openpicker = () => {
    if (route.params.edit) {
      ImagePicker.openPicker({}).then(res => {
        setImage({
          uri: res.path,
          filename: res.filename,
          type: res.mime,
        });
      });
    }
  };

  const saveprofile = useCallback(async profile => {
    try {
      setloading(true);

      let profileinfo = {...profile};
      if (image) {
        let picture = await uploadS3bucket();
        profileinfo.customerInfo.picture = picture;
      }

      setImage(null);
      setloading(false);
      updateDynamoCustomer(profileinfo);
      navigation.setParams({edit: false});
    } catch (e) {
      setloading(false);
    }
  });

  return (
    <ScrollView>
      <View style={styles.general}>
        <Text h4 style={styles.titles}>
          User Information
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            padding: 10,
            alignItems: 'center',
          }}>
          <TouchableOpacity style={[styles.picture]} onPress={openpicker}>
            {image || profiledata.customerInfo.picture ? (
              <Image
                source={{
                  uri:
                    image && route.params.edit
                      ? image.uri
                      : profiledata.customerInfo.picture +
                        '?date=' +
                        new Date().getTime(),
                }}
                style={styles.picture}
              />
            ) : (
              <Icon name="image" size={RFValue(30, 580)} />
            )}
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Input
              label="First Name"
              inputContainerStyle={{borderBottomWidth: 0}}
              placeholder="First Name"
              disabled={!route.params.edit}
              value={profiledata.customerInfo.customerName.firstName}
              onChangeText={value =>
                setProfiledata({
                  ...profiledata,
                  customerInfo: {
                    ...profiledata.customerInfo,
                    customerName: {
                      ...profiledata.customerInfo.customerName,
                      firstName: value,
                    },
                  },
                })
              }
              inputStyle={styles.input}
            />
            <Input
              label="Last Name"
              inputContainerStyle={{borderBottomWidth: 0}}
              placeholder="Last Name"
              disabled={!route.params.edit}
              value={profiledata.customerInfo.customerName.lastName}
              onChangeText={value =>
                setProfiledata({
                  ...profiledata,
                  customerInfo: {
                    ...profiledata.customerInfo,
                    customerName: {
                      ...profiledata.customerInfo.customerName,
                      lastName: value,
                    },
                  },
                })
              }
              inputStyle={styles.input}
            />
          </View>
        </View>
        <View>
          <Input
            label="Customer Address"
            inputContainerStyle={{borderBottomWidth: 0}}
            placeholder="Address"
            disabled={!route.params.edit}
            value={profiledata.customerInfo.address?.address}
            onChangeText={value =>
              setProfiledata({
                ...profiledata,
                customerInfo: {
                  ...profiledata.customerInfo,
                  address: {
                    ...profiledata.customerInfo.address,
                    address: value,
                  },
                },
              })
            }
            inputStyle={styles.input}
          />
          <Input
            label="Customer City"
            inputContainerStyle={{borderBottomWidth: 0}}
            placeholder="Customer City"
            disabled={!route.params.edit}
            value={profile.customerInfo.address?.city}
            onChangeText={value =>
              setProfiledata({
                ...profiledata,
                customerInfo: {
                  ...profiledata.customerInfo,
                  address: {
                    ...profiledata.customerInfo.address,
                    city: value,
                  },
                },
              })
            }
            inputStyle={styles.input}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View>
              <SelectPicker
                items={Object.keys(state).map(item => ({
                  label: state[item],
                  value: item,
                }))}
                placeholder={{label: 'State'}}
                textInputProps={{
                  style: {
                    width: wp('100') / 2,
                    height: 40,
                    marginLeft: 15,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderColor: '#AAA',
                    borderWidth: 1,
                    padding: 5,
                    fontSize: RFValue(15, 580),
                    color: '#888',
                  },
                }}
                style={{
                  backgroundColor: 'white',
                }}
                value={profiledata.customerInfo.address?.state}
                onValueChange={value =>
                  setProfiledata({
                    ...profiledata,
                    customerInfo: {
                      ...profiledata.customerInfo,
                      address: {
                        ...profiledata.customerInfo.address,
                        state: value,
                      },
                    },
                  })
                }
                disabled={!route.params.edit}
              />
            </View>
            <View style={{flex: 1}}>
              <Input
                label="Zip Code"
                inputStyle={styles.input}
                placeholder="Zip Code"
                inputContainerStyle={{borderBottomWidth: 0}}
                disabled={!route.params.edit}
                value={profiledata.customerInfo.address?.zipcode}
                onChangeText={value =>
                  setProfiledata({
                    ...profiledata,
                    customerInfo: {
                      ...profiledata.customerInfo,
                      address: {
                        ...profiledata.customerInfo.address,
                        zipcode: value,
                      },
                    },
                  })
                }
              />
            </View>
          </View>
          <Input
            label="Email Address"
            autoCapitalize="none"
            inputStyle={styles.input}
            placeholder="Email Address"
            inputContainerStyle={{borderBottomWidth: 0}}
            disabled={!route.params.edit}
            value={profiledata.customerInfo.contactInformation.emailAddress}
            onChangeText={value =>
              setProfiledata({
                ...profiledata,
                customerInfo: {
                  ...profiledata.customerInfo,
                  contactInformation: {
                    ...profiledata.customerInfo.contactInformation,
                    emailAddress: value,
                  },
                },
              })
            }
          />
          <View style={{marginLeft: 15, marginRight: 15}}>
            <Text style={{fontSize: RFValue(12, 580), color: '#888'}}>
              Phone Number
            </Text>
            <PhoneInput
              defaultCode="US"
              containerStyle={{
                width: wp('100') - 30,
                backgroundColor: 'white',
                borderColor: '#979797',
                borderWidth: 1,
              }}
              disabled={!route.params.edit}
              value={
                profiledata.customerInfo.contactInformation.contactNumber
                  .phoneNumber
              }
              onChangeText={value =>
                setProfiledata({
                  ...profiledata,
                  customerInfo: {
                    ...profiledata.customerInfo,
                    contactInformation: {
                      ...profiledata.customerInfo.contactInformation,
                      contactNumber: {
                        ...profiledata.customerInfo.contactInformation
                          .contactNumber,
                        phoneNumber: value,
                      },
                    },
                  },
                })
              }
            />
          </View>
          <View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 15,
                alignItems: 'center',
              }}>
              <View style={{width: 25}} />
              <Text h4 style={styles.titles}>
                Payment Options
              </Text>
              {route.params.edit ? (
                <Icon
                  name="create"
                  onPress={() => {
                    navigation.navigate('Payment Method', {
                      profile: profiledata,
                    });
                  }}
                />
              ) : (
                <View style={{width: 25}} />
              )}
            </View>

            {profiledata.paymentOptions.cards.map((item, indexCard) => (
              <CreditCard
                card={item}
                key={indexCard.toString()}
                setDefault={() => {
                  let profileinfo = {
                    ...profiledata,
                    paymentOptions: {
                      ...profiledata.paymentOptions,
                      cards: profiledata.paymentOptions.cards.map(
                        (item, index) =>
                          index === indexCard
                            ? {...item, default: true}
                            : {...item, default: false},
                      ),
                    },
                  };
                  setProfiledata(profileinfo);
                  saveprofile(profileinfo);
                }}
                onDelete={() => {
                  let profileinfo = {
                    ...profiledata,
                    paymentOptions: {
                      ...profiledata.paymentOptions,
                      cards: profiledata.paymentOptions.cards.filter(
                        (item, index) => index !== indexCard,
                      ),
                    },
                  };

                  setProfiledata(profileinfo);
                  saveprofile(profileinfo);
                }}
                editable={route.params.edit}
              />
            ))}
          </View>
          {route.params.edit ? (
            <View style={styles.buttoncontainer}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => navigation.setParams({edit: false})}
                buttonStyle={[
                  styles.buttonStyle,
                  {
                    marginBottom: 15,
                    backgroundColor: 'white',
                    borderColor: '#888',
                  },
                ]}
                titleStyle={{color: '#888'}}
              />
              <Button
                title="Save & Update"
                onPress={() => saveprofile(profiledata)}
                buttonStyle={styles.buttonStyle}
              />
            </View>
          ) : (
            <Button
              buttonStyle={styles.buttonStyle}
              style={{marginLeft: 15, marginRight: 15}}
              title="Sign Out"
              onPress={() => Auth.signOut()}
            />
          )}
        </View>
        <Loading visible={loading} />
      </View>
    </ScrollView>
  );
}

function EditProfile({navigation, route}) {
  return (
    <EditTextAttribute
      navigation={navigation}
      item={route.params.item}
      attribute={route.params.attribute}
      toChange={route.params.toChange}
    />
  );
}

function ProfileList({navigation, route}) {
  return (
    <ScrollView>
      <View style={styles.general}>
        <Text h4 style={styles.titles}>
          User Information
        </Text>
        <ListItem
          leftAvatar={{
            title: profile.customerInfo.customerInfo.customerName.firstName,
            source: {
              uri: profile.customerInfo.customerInfo.picture,
            },
            showAccessory: true,
            avatarStyle: {
              borderColor: '#ffffff',
            },
            rounded: true,
            size: 'xlarge',
            onAccessoryPress: () => {
              navigation.navigate('PhotoSelector', {
                profile: profile,
                name: profile.customerInfo,
                toChange: 'customerInfo',
                new: false,
              });
            },
          }}
          title={profile.customerInfo.customerInfo.customerName.firstName}
          subtitle={profile.customerInfo.customerInfo.customerName.lastName}
          bottomDivider
          chevron
          onPress={() => {
            navigation.navigate('Editor', {
              profile: profile,
              name: profile.customerInfo.customerInfo.customerName,
              attribute: 'Customer Name',
              attributeToEdit: profile.customerInfo.customerInfo.customerName,
              toChange: 'customerName',
              new: false,
            });
          }}
        />
        <ListItem
          title={'Saved Addresses '}
          bottomDivider
          chevron
          onPress={() =>
            navigation.navigate('ProfileEditor', {
              profile: profile,
              name:
                profile.customerInfo.customerInfo.customerAddress
                  .savedAddresses,
              attribute: 'Saved Addresses',
              attributeToEdit:
                profile.customerInfo.customerInfo.customerAddress
                  .savedAddresses,
              toChange: 'savedAddresses',
              toEditor: 'addressNavigation',
              new: false,
            })
          }
        />
        <Text h4 style={styles.titles}>
          Contact Information
        </Text>
        <ListItem
          title={
            'Email : ' +
            profile.customerInfo.customerInfo.contactInformation.emailAddress
          }
          bottomDivider
          chevron
          onPress={() =>
            navigation.navigate('Editor', {
              profile: profile,
              name:
                profile.customerInfo.customerInfo.contactInformation
                  .emailAddress,
              attribute: 'Email Address',
              attributeToEdit:
                profile.customerInfo.customerInfo.contactInformation
                  .emailAddress,
              toChange: 'emailAddress',
              new: false,
            })
          }
        />
        <ListItem
          title={
            'Phone : ' +
            profile.customerInfo.customerInfo.contactInformation.contactNumber
              .phoneNumber
          }
          bottomDivider
          chevron
          onPress={() =>
            navigation.navigate('Editor', {
              profile: profile,
              name:
                profile.customerInfo.customerInfo.contactInformation
                  .contactNumber.phoneNumber,
              attribute: 'Phone Number',
              attributeToEdit:
                profile.customerInfo.customerInfo.contactInformation
                  .contactNumber.phoneNumber,
              toChange: 'phoneNumber',
              new: false,
            })
          }
        />
        <Text h4 style={styles.titles}>
          Payment Options
        </Text>
        <ListItem
          title={'Saved Cards'}
          bottomDivider
          chevron
          onPress={() =>
            navigation.navigate('ProfileEditor', {
              profile: profile,
              name: profile.paymentOptions,
              attribute: 'Payment Options',
              attributeToEdit: profile.paymentOptions,
              toChange: 'paymentOptions',
              toEditor: 'paymentNav',
              new: false,
            })
          }
        />
        <Button
          style={styles.signOutButton}
          title={'Sign Out'}
          onPress={() => Auth.signOut()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  signOutButton: {
    marginTop: 50,
    padding: 15,
  },
  picture: {
    width: wp('30'),
    height: wp('30'),
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 11,
    paddingTop: 8,
    paddingBottom: 8,
  },
  cardcontainer: {
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#979797',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
  },
  buttoncontainer: {
    padding: 15,
    paddingBottom: 0,
  },
  check: {
    width: RFValue(30, 580),
    height: RFValue(30, 580),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(15, 580),
    borderWidth: 1,
    borderColor: '#F86D64',
  },
});

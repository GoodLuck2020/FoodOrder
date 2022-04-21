import React, {useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import moment from 'moment';
import md5 from 'md5';

import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Clipboard,
  Linking
} from 'react-native';
import {Icon, ListItem, Text, Card, Button} from 'react-native-elements';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Share from 'react-native-share';
import Modal from 'react-native-modal';
import {RFValue} from 'react-native-responsive-fontsize';
import config from '../config';
import Stripe from 'tipsi-stripe';
import {Auth} from 'aws-amplify';

const Stack = createStackNavigator();



export default function Promotion({route}) {
  return (
    <Stack.Navigator initialRouteName="PromotionDisplay">
      <Stack.Screen
        name="PromotionDisplay"
        component={PromotionScreen}
        initialParams={{
          restaurantList: route.params.restaurants,
          profile: route.params.data,
        }}
        options={{
          headerTitle: 'Promotions',
        }}
      />
      
    </Stack.Navigator>
  );
}


const Restaurant = ({route, navigation}) => {
  return (
    <ScrollView>
      {route.params.restaurantList.map(restaurant => {
        let picture = restaurant.Profile.picture; //might just have them upload one of their pictures
        return (
          <View
            key={
              restaurant.Profile.restaurantInfo.restaurantName +
              '_' +
              restaurant.Profile.id
            }>
            <Card
              image={
                !picture
                  ? require('../assets/chorizo-mozarella-gnocchi-bake-cropped.jpg')
                  : {uri: picture}
              } //TODO: fix invalid prop param
              onPress={() =>
                navigation.navigate('Promotion', {restaurant: restaurant})
              }>
              <Text h4 style={styles.restaurantName}>
                {restaurant.Profile.restaurantInfo.restaurantName}
              </Text>
              <Text style={{paddingBottom: 5}}>
                {/* {restaurant.Profile.restaurantInfo.restaurantType.typeTags
                    .toString()
                    .replaceAll(',', ' · ')} */}
                {/* REPLACED LOGIC FOR ISSUE WITH `.replaceAll` NOT EXISTING AS
                    A STRING FUNCTION FOR OLDER VERSIONS */}
                {restaurant.Profile.restaurantInfo.restaurantType.typeTags.join(
                  ' . ',
                )}
              </Text>
              <Button
                title="Get Promotion"
                buttonStyle={styles.buttonStyle}
                onPress={() => {
                  navigation.navigate('Promotion', {restaurant: restaurant});
                }}
              />
            </Card>
          </View>
        );
      })}
    </ScrollView>
  );
};

const PromotionScreen = ({route}) => {
  return (
    <ScrollView>
      {route.params.restaurantList.map(restaurant => {
        const promotion = restaurant.Promotion
          ? JSON.parse(restaurant.Promotion)
          : [];
        return (
          <>
            {promotion.filter(promo => (new Date(promo.expired)).getTime() >= (new Date()).getTime()).map(item => (
              <PromotionScreenItem
                promotion={item}
                restaurant={restaurant}
                profile={route.params.profile}
              />
            ))}
          </>
        );
      })}
    </ScrollView>
  );
};

function CardContainer({card, defaultCard, onSelect}) {
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
    <View style={styles.cardcontainer}>
      <View style={{flex: 1}}>
        <Text>{card.name}</Text>
        <Text>{cardNumber}</Text>
      </View>
      <TouchableOpacity
        style={styles.check}
        onPress={() => onSelect(card.name)}>
        {defaultCard && (
          <Icon name="check" size={RFValue(20, 580)} color="#F86D64" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const PromotionScreenItem = ({restaurant, promotion, profile}) => {
  const getCode = () => {
    return md5(
      restaurant.Profile.RestaurantId +
        promotion.title +
        promotion.discount +
        profile.CustomerId,
    ).substr(0, 3);
  };

  const [visible, setVisible] = useState(false);

  const [shareVisble, setShareVisible] = useState(false);
  const cards = profile.paymentOptions.cards;
  const [select, setSelect] = useState('');

  const code = getCode();
  console.log('code', code);

  const [copiedText, setCopiedText] = useState('')

  const copyToClipboard = () => {
    Clipboard.setString('FKE-CDE')
    setCopiedText('Code Copied!')
  }


  const payment = () => {
    const card = cards.find(item => item.name === select);
    if (!card) {
      return;
    }

    try {
      Stripe.setOptions({publishableKey: config.pk_test});
      Auth.currentUserInfo().then(info => {
        Stripe.createTokenWithCard({
          number: card.number,
          cvc: card.cvc,
          expMonth: parseInt(card.expiry.split('/')[0]),
          expYear: parseInt(card.expiry.split('/')[1]),
          name: card.name,
        }).then(async tokenInfo => {
          const body = {
            amount: promotion.discount,
            token: tokenInfo.tokenId,
            description:
              info.username +
              ' has purchased ' +
              promotion.title +
              ' promotion on ' +
              restaurant.Profile.restaurantInfo.restaurantName,
          };

          const response = await fetch(
            'https://veml8u1rjb.execute-api.us-west-1.amazonaws.com/beta/payment',
            {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
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
              body: JSON.stringify(body), // body data type must match “Content-Type” header
            },
          );

          let data = await response.json();

          if (data.statusCode === 200) {
            let promotionCode = profile.Promotion ?? [];
            promotionCode.push(code);
            const body = {
              incoming_id: info.username,
              promotion: promotionCode,
            };

            await fetch(
              'https://lgz3liftkl.execute-api.us-west-1.amazonaws.com/default/addPromotion',
              {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
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
                body: JSON.stringify(body), // body data type must match “Content-Type” header
              },
            );

            setVisible(false);
          }
        });
      });
    } catch (e) {}
  };

  console.log(promotion);
  return (
    
    <TouchableOpacity
      key={
        restaurant.Profile.restaurantInfo.restaurantName +
        '_' +
        restaurant.Profile.id
      }
      activeOpacity={1}
      style={{}}
      >
      {/* <Card containerStyle={styles.cardStyle} image={{uri: promotion.picture}}>
        <Text style={styles.restaurantName}>
          {promotion.title}
        </Text>

        <View style={[styles.containerItem,{paddingBottom:5}]}>
          <Text style={styles.subtitleStyle}>
            {restaurant.Profile.restaurantInfo.restaurantName}
          </Text>
          <Text style={styles.subtitleStyle}>
            Exp. {moment(new Date(promotion.expired)).format('YYYY-MM-DD')}
          </Text>
        </View>

        <View style={[styles.containerItem,{paddingBottom:5}]}>
          <Text style={[styles.subtitleStyle,{color: 'red'}]}>
            {promotion.details}
          </Text>
          <Text style={[styles.subtitleStyle,{color: 'red'}]}>
            {profile.Promotion === undefined ||
            profile.Promotion?.indexOf(code) === -1
              ? `$${promotion.discount}`
              : code}
          </Text>
        </View>

        <View style={[styles.containerItem, {marginTop: 10}]}>
          {(profile.Promotion === undefined ||
            profile.Promotion?.indexOf(code) === -1) && (
            <Button
              buttonStyle={styles.buttonStyle}
              title="Claim"
              onPress={() => setVisible(true)}
            />
          )}

          <Button
            buttonStyle={[styles.buttonStyle, {marginLeft: 'auto'}]}
            style={{marginLeft: 'auto'}}
            containerStyle={{marginLeft: 'auto'}}
            title="Share"
            onPress={() =>
              Share.open({
                title:
                  promotion.title +
                  ' on ' +
                  restaurant.Profile.restaurantInfo.restaurantName,
                message: promotion.details,
              })
            }
          />
        </View>
      </Card> */}
      <Card containerStyle={styles.cardStyle}>
       
        <View style={styles.imageStyle}>
          <ImageBackground 
            source={{uri: promotion.picture}}
            resizeMode= 'cover'
            style={[styles.imageStyle, {height: 100}]} // Change resize mode based on requirements
            imageStyle={styles.imageStyle}
          >
          </ImageBackground>
        </View>
        
        
        <View style={{paddingHorizontal:15, paddingTop:5}}>
          <Text style={styles.restaurantName}>
            {promotion.title}
          </Text>
          <View style={[styles.containerItem,{paddingBottom:5}]}>
            <Text style={styles.subtitleStyle}>
              {restaurant.Profile.restaurantInfo.restaurantName}
            </Text>
            <Text style={styles.subtitleStyle}>
              Exp: {moment(new Date(promotion.expired)).format('MM/DD/YYYY')}
            </Text>
          </View>

          <View style={[styles.containerItem,{paddingBottom:5}]}>
            <Text style={[styles.subtitleStyle,{color: '#F1695F',flex:2}]}>
              {promotion.details}
            </Text>
            <Text style={[styles.subtitleStyle,{color: '#F1695F',flex:1, textAlign:'right'}]}>
              {profile.Promotion === undefined ||
              profile.Promotion?.indexOf(code) === -1
                ? `$${promotion.discount} off ${
                  promotion.type == 'order' ? 'the Order!' : promotion.addItems
                }`
                : code}
            </Text>
          </View>
          <View style={[styles.containerItem, {marginTop: 10}]}>
          {(profile.Promotion === undefined ||
            profile.Promotion?.indexOf(code) === -1) && (
            <Button
              buttonStyle={styles.buttonStyle}
              title="Buy"
              onPress={() => setVisible(true)}
            />
          )}

          <Button
            buttonStyle={[styles.buttonStyle, {marginLeft: 'auto'}]}
            style={{marginLeft: 'auto'}}
            containerStyle={{marginLeft: 'auto'}}
            title="Share"
            onPress={() => setShareVisible(true)}
            
          />
        </View>
        </View>
      </Card>
      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        style={{justifyContent: 'flex-end',margin: 0}}>
        <View style={styles.modalInside}>
          <Text style={{textAlign: 'center'}}>
            Promotion Discount Price: ${promotion.discount}
          </Text>
          <Text>{promotion.detail}</Text>
          {cards.map(item => (
            <CardContainer
              card={item}
              key={item.name}
              onSelect={() => setSelect(item.name)}
              defaultCard={item.name === select}
            />
          ))}
          <Button
            buttonStyle={styles.buttonStyle}
            title="Pay Now"
            onPress={payment}
          />
        </View>
      </Modal>
      <Modal
        isVisible={shareVisble}
        onBackdropPress={() => {setShareVisible(false);setCopiedText('')}}
        // onBackdropPress={() => setShareVisible(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View style={[styles.shareModalStyle]}>
          {!promotion.picture
          ?  
            <Text style={{textAlign: 'center', fontSize: 20, paddingTop: 30,fontStyle:'italic',
            }}>{restaurant.Profile.restaurantInfo.restaurantName}</Text>
          :
            <ImageBackground 
            source={{uri: promotion.picture}}
            resizeMode= 'cover'
            style={[styles.imageStyle, {height: 200, padding:2,justifyContent:'flex-end'}]} // Change resize mode based on requirements
            imageStyle={[styles.imageStyle,{opacity:.8}]}
          >
            <Text style={{textAlign: 'right', fontSize: 22, padding: 5, color:'#000000', fontStyle:'italic',
              textShadowColor: 'rgba(255, 255, 255,1)',
              textShadowOffset: {width: 0, height: 0},
              textShadowRadius: 9
              }}>{restaurant.Profile.restaurantInfo.restaurantName}</Text>
          </ImageBackground>
          }
          <View style={{paddingTop: 10}}>
            
            <Text style={{textAlign: 'center', fontSize: 22,padding: 10, fontWeight:'bold'}}>{promotion.title}</Text>
            <Text style={{textAlign: 'center',}}>
              Promotion Discount Price: ${promotion.discount}
            </Text>
            <Text style={{textAlign: 'center'}}>Details: {promotion.details}</Text>
            {cards.map(item => (
              <CardContainer
                card={item}
                key={item.name}
                onSelect={() => setSelect(item.name)}
                defaultCard={item.name === select}
              />
            ))}
          </View>
          <View>
            <Text style={{textAlign: 'center', padding: 10, fontSize: 20, marginTop:30, fontWeight:'bold'}}>Copy your Promo Code</Text>
          </View>
          <View>
          <TouchableOpacity 
              style={{borderWidth:2,borderStyle: 'dotted', borderRadius: 1, borderColor:'#e9e9e9', backgroundColor:'#ffffff', padding:15, marginHorizontal:50}}
              onPress={() => copyToClipboard()}
            >
              <Text>FKE-CDE</Text>
            </TouchableOpacity>
            <Text style={{textAlign: 'center', padding: 10, fontSize: 10,fontStyle: 'italic',color: '#8BBB81'}}>{copiedText}</Text>
          </View>
          <View>
            <Text style={{textAlign: 'center', padding: 10, fontSize: 20, fontWeight:'bold'}}>Share to Others!</Text>
            <View style={{flexDirection: 'row', justifyContent:'center', paddingVertical:20}}>
            <TouchableOpacity 
              style={{borderWidth:2,borderRightWidth:1, borderColor:'#e9e9e9', backgroundColor:'#ffffff', padding:15, borderTopLeftRadius:15, borderBottomLeftRadius:15}}
              onPress={() =>
                Linking.openURL(`http://facebook.com/`)
              }
            >
              <Icon
                name={'social-facebook'}
                size={40}
                color={'#000000'}
                solid={true}
                type={'simple-line-icon'}
                style={{padding:10,}}
              />
              
            </TouchableOpacity>
            <TouchableOpacity 
              style={{borderWidth:2, borderLeftWidth:1, borderRightWidth:1,borderColor:'#e9e9e9', backgroundColor:'#ffffff', padding:15}}
              onPress={() =>
                Linking.openURL(`http://instagram.com/`)
              }
            >
              <Icon
                name={'social-instagram'}
                size={40}
                color={'#000000'}
                solid={true}
                type={'simple-line-icon'}
                style={{padding:10,}}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{borderWidth:2,borderLeftWidth:1, borderColor:'#e9e9e9', backgroundColor:'#ffffff', padding:15, borderTopRightRadius:15, borderBottomRightRadius:15}}
              onPress={() =>
                Share.open({
                  title:
                    promotion.title +
                    ' on ' +
                    restaurant.Profile.restaurantInfo.restaurantName,
                  message: promotion.details,
                })
              }
            >
              <Icon
                name={'options'}
                size={40}
                color={'#000000'}
                solid={true}
                type={'simple-line-icon'}
                style={{padding:10,}}
              />
            </TouchableOpacity>
          </View>
          </View>
          
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareModalStyle:{
    backgroundColor:'#f4f4f4',
    height:'80%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  restaurantName: {
    color: '#111C26',
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical:5,
  },
  subtitleStyle: {
    color: '#888E94',
    fontSize: 14,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 5,
    minWidth: 120,
  },
  orderHeadings: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 24,
    backgroundColor: '#fff',
  },
  promotionItem: {
    backgroundColor: 'white',
    marginBottom: 3,
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
  },
  containerItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalInside: {
    backgroundColor: 'white',
    padding: 5,
    paddingTop: 15,
    paddingBottom: 15,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
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
  cardStyle: {
    backgroundColor: '#ffffff',
    opacity: 1,
    shadowOpacity: 0,
    borderWidth: 0,
    padding:0,
    margin:30,
    borderRadius: 10,
    paddingBottom:15,
  },
  imageStyle: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

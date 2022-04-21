import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ImageBackground
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {ScrollView} from 'react-native-gesture-handler';
import {Text, ListItem, Icon, Card} from 'react-native-elements';
import PromotionEdit from './subcomponents/PromotionEdit';
import {Button} from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import moment from 'moment';

const Stack = createStackNavigator();
export default function Promotion({route}) {
  return (
    <Stack.Navigator initialRouteName="Promotion">
      <Stack.Screen
        name="Promotion"
        component={PromotionScreen}
        initialParams={{
          promotion: route.params.data.Promotion
            ? JSON.parse(route.params.data.Promotion)
            : [],
          needsupdate: false,
        }}
        options={({navigation, route}) => ({
          headerRight: props => (
            <Button
              icon={<Icon name="create" size={15} color="#03a5fc" />}
              title="Create"
              type="clear"
              onPress={() => {
                navigation.navigate('PromotionEdit', {
                  promotion: route.params.promotion,
                });
              }}
            />
          ),
          headerTitleAlign: 'center',
          headerTitleStyle: {},
        })}
      />
      <Stack.Screen
        name="PromotionEdit"
        component={PromotionEdit}
        initialParams={{
          promotion: route.params.data.Promotion
            ? JSON.parse(route.params.data.Promotion)
            : [],
          needsupdate: false,
        }}
        options={({route}) => ({
          title: route.params.item ? 'Edit Promotion' : 'Create Promotion',
          headerTitleAlign: 'center',
        })}
      />
    </Stack.Navigator>
  );
}

function PromotionItem({promotion, navigation, route, index}) {
  console.log(promotion.picture);
  return (
    // <TouchableOpacity
    //   style={styles.promotionItem}
    //   onPress={() =>
    //     navigation.navigate('PromotionEdit', {
    //       item: promotion,
    //       promotion: route.params.promotion,
    //       index: index,
    //     })
    //   }>
    //   <View style={{flex: 1, alignItems: 'center'}}>
    //     <Image
    //       source={{uri: `${promotion.picture}?date=${new Date().getSeconds()}`}}
    //       style={{width: wp('18'), height: wp('20'), borderRadius: 15}}
    //     />
    //   </View>
    //   <View style={{flex: 3}}>
    //     {(!promotion.expired || new Date(promotion.expired) < new Date()) && (
    //       <Text style={{color: '#F86D64', fontWeight: 'bold'}}>Expired</Text>
    //     )}
    //     <View
    //       style={{
    //         marginBottom: 10,
    //       }}>
    //       <Text>{promotion.title}</Text>
    //       <Text>{`${
    //         promotion.from
    //           ? moment(new Date(promotion.from)).format('MM/DD/yyyy')
    //           : ''
    //       } - ${
    //         promotion.expired
    //           ? moment(new Date(promotion.expired)).format('MM/DD/yyyy')
    //           : ''
    //       }`}</Text>
    //     </View>
    //     <Text style={{marginBottom: 10}}>
    //       {`${promotion.discount} on ${
    //         promotion.type == 'order' ? 'ENTIRE ORDER' : 'SPECIFIC ITEMS(1)'
    //       }`}
    //     </Text>
    //     <Text>{promotion.details}</Text>
    //   </View>
    // </TouchableOpacity>
    <TouchableOpacity
    activeOpacity={.4}
    style={{}}
    onPress={() =>
      navigation.navigate('PromotionEdit', {
        item: promotion,
        promotion: route.params.promotion,
        index: index,
      })}
    >
    <Card containerStyle={[styles.cardStyle, (new Date(promotion.expired)).getTime() < (new Date()).getTime() && styles.expiredStyle]}>
        <View style={styles.imageStyle}>
          <ImageBackground 
            source={{uri: `${promotion.picture}?date=${new Date().getSeconds()}`}}
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
          {(!promotion.expired || new Date(promotion.expired) < new Date())
            ? <View style={[styles.containerItem,{paddingBottom:5, justifyContent:'center'}]}>
                <Text style={[styles.subtitleStyle,{color:'black',fontSize:18}]}>Expired</Text>
              </View>
            : <View style={[styles.containerItem,{paddingBottom:5}]}>
                <Text style={styles.subtitleStyle}>
                  Start: {moment(new Date(promotion.from)).format('MM/DD/YYYY')}
                </Text>
                <Text style={styles.subtitleStyle}>
                  Exp: {moment(new Date(promotion.expired)).format('MM/DD/YYYY')}
                </Text>
              </View>  
          }

          <View style={[styles.containerItem,{paddingBottom:5}]}>
            <Text style={[styles.subtitleStyle,{color: '#F1695F',flex:2}]}>
              {promotion.details}
            </Text>
            <Text style={[styles.subtitleStyle,{color: '#F1695F',flex:1, textAlign:'right'}]}>
            ${`${promotion.discount} on ${
              promotion.type == 'order' ? 'the Order!' : promotion.addItems
            }`}
            </Text>
          </View>
        </View>
      </Card>
      </TouchableOpacity>
  );
}

function PromotionScreen({route, navigation}) {
  let activeList = route.params.promotion.filter(promo => (new Date(promo.expired)).getTime() >= (new Date()).getTime());
  let expList = route.params.promotion.filter(promo => (new Date(promo.expired)).getTime() < (new Date()).getTime());
  activeList = activeList.sort((a,b) => (new Date(a.expired)).getTime() >= (new Date(b.expired)).getTime());
  expList = expList.sort((a,b) => (new Date(a.expired)).getTime() < (new Date(b.expired)).getTime());
  
  return (
    <View style={{paddingTop: 14}}>
      <View>
        <FlatList
          data={activeList.concat(expList)}
          renderItem={({item, index}) => (
            <PromotionItem
              promotion={item}
              key={index + ''}
              navigation={navigation}
              route={route}
              index={index}
            />
          )}
          keyExtractor={(item, index) => index + ''}
        />
      
        {/* {route.params.promotion?.map((item, index) => (
          <ListItem
            title={item.title}
            subtitle={item.details}
            leftAvatar={{source: {uri: item.picture + '?date=' + new Date()}}}
            chevron
            topDivider
            onPress={() => {
              navigation.navigate('PromotionEdit', {
                item: item,
                promotion: route.params.promotion,
                index,
              });
            }}
          />
        ))} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  containerItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  subHeader: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    fontStyle: 'italic',
    fontSize: 20,
  },
  expiredStyle: {
    opacity: 0.5,
  }
});

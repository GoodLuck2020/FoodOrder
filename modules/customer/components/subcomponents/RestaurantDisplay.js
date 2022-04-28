import React, {useState, useContext} from 'react';
import {TextContext} from "../TextContext";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {Icon, ListItem, Text, Card, Button} from 'react-native-elements';

export default function RestaurantDisplay({navigation, route}) {
  const textCont = useContext(TextContext);
  let restaurants = [];
  for (const restaurant of route.params.restaurantList) {
    if (restaurant.Profile && restaurant.Profile.restaurantInfo) {
      restaurants.push(restaurant);
    }
  }
  let sortedRestaurants = restaurants.filter(rest => {
    let name = rest.Profile.restaurantInfo.restaurantName;
    return name.toLowerCase().includes(textCont.textVal.toLowerCase());
  })
  .sort((a,b) => {
    let aName = a.Profile.restaurantInfo.restaurantName;
    let bName = b.Profile.restaurantInfo.restaurantName;
    if(aName.toLowerCase().indexOf(textCont.textVal.toLowerCase()) > bName.toLowerCase().indexOf(textCont.textVal.toLowerCase())) {
      return 1;
  } else if (aName.toLowerCase().indexOf(textCont.textVal.toLowerCase()) < bName.toLowerCase().indexOf(textCont.textVal.toLowerCase())) {
      return -1;
  } else {
      if(aName > bName)
          return 1;
      else
          return -1;
  }
  });
  return (
    <TextContext.Provider>
      <ScrollView>
        {sortedRestaurants.map(restaurant => {
          let picture = restaurant.Profile.picture; //might just have them upload one of their pictures
          let promotion = restaurant.Promotion
            ? JSON.parse(restaurant.Promotion)
            : [];
          let todayDate = new Date().getDay();
          let todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.sundayHours.sundayOpen;
          let todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.sundayHours.sundayClosed;

          if (todayDate == 0){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.sundayHours.sundayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.sundayHours.sundayClosed;
          }else if (todayDate == 1){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.mondayHours.mondayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.mondayHours.mondayClosed;
          }else if (todayDate == 2){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.tuesdayHours.tuesdayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.tuesdayHours.tuesdayClosed;
          }else if (todayDate == 3){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.wednesdayHours.wednesdayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.wednesdayHours.wednesdayClosed;
          }else if (todayDate == 4){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.thursdayHours.thursdayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.thursdayHours.thursdayClosed;
          }else if (todayDate == 5){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.fridayHours.fridayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.fridayHours.fridayClosed;
          }else if (todayDate == 6){
            todayOpen = restaurant.Profile.restaurantInfo.hoursOfOperation.saturdayHours.saturdayOpen;
            todayClose = restaurant.Profile.restaurantInfo.hoursOfOperation.saturdayHours.saturdayClosed;
          }

          let openStr = "";
          if ((new Date(todayClose)).getTime() < todayDate){
            openStr = "Closed";
          }else if ((new Date(todayClose)).getTime() < (todayDate - 60*60*1000)){
            openStr = "Closing Soon"
          }else {
            openStr = "Open";
          }

          return (
            <TouchableOpacity
              key={
                restaurant.Profile.restaurantInfo.restaurantName +
                '_' +
                restaurant.Profile.id
              }
              onPress={() => {
                console.log('detail restaurant ====>', restaurant, route.params.profile);
                navigation.navigate('MyOrders', {restaurant: restaurant, profile: route.params.profile})
              }
              }>
              <Card containerStyle={styles.cardStyle}>
                <View style={styles.imageStyle}>
                  <ImageBackground
                    source={
                      !picture
                        ? require('../../assets/chorizo-mozarella-gnocchi-bake-cropped.jpg')
                        : {uri: picture}
                    }
                    resizeMode= 'contain'
                    style={[styles.imageStyle, {height: 120}]} // Change resize mode based on requirements
                    imageStyle={styles.imageStyle}
                  >
                  {promotion.filter(promo => (new Date(promo.expired)).getTime() >= (new Date()).getTime()).length != 0 && (
                    <Icon
                      name={'tag'}
                      size={22}
                      color={'#FB322D'}
                      solid={true}
                      type={'simple-line-icon'}
                      style={{alignSelf:'flex-start', paddingVertical: 10, paddingHorizontal: 10}}
                    />
                    )}
                  </ImageBackground>
                </View>
                <View style={{paddingHorizontal:15, paddingTop:5}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.restaurantName}>
                      {restaurant.Profile.restaurantInfo.restaurantName}
                    </Text>
                    <Text style={styles.restaurantName}>
                      {openStr}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.subtitleStyle}>
                      {/* {restaurant.Profile.restaurantInfo.restaurantType.typeTags
                      .toString()
                      .replaceAll(',', ' · ')} */}
                      {/* REPLACED LOGIC FOR ISSUE WITH `.replaceAll` NOT EXISTING AS
                    A STRING FUNCTION FOR OLDER VERSIONS */}
                      {/* {restaurant.Profile.restaurantInfo.restaurantAddress} */}
                      {typeof restaurant.Profile.restaurantInfo
                        .restaurantAddress === 'object'
                        ? restaurant.Profile.restaurantInfo.restaurantAddress
                            .address
                        : restaurant.Profile.restaurantInfo.restaurantAddress}
                    </Text>
                    <Text style={styles.subtitleStyle}>
                      {todayOpen}{" "}-{" "}
                      {todayClose}
                    </Text>
                  </View>
                </View>

                {/* <Button
                  title="Order"
                  buttonStyle={styles.buttonStyle}
                  onPress={() => {
                    navigation.navigate('MenuDisplay', {restaurant: restaurant});
                  }}
                /> */}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </TextContext.Provider>
  );
}

const styles = StyleSheet.create({
  restaurantName: {
    color: '#111C26',
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical:5,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
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
  subtitleStyle: {
    color: '#888E94',
    fontSize: 14,
  },
});

// const styles = StyleSheet.create({
//   restaurantName: {
//     color: '#111C26',
//     padding: 5,
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   buttonStyle: {
//     backgroundColor: '#F86D64',
//     paddingTop: 15,
//     paddingBottom: 15,
//     borderRadius: 5,
//   },
//   cardStyle: {
//     borderRadius: 10,
//   },
//   imageStyle: {
//     backgroundColor: '#111C26',
//     borderRadius: 10,
//   },
// });

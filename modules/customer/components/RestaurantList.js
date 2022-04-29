import React, {useState, useContext} from 'react';
import {TextContext} from "./TextContext";
import {createStackNavigator} from '@react-navigation/stack';
import RestaurantDisplay from './subcomponents/RestaurantDisplay';
import AddItemToCart from './subcomponents/AddItemToCart';
import MenuDisplay from './subcomponents/MenuDisplay';
import OrderReview from './subcomponents/OrderReview';
import AddressSelect from './subcomponents/AddressSelect';
import {Icon, Button, Text} from 'react-native-elements';
import {Auth} from 'aws-amplify';
import {ScrollView, View, FlatList, TouchableOpacity} from 'react-native';
import Select2 from "react-native-select-two";
import SearchBar from "react-native-dynamic-search-bar";
import MyOrdersScreen from "./subcomponents/MyOrdersScreen";
import CheckoutScreen from "./subcomponents/CheckoutScreen";

const OrderStack = createStackNavigator();
const Stack = createStackNavigator();

export default class RestaurantList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      address: 'g',
      name: '',
      protoUrl: '',
      restaurantList: props.route.params.restaurants,
      profile: props.route.params.data,
    };

    //console.log(JSON.parse(props.route.params.data).userData);
  }

  componentWillMount() {
    Auth.currentUserInfo().then(info => {
      let profile = this.state.profile;
      profile.customerInfo.contactInformation.emailAddress =
        info.attributes.email;
      profile.customerInfo.contactInformation.contactNumber.phoneNumber =
        info.attributes.phone_number;
      this.setState({
        profile,
      });
    });
  }

  render() {
      console.log('restaurant list ====>', this.state.restaurantList);
    return (
        // <View></View>
      <Stack.Navigator
        initialRouteName="OrderStack"
        mode="modal"
        headerMode="none">
        <Stack.Screen
          name="Order Stack"
          component={OrderStackStructure}
          initialParams={{
            restaurantList: this.state.restaurantList,
            profile: this.state.profile,
          }}
          options={({navigation, route}) => ({
            title:
              'Deliver To ' +
              route.params.profile.customerInfo.address?.address,
          })}
        />
        {/* <Stack.Screen
          name="Order Review"
          component={OrderReview}
          options={({navigation, route}) => ({
            title: 'Choose an Item',
            headerBackTitle: 'Go Back',
          })}
        /> */}
        <Stack.Screen
          name="Address Select"
          component={AddressSelect}
          options={({navigation, route}) => ({
            title: '',
            presentation: 'modal',
          })}
        />
      </Stack.Navigator>
    );
  }
}


const mockData = [
  { id: 1, name: "1111 Static Address", checked: true }, // set default checked for render option item
  { id: 2, name: "2222 Static Address" },
  { id: 3, name: "3333 Static Address" }
]


const RestSearchBar = () => {
  const {textVal, textUpdate} = useContext(TextContext)
  return (
    <SearchBar
      placeholder="Search here"
      onChangeText={(text) => textUpdate(text)}
    />
  )
}

const OrderStackStructure = ({navigation, route}) => {
  const [textVal, updateText] = useState("")
  function textUpdate(text) {
    updateText(text)
  }
  return (
    <TextContext.Provider value={{textVal, textUpdate}}>
      <OrderStack.Navigator initialRouteName="RestaurantDisplay">
        <OrderStack.Screen
          name="RestaurantDisplay"
          component={RestaurantDisplay}
          initialParams={{
            restaurantList: route.params.restaurantList,
            profile: route.params.profile,
          }}
          options={() => ({
            headerTitle: (props) => {
              return (
                <View style={{flexDirection: 'row',  alignItems: 'center', justifyContent:'center', marginBottom:20}}>
                  <RestSearchBar/>
                  {/* <SearchBar
                    placeholder="Search here"
                    onPress={() => alert("onPress")}
                    onChangeText={(text) => console.log(text)}
                  /> */}
                  {/* <Icon
                        name={'location-pin'}
                        size={24}
                        color={'#000000'}
                        solid={true}
                        type={'simple-line-icon'}
                        style={{paddingRight: 6}}
                      />
                  <Select2
                    isSelectSingle
                    style={{borderWidth:0, width: 240, borderRadius:25, backgroundColor: '#f0f0f0', marginRight: 30}}
                    selectedTitleStyle={{fontSize: 14}}
                    colorTheme='#F86D64'
                    popupTitle="Select Address for Delivery"
                    title="Select item"
                    cancelButtonText="Cancel"
                    selectButtonText="Confirm"
                    searchPlaceHolderText="Search address or restaurant"
                    data={mockData}
                    onSelect={data => {
                      this.setState({ data })
                    }}
                    onRemoveItem={data => {
                      this.setState({ data })
                    }}
                  /> */}
                  {/* <TouchableOpacity onPress={() => navigation.navigate('Address Select')}>
                    <View style={{width: 240, padding:7, borderRadius:10, marginBottom:10, flexDirection: 'row', backgroundColor: '#f0f0f0'}}>
                      <Icon
                        name={'location-pin'}
                        size={17}
                        color={'#000000'}
                        solid={true}
                        type={'simple-line-icon'}
                        style={{marginRight: 'auto'}}
                      />
                      <View style={{width:'90%'}}>
                        <Text numberOfLines={1} style={{textAlign:'center'}}>{route.params.profile.customerInfo.address?.address}</Text>
                      </View>

                    </View>
                  </TouchableOpacity> */}
                </View>
              );
            }
            // title: route.params.profile.customerInfo.address?.address, //TODO: Populate with actual address
          })}
        />
          <OrderStack.Screen
              name="MyOrders"
              component={MyOrdersScreen}
              options={() => ({
                  title: 'My Orders',
                  headerBackTitle: '',
              })}
          />
          <OrderStack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={({navigation, route}) => ({
                  title: 'Checkout',
                  headerBackTitle: '',
              })}
          />
        <OrderStack.Screen
          name="MenuDisplay"
          component={MenuDisplay}
          options={() => ({
            title: 'Choose an Item',
            headerBackTitle: '',
          })}
        />
        <OrderStack.Screen
          name="Order Review"
          component={OrderReview}
          initialParams={{
            profile: route.params.profile,
          }}
          options={({navigation, route}) => ({
            title: 'Checkout',
            profile: route.params.profile,
            headerBackTitle: '',
          })}
        />
        <OrderStack.Screen
          name="AddItemToCart"
          component={AddItemToCart}
          options={() => ({
            title: 'Customize',
            headerBackTitle: 'Cancel',
          })}
        />
      </OrderStack.Navigator>
    </TextContext.Provider>
  );
};

import React from 'react';
//import {View} from 'react-native';
import Promotion from './components/Promotion';
import MenuUpdater from './components/MenuUpdater';
import Orders from './components/Orders';
import Profile from './components/Profile';
//import Icon from 'react-native-vector-icons/FontAwesome';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabBar from './tabbar'

const Tab = createBottomTabNavigator();
var data;
var orders;
export default class Restaurant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: props.name, protoUrl: '', data: props.data,orders:props.orders};
    data = this.state.data;
    orders = this.state.orders
  }

  render() {
    return <NavigationBar />;
  }
}
//<Tab.Screen name="Analytics" component={Analytics} />
//TODO: Add icons to the nav bar
function NavigationBar() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Orders" component={Orders} initialParams={{data:orders}} />
      <Tab.Screen name="Promotion" component={Promotion} initialParams={{data:data}}/>
      <Tab.Screen
        name="Menu"
        component={MenuUpdater}
        initialParams={{data: data}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        initialParams={{data: data}}
      />
    </Tab.Navigator>
  );
}

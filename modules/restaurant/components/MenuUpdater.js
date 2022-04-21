import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  CheckBox,
  FlatList,
} from 'react-native';
//import {NavigationEvents} from 'react-navigation';
import {createStackNavigator} from '@react-navigation/stack';
import ItemEditor from './subcomponents/MenuEditor/ItemEditor/ItemEditor';
import {Icon, ListItem, Text, Button} from 'react-native-elements';
import testMenu from './subcomponents/testMenu';
import CategoryEditor from './subcomponents/MenuEditor/CategoryEditor/CategoryEditor';
import {Auth} from 'aws-amplify';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Alert} from 'react-native';
//TODO: store menu locally for faster loading
const stage = 'beta';
//This menu variable is for testing, actual menu should be loaded in
var menu = '{}'
//todo: display list https://react-native-elements.github.io/react-native-elements/docs/listitem.html
// use section: ListItem implemented with custom View for Subtitle
const Stack = createStackNavigator();

export default class MenuUpdater extends React.Component {
  constructor(props) {
    super(props);
    //if you need test data
    //menu = menu;
    menu = props.route.params.data.Menu;
    this.state = {menu: menu};
  }

  editMenu = newMenu => {
    this.setState({menu: newMenu});
    //navigation.setparams
    //update in state
    //update in database
  };

  render() {
    return (
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen
          name="Menu"
          component={MenuList}
          initialParams={{
            menu: menu?typeof menu == 'object'?menu:JSON.parse(menu):{},
            needsUpdate: false,
            deleteItem: false,
          }} //make sure that on navigation to menu we check needsUpdate
          options={({navigation, route}) => ({
            headerRight: props => (
              <Button
                icon={<Icon name="create" size={15} color="#03a5fc" />}
                title="Edit"
                style={styles.categoryEditorButton}
                type="clear"
                onPress={() => {
                  let newMenu = JSON.parse(JSON.stringify(route.params.menu));
                  navigation.navigate('CategoryEditor', {
                    menu: route.params.menu,
                    updatedData: newMenu.items ?? [],
                  });
                }}
              />
            ),
            title: 'Menu',
            headerTitleStyle:{
            },
            headerTitleAlign:'center'
          })}
        />
        <Stack.Screen
          name="ItemEditor"
          component={ItemEditor}
          options={({navigation, route}) => ({
            title: route.params.item ? 'Edit Menu Item' : 'Add Menu Item',
            headerStatusBarHeight: 25,
            headerBackTitle: 'Discard Changes',
            headerTitleStyle:{
              fontWeight:'normal'
            }
          })}
        />
        <Stack.Screen
          name="CategoryEditor"
          component={CategoryEditor}
          options={({navigation, route}) => ({
            title: 'Edit Menu',
            headerStatusBarHeight: 25,
            headerTitleAlign: 'center',
            headerTitleStyle:{
              fontWeight:'normal'
            },
            headerLeft: props => (
              <Button
                icon={
                  <Icon
                    name="chevron-thin-left"
                    type="entypo"
                    size={15}
                    color="#03a5fc"
                  />
                }
                title="Back"
                style={styles.categoryEditorButton}
                type="clear"
                onPress={() => {
                  Alert.alert(
                    'Unsaved Changes',
                    'Are you sure you want to cancel the changes made?',
                    [
                      {
                        text: 'Ok',
                        onPress: () => {
                          navigation.goBack();
                        },
                      },
                      {text: 'Cancel'},
                    ],
                  );
                }}
              />
            ),
            headerRight: props => (
              <Button
                icon={<Icon name="create" size={15} color="#03a5fc" />}
                title="Add Item"
                style={styles.categoryEditorButton}
                type="clear"
                onPress={() => {
                  let newMenu = JSON.parse(JSON.stringify(route.params.menu));
                  navigation.navigate('ItemEditor', {
                    menuItems: route.params.updatedData ?? [],
                  });
                }}
              />
            ),
          })}
        />
      </Stack.Navigator>
    );
  }
}

function MenuList({navigation, route}) {
  const items = route.params.menu.items ?? [];

  React.useEffect(() =>
    navigation.addListener('focus', () => {
      if (route.params.needsUpdate) {
        navigation.setParams({
          needsUpdate: false,
        });
        updateMenu(route.params.menu).then(data => {
          console.log(data); // JSON data parsed by `data.json()` call
        });
        //call the api gateway endpoint (eventually with contigo authentication) to update menu
      }
    }),
  );

  return (
    <FlatList
      data={items ?? []}
      renderItem={({item}) => <MenuItem menu={item} />}
      keyExtractor={(item, index) => index + ''}
    />
  );
}

async function updateMenu(newMenu) {
  let info = await Auth.currentUserInfo();
  // Default options are marked with *
  const body = JSON.stringify({
    'restaurant-id': info.username,
    menu: JSON.stringify(newMenu),
  });
  const response = await fetch(
    'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/' +
      stage +
      '/restaurants/updateMenu',
    {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
        //'authToken': authenticationToken,
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: body, // body data type must match "Content-Type" header
    },
  );

  console.log('resdata', response.json());
  //return response.json(); // parses JSON response into native JavaScript objects
}

// const menuListItemDisplay = (item, itemTitle, category, navigation) => {
//   console.log(item);
//   if (item.picture === '') {
//     return (
//       <ListItem
//         title={itemTitle}
//         subtitle={item.itemDescription}
//         bottomDivider
//         chevron
//         onPress={() => {
//           //create deep copy so we arent modifying existing data
//           let newItem = JSON.parse(JSON.stringify(item));
//           navigation.navigate('ItemEditor', {
//             menu: menu,
//             newItem: newItem,
//             item: item,
//             category: category.categoryName,
//             new: false,
//           });
//         }}
//       />
//     );
//   }
//   return (
//     <ListItem
//       title={itemTitle}
//       subtitle={item.itemDescription}
//       leftAvatar={{source: {uri: item.picture + '?date=' + new Date()}}}
//       bottomDivider
//       chevron
//       onPress={() => {
//         //create deep copy so we arent modifying existing data
//         let newItem = JSON.parse(JSON.stringify(item));
//         navigation.navigate('ItemEditor', {
//           menu: menu,
//           newItem: newItem,
//           item: item,
//           category: category.categoryName,
//           new: false,
//         });
//       }}
//     />
//   );
// };

const MenuItem = ({menu, editable, navigation}) => {
  return (
    <TouchableOpacity style={styles.menuItem}>
      {editable && (
        <View>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <CheckBox value={menu.itemAvailable} />
            <Text>UNAVAILABLE</Text>
          </View>
        </View>
      )}
      <Image
        source={{uri: `${menu.picture}?update=${new Date().getSeconds()}`}}
        style={{width: wp('20'), height: wp('20'),borderRadius:15,marginLeft:25,marginRight:25}}
      />
      <View style={{flex:1}}>
        <Text style={styles.item}>{menu.itemName}</Text>
        <Text style={styles.item}>${menu.price}</Text>
        <Text style={styles.item}>{menu.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
  categoryEditorButton: {
    color: '#03a5fc',
  },
  menuListView: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  addCategoryIcon: {
    position: 'absolute',
    right: 0,
  },
  itemcontainer: {
    backgroundColor: 'white',
    borderColor: 'pink',
    borderWidth: 1,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemtitle: {
    color: '#03a5fc',
    fontSize: RFValue(14, 580),
  },
  itemdescription: {
    color: 'black',
  },
  itemprice: {
    color: 'red',
  },
  itempicture: {},
  options: {
    borderColor: 'pink',
    borderWidth: 1,
    flex: 1,
    padding: 10,
    marginLeft: 15,
  },
  optionitem: {
    borderColor: 'pink',
    borderWidth: 1,
    flex: 1,
    padding: 10,
    marginBottom: 10,
  },
  listitem: {
    borderColor: 'black',
    borderWidth: 1,
    flex: 1,
    padding: 5,
    marginBottom: 5,
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 1,
    padding: 5,
  },
  item: {
    fontSize: RFValue(13, 580),
    marginBottom: 5,
    color: 'black',
    alignItems: 'center',
  },
});

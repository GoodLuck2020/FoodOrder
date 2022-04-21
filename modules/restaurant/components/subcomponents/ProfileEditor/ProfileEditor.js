import React from 'react';
import {View, StyleSheet, Alert, ScrollView} from 'react-native';
import {Input, Button, Icon, Text, ListItem} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import {EditTextAttribute} from './AttributeEditor';
import {TimeDropdown} from './TimeDropdown';
import {updateDynamoRestaurant} from './updateDynamoRest';
var toEdit;
var updatedValue = '';

export default class ProfileEditor extends React.Component {
  //TODO: clean up data flow for updating menu in costructor
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.profile = props.route.params.profile;
    // this.currentMenu = route.params.menu;
    // this.itemName = route.params.menu;
    // this.navigation = navigation;
    let newItem = props.route.params.profile;
    //figure out which profile item they want to edit
    toEdit = props.route.params.toEditor;
    this.state = {
      item: newItem,
      toEdit: toEdit,
    };
  }

  updateMenuItem = changedItem => {
    //TODO: select the correct update function for input validation
    // and reflect the changes in component state
    this.setState({
      item: changedItem,
    });
  };

  render() {
    return (
      <>
        {this.state.isNew ? (
          <NewItem
            updateMenuItem={this.updateMenuItem}
            item={this.state.item}
          />
        ) : (
          <ExistingItemView
            //menu={this.state.menu}
            item={this.state.item}
            navigation={this.navigation}
            updateMenuItem={this.updateMenuItem}
          />
        )}
      </>
    );
  }
}

//TODO: finish empty inputs
const NewItem = props => {
  return (
    <ScrollView>
      <Text h4 style={styles.titles}>
        Item Information (* required)
      </Text>
      <Text>Item Name *</Text>
      <Input
        placeholder={`${props.item.itemName}`}
        onChangeText={value => this.updateName({name: value})}
      />
      <Text>Item Price *</Text>
      <Input
        placeholder={`${props.item.itemPrice}`}
        onChangeText={value => this.updatePrice({price: value})}
      />
      <Text>Additional Health Information</Text>
      <Input
        placeholder={`${props.item.additionalHealthInfo}`}
        onChangeText={value => props.updateForm({healthInfo: value})}
      />
      <Text h4 style={styles.titles}>
        Item Options
      </Text>
      {props.item.options.map(option => {
        return (
          <>
            <Text>Option Name</Text>
            <Input
              placeholder={`${option.name}`}
              onChangeText={value => props.updateForm({healthInfo: value})}
            />
          </>
        );
      })}
      <Button
        icon={<Icon name="check" size={15} color="white" />}
        title="Save and Update Menu"
        onPress={() => this.passUp()}
      />
    </ScrollView>
  );
};

const ExistingItemView = props => {
  let EditorStack = createStackNavigator();
  return (
    <EditorStack.Navigator
      mode="modal"
      headerMode="none"
      initialRouteName="Attributes">
      <EditorStack.Screen
        name="Attributes"
        component={Attributes}
        initialParams={{
          item: props.item,
          menu: props.menu,
        }}
        options={{headerShown: false}}
      />
      <EditorStack.Screen
        name="Editor"
        component={EditItem}
        initialParams={{
          item: props.item,
          menu: props.menu,
        }}
      />
      <EditorStack.Screen
        name="Delete Confirmation"
        component={DeleteConfirmation}
        initialParams={{
          item: props.item,
        }}
      />
    </EditorStack.Navigator>
  );
};

function DeleteConfirmation({navigation, route}) {
  return (
    <View style={styles.general}>
      <Icon name="warning" size={30} color="orange" />
      <Text>
        {`Are you sure you want to delete your item: ${route.params.itemName}`}
      </Text>
      <Button
        icon={<Icon name="undo" size={15} color="white" />}
        title="Cancel"
        onPress={() => navigation.goBack()} //TODO: add actual deletion button
      />
    </View>
  );
}

let EditItem = ({navigation, route}) => {
  if (
    route.params.toChange === 'mondayHours' ||
    route.params.toChange === 'tuesdayHours' ||
    route.params.toChange === 'wednesdayHours' ||
    route.params.toChange === 'thursdayHours' ||
    route.params.toChange === 'fridayHours' ||
    route.params.toChange === 'saturdayHours' ||
    route.params.toChange === 'sundayHours'
  ) {
    return (
      <TimeDropdown
        navigation={navigation}
        item={route.params.item}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
        arrayIndex={route.params.arrayIndex}
      />
    );
  } else {
    return (
      <EditTextAttribute
        navigation={navigation}
        item={route.params.item}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
      />
    );
  }
};

//Attribute that will be edited (actual restaurant name saved in data)
var attributeToEdit;
//String that will be used to generate a text title
var attributeString;

function Attributes({navigation, route}) {
  //Toggle drink/food availability
  const toggleAvailablilityDrink = () => {
    route.params.item.restaurantInfo.restaurantType.drink = !route.params.item
      .restaurantInfo.restaurantType.drink;
    navigation.setParams({item: route.params.item});
    updateDynamoRestaurant(route.params.item);
  };
  const toggleAvailablilityFood = () => {
    route.params.item.restaurantInfo.restaurantType.food = !route.params.item
      .restaurantInfo.restaurantType.food;
    navigation.setParams({item: route.params.item});
    updateDynamoRestaurant(route.params.item);
  };

  //conditionals for which attribute they are editing
  if (toEdit === 'restaurantHoursNav') {
    attributeToEdit = route.params.item.restaurantInfo.hoursOfOperation;
    attributeString = 'Hours of Operation';

    return (
      <ScrollView>
        <Text h4 style={styles.titles}>
          {attributeString}
        </Text>
        {attributeToEdit.map((key, index) => {
          //Text for list items
          if (key.mondayHours) {
            var dayText = 'Monday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.mondayHours.openTime} - ${
                key.mondayHours.closedTime
              }`;
            }
          } else if (key.tuesdayHours) {
            var dayText = 'Tuesday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.tuesdayHours.openTime} - ${
                key.tuesdayHours.closedTime
              }`;
            }
          } else if (key.wednesdayHours) {
            var dayText = 'Wednesday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.wednesdayHours.openTime} - ${
                key.wednesdayHours.closedTime
              }`;
            }
          } else if (key.thursdayHours) {
            var dayText = 'Thursday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.thursdayHours.openTime} - ${
                key.thursdayHours.closedTime
              }`;
            }
          } else if (key.fridayHours) {
            var dayText = 'Friday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.fridayHours.openTime} - ${
                key.fridayHours.closedTime
              }`;
            }
          } else if (key.saturdayHours) {
            var dayText = 'Saturday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.saturdayHours.openTime} - ${
                key.saturdayHours.closedTime
              }`;
            }
          } else if (key.sundayHours) {
            var dayText = 'Sunday Hours';
            if (key.openTime === 'CLOSED' || key.closedTime === 'CLOSED') {
              var timesText = 'CLOSED';
            } else {
              var timesText = `${key.sundayHours.openTime} - ${
                key.sundayHours.closedTime
              }`;
            }
          }
          return (
            <ListItem
              key={key + index}
              title={dayText}
              subtitle={timesText}
              bottomDivider
              chevron
              onPress={() => {
                if (key.mondayHours) {
                  var changeKey = 'mondayHours';
                } else if (key.tuesdayHours) {
                  var changeKey = 'tuesdayHours';
                } else if (key.wednesdayHours) {
                  var changeKey = 'wednesdayHours';
                } else if (key.thursdayHours) {
                  var changeKey = 'thursdayHours';
                } else if (key.fridayHours) {
                  var changeKey = 'fridayHours';
                } else if (key.saturdayHours) {
                  var changeKey = 'saturdayHours';
                } else if (key.sundayHours) {
                  var changeKey = 'sundayHours';
                }
                navigation.navigate('Editor', {
                  attribute: attributeString,
                  toChange: changeKey,
                  arrayIndex: index,
                });
              }}
            />
          );
        })}
      </ScrollView>
    );
  } else if (toEdit === 'restaurantTypeNav') {
    attributeToEdit = route.params.item.restaurantInfo.restaurantType.typeTags;
    attributeString = 'Restaurant Tags';

    let foodText;
    let drinkText;
    if (route.params.item.restaurantInfo.restaurantType.food) {
      foodText = 'Available';
    } else {
      foodText = 'Not Available';
    }
    if (route.params.item.restaurantInfo.restaurantType.drink) {
      drinkText = 'Available';
    } else {
      drinkText = 'Not Available';
    }

    return (
      <ScrollView style={{backgroundColor:'white'}}>
        <Text h4 style={styles.titles}>
          {attributeString}
        </Text>
        <View>
          <Input
            inputStyle={styles.input}
            inputContainerStyle={{borderBottomWidth:0}}
            placeholder={'New Tag'}
            onChangeText={value => {
              updatedValue = value;
            }}
            onSubmitEditing={value => {
              if (updatedValue.trim() === '') {
                Alert.alert('Please enter a value');
              } else if (
                !route.params.item.restaurantInfo.restaurantType.typeTags.includes(
                  updatedValue,
                )
              ) {
                route.params.item.restaurantInfo.restaurantType.typeTags.push(
                  updatedValue,
                );
                updateDynamoRestaurant(route.params.item);
                navigation.setParams({
                  item: route.params.item,
                });
              }
              updatedValue = '';
            }}
          />
        </View>
        <ScrollView>
          {route.params.item.restaurantInfo.restaurantType.typeTags.map(tag => {
            return (
              <View key={tag}>
                <ListItem
                  title={tag.toString()}
                  bottomDivider
                  rightIcon={{
                    name: 'delete',
                    onPress: () => {
                      route.params.item.restaurantInfo.restaurantType.typeTags = route.params.item.restaurantInfo.restaurantType.typeTags.filter(
                        e => e !== tag,
                      );
                      updateDynamoRestaurant(route.params.item);
                      navigation.setParams({
                        item: route.params.item,
                      });
                    },
                  }}
                />
              </View>
            );
          })}
        </ScrollView>
        <Button
          title=" Save Changes"
          buttonStyle={styles.saveTags}
          onPress={() => {
            updateDynamoRestaurant(route.params.item);
            navigation.navigate('Profile', {
              item: route.params.item,
            });
          }}
        />
        <Text h4 style={styles.titles}>
          {'Services'}
        </Text>
        <ListItem
          title={'Food: ' + foodText}
          bottomDivider
          switch={{
            value: route.params.item.restaurantInfo.restaurantType.food,
            onChange: () => toggleAvailablilityFood(),
          }}
        />
        <ListItem
          title={'Drink: ' + drinkText}
          bottomDivider
          switch={{
            value: route.params.item.restaurantInfo.restaurantType.drink,
            onChange: () => toggleAvailablilityDrink(),
          }}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
  },
  saveButton: {
    textAlign: 'center',
    padding: 10,
    paddingTop: 20,
  },
  deleteButton: {
    textAlign: 'center',
    padding: 10,
    paddingTop: 10,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
  hours: {
    textAlign: 'center',
    padding: 10,
  },
  statusPicker: {
    borderTopWidth: 3,
    borderTopColor: '#03a5fc',
  },
  orderStatus: {
    textAlign: 'center',
    justifyContent: 'center',
    color: '#313131',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  saveTags: {
    marginTop: 15,
    marginBottom: 25,
    marginLeft:15,
    marginRight:15,
    backgroundColor:'#F86D64',
    paddingTop:15,
    paddingBottom:15,
    borderRadius:5
  },
  input:{
    backgroundColor:'white',
    borderColor:'#979797',
    borderWidth:1,
    borderRadius:8,
    paddingLeft:11,
    paddingTop:8,
    paddingBottom:8
  },
});

import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Button, Text, Icon} from 'react-native-elements';
import {Picker} from '@react-native-community/picker';
var dataType;
var currentDisplay;
var tempProfile;
var profileNav;

export class ItemDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    profileNav = props.navigation;
    tempProfile = props.item;
    dataType = tempProfile.displayItem;
    // if (dataType === '') {
    //   this.state = {
    //     currentDisplay: 'No item selected',
    //     menu: props.menu,
    //   };
    // } else {
    this.state = {
      currentDisplay: dataType.itemName,
      menu: props.menu,
    };
    //}
  }
  render() {
    return (
      <ScrollView>
        <View>
          <Text style={styles.orderStatus}>{'Display Item'}</Text>
          <Picker
            selectedValue={this.state.currentDisplay}
            style={styles.statusPicker}
            onValueChange={itemValue => {
              currentDisplay = itemValue;
              //change dropdown
              this.setState({
                currentDisplay: currentDisplay,
              });
            }}>
            {this.state.menu.categories.map((menuCategories, menuIndex) => {
              return menuCategories.items.map((menuItem, itemIndex) => {
                return (
                  <Picker.Item
                    label={menuItem.itemName}
                    value={menuItem.itemName}
                    key={menuItem + menuCategories + itemIndex}
                  />
                );
              });
            })}

            {/* <Picker.item label={'No item selected'} value={'No item selected'} key={'No item selected'}></Picker.item> */}
          </Picker>
          <Button
            title=" Save Changes"
            icon={<Icon name="check" size={15} color="white" />}
            onPress={() => {
              dataType.itemName = currentDisplay;
              profileNav.navigate('Profile', {
                profile: tempProfile,
              });
            }}
          />
        </View>
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
});

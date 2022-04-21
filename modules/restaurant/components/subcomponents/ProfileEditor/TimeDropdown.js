import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, Icon} from 'react-native-elements';
import {Picker} from '@react-native-community/picker';
import {updateDynamoRestaurant} from './updateDynamoRest';
//dataType for json object restaurantInfo, deliveryOptions, displayItem
var dataType;
//getting both time values for selected day
var openingTime;
var closingTime;
//string used to edit data of specific day
var changeTime;
var tempProfile;

export class TimeDropdown extends React.Component {
  constructor(props) {
    super(props);
    tempProfile = props.item;
    this.navigation = props.navigation;
    dataType =
      tempProfile.restaurantInfo.hoursOfOperation[props.arrayIndex][
        props.toChange
      ];

    let initialDropdown = () => {
      //First check to see if CLOSED and set dropdowns
      if (openingTime === 'CLOSED' || closingTime === 'CLOSED') {
        closingTime = 'CLOSED';
        openingTime === 'CLOSED';
        this.state = {
          openingTime: 'CLOSED',
          closingTime: 'CLOSED',
        };
      } else {
        this.state = {
          openingTime: openingTime,
          closingTime: closingTime,
        };
      }
    };

    if (props.toChange === 'mondayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'monday';
      initialDropdown();
    } else if (props.toChange === 'tuesdayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'tuesday';
      initialDropdown();
    } else if (props.toChange === 'wednesdayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'wednesday';
      initialDropdown();
    } else if (props.toChange === 'thursdayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'thursday';
      initialDropdown();
    } else if (props.toChange === 'fridayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'friday';
      initialDropdown();
    } else if (props.toChange === 'saturdayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'saturday';
      initialDropdown();
    } else if (props.toChange === 'sundayHours') {
      openingTime = dataType.openTime;
      closingTime = dataType.closedTime;
      changeTime = 'sunday';
      initialDropdown();
    }
  }

  render() {
    return (
      <View style={styles.general}>
        <Text style={styles.orderStatus}>
          {'Opening Time | ' + openingTime}
        </Text>
        <Picker
          selectedValue={this.state.openingTime}
          style={styles.statusPicker}
          onValueChange={openValue => {
            if (openingTime !== openValue) {
              //pass value to openTime
              openingTime = openValue;
              //change the value in the dropdown
              this.setState({
                openingTime: openValue,
              });
            }
          }}>
          <Picker.Item label="CLOSED" value="CLOSED" />
          <Picker.Item label="12:00 AM" value="12:00 AM" />
          <Picker.Item label="12:30 AM" value="12:30 AM" />
          <Picker.Item label="1:00 AM" value="1:00 AM" />
          <Picker.Item label="1:30 AM" value="1:30 AM" />
          <Picker.Item label="2:00 AM" value="2:00 AM" />
          <Picker.Item label="2:30 AM" value="2:30 AM" />
          <Picker.Item label="3:00 AM" value="3:00 AM" />
          <Picker.Item label="3:30 AM" value="3:30 AM" />
          <Picker.Item label="4:00 AM" value="4:00 AM" />
          <Picker.Item label="4:30 AM" value="4:30 AM" />
          <Picker.Item label="5:00 AM" value="5:00 AM" />
          <Picker.Item label="5:30 AM" value="5:30 AM" />
          <Picker.Item label="6:00 AM" value="6:00 AM" />
          <Picker.Item label="6:30 AM" value="6:30 AM" />
          <Picker.Item label="7:00 AM" value="7:00 AM" />
          <Picker.Item label="7:30 AM" value="7:30 AM" />
          <Picker.Item label="8:00 AM" value="8:00 AM" />
          <Picker.Item label="8:30 AM" value="8:30 AM" />
          <Picker.Item label="9:00 AM" value="9:00 AM" />
          <Picker.Item label="9:30 AM" value="9:30 AM" />
          <Picker.Item label="10:00 AM" value="10:00 AM" />
          <Picker.Item label="10:30 AM" value="10:30 AM" />
          <Picker.Item label="11:00 AM" value="11:00 AM" />
          <Picker.Item label="11:30 AM" value="11:30 AM" />
          <Picker.Item label="12:00 PM" value="12:00 PM" />
          <Picker.Item label="12:30 PM" value="12:30 PM" />
          <Picker.Item label="1:00 PM" value="1:00 PM" />
          <Picker.Item label="1:30 PM" value="1:30 PM" />
          <Picker.Item label="2:00 PM" value="2:00 PM" />
          <Picker.Item label="2:30 PM" value="2:30 PM" />
          <Picker.Item label="3:00 PM" value="3:00 PM" />
          <Picker.Item label="3:30 PM" value="3:30 PM" />
          <Picker.Item label="4:00 PM" value="4:00 PM" />
          <Picker.Item label="4:30 PM" value="4:30 PM" />
          <Picker.Item label="5:00 PM" value="5:00 PM" />
          <Picker.Item label="5:30 PM" value="5:30 PM" />
          <Picker.Item label="6:00 PM" value="6:00 PM" />
          <Picker.Item label="6:30 PM" value="6:30 PM" />
          <Picker.Item label="7:00 PM" value="7:00 PM" />
          <Picker.Item label="7:30 PM" value="7:30 PM" />
          <Picker.Item label="8:00 PM" value="8:00 PM" />
          <Picker.Item label="8:30 PM" value="8:30 PM" />
          <Picker.Item label="9:00 PM" value="9:00 PM" />
          <Picker.Item label="9:30 PM" value="9:30 PM" />
          <Picker.Item label="10:00 PM" value="10:00 PM" />
          <Picker.Item label="10:30 PM" value="10:30 PM" />
          <Picker.Item label="11:00 PM" value="11:00 PM" />
          <Picker.Item label="11:30 PM" value="11:30 PM" />
        </Picker>
        <Text style={styles.orderStatus}>
          {'Closing Time | ' + closingTime}
        </Text>
        <Picker
          selectedValue={this.state.closingTime}
          style={styles.statusPicker}
          onValueChange={closeValue => {
            if (closingTime !== closeValue) {
              //pass value to openTime
              closingTime = closeValue;
              if (openingTime === 'CLOSED' || closingTime === 'CLOSED') {
                closingTime = 'CLOSED';
                openingTime = 'CLOSED';
                this.setState({
                  openingTime: 'CLOSED',
                  closingTime: 'CLOSED',
                });
              } else {
                //change the value in the dropdown
                this.setState({
                  closingTime: closeValue,
                });
              }
            }
          }}>
          <Picker.Item label="CLOSED" value="CLOSED" />
          <Picker.Item label="12:00 AM" value="12:00 AM" />
          <Picker.Item label="12:30 AM" value="12:30 AM" />
          <Picker.Item label="1:00 AM" value="1:00 AM" />
          <Picker.Item label="1:30 AM" value="1:30 AM" />
          <Picker.Item label="2:00 AM" value="2:00 AM" />
          <Picker.Item label="2:30 AM" value="2:30 AM" />
          <Picker.Item label="3:00 AM" value="3:00 AM" />
          <Picker.Item label="3:30 AM" value="3:30 AM" />
          <Picker.Item label="4:00 AM" value="4:00 AM" />
          <Picker.Item label="4:30 AM" value="4:30 AM" />
          <Picker.Item label="5:00 AM" value="5:00 AM" />
          <Picker.Item label="5:30 AM" value="5:30 AM" />
          <Picker.Item label="6:00 AM" value="6:00 AM" />
          <Picker.Item label="6:30 AM" value="6:30 AM" />
          <Picker.Item label="7:00 AM" value="7:00 AM" />
          <Picker.Item label="7:30 AM" value="7:30 AM" />
          <Picker.Item label="8:00 AM" value="8:00 AM" />
          <Picker.Item label="8:30 AM" value="8:30 AM" />
          <Picker.Item label="9:00 AM" value="9:00 AM" />
          <Picker.Item label="9:30 AM" value="9:30 AM" />
          <Picker.Item label="10:00 AM" value="10:00 AM" />
          <Picker.Item label="10:30 AM" value="10:30 AM" />
          <Picker.Item label="11:00 AM" value="11:00 AM" />
          <Picker.Item label="11:30 AM" value="11:30 AM" />
          <Picker.Item label="12:00 PM" value="12:00 PM" />
          <Picker.Item label="12:30 PM" value="12:30 PM" />
          <Picker.Item label="1:00 PM" value="1:00 PM" />
          <Picker.Item label="1:30 PM" value="1:30 PM" />
          <Picker.Item label="2:00 PM" value="2:00 PM" />
          <Picker.Item label="2:30 PM" value="2:30 PM" />
          <Picker.Item label="3:00 PM" value="3:00 PM" />
          <Picker.Item label="3:30 PM" value="3:30 PM" />
          <Picker.Item label="4:00 PM" value="4:00 PM" />
          <Picker.Item label="4:30 PM" value="4:30 PM" />
          <Picker.Item label="5:00 PM" value="5:00 PM" />
          <Picker.Item label="5:30 PM" value="5:30 PM" />
          <Picker.Item label="6:00 PM" value="6:00 PM" />
          <Picker.Item label="6:30 PM" value="6:30 PM" />
          <Picker.Item label="7:00 PM" value="7:00 PM" />
          <Picker.Item label="7:30 PM" value="7:30 PM" />
          <Picker.Item label="8:00 PM" value="8:00 PM" />
          <Picker.Item label="8:30 PM" value="8:30 PM" />
          <Picker.Item label="9:00 PM" value="9:00 PM" />
          <Picker.Item label="9:30 PM" value="9:30 PM" />
          <Picker.Item label="10:00 PM" value="10:00 PM" />
          <Picker.Item label="10:30 PM" value="10:30 PM" />
          <Picker.Item label="11:00 PM" value="11:00 PM" />
          <Picker.Item label="11:30 PM" value="11:30 PM" />
        </Picker>
        <Button
          title=" Save Changes"
          icon={<Icon name="check" size={15} color="white" />}
          onPress={() => {
            if (changeTime === 'monday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            } else if (changeTime === 'tuesday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            } else if (changeTime === 'wednesday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            } else if (changeTime === 'thursday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            } else if (changeTime === 'friday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            } else if (changeTime === 'saturday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            } else if (changeTime === 'sunday') {
              dataType.openTime = openingTime;
              dataType.closedTime = closingTime;
            }
            updateDynamoRestaurant(tempProfile);
            this.navigation.navigate('Profile', {
              profile: tempProfile,
            });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
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
  statusPicker: {
    borderTopWidth: 3,
    borderTopColor: '#03a5fc',
  },
});

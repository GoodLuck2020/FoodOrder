import {View, StyleSheet} from 'react-native';
import {Button, Text} from 'react-native-elements';
import React from 'react';
import {Picker} from '@react-native-picker/picker';


export default function AddressSelect(props) {
  let addressPickerOptions = getAddressPickerOptions();
  return (
    <>
      <View style={styles.optionListView}>
        <Text h4 style={styles.titles}>
          {'Select Address for Delivery'}
        </Text>
      </View>
      <>
        <View>
          <Picker
            selectedValue={3}
            style={styles.statusPicker}
            onValueChange={(itemValue, itemIndex) => {
              this.selectedValue = 4;
              // props.address = itemValue;
              // props.navigation.setParams({address: props.option});
            }}>
            {addressPickerOptions.map(picker => {
              return picker;
            })}
          </Picker>
        
          <Button
            title="Confirm"
            style={styles.confirmButton}
            onPress={() => {
              props.navigation.setParams({
                address: props.address,
              });
              props.navigation.goBack(); //TODO: actually get data and pass it back
            }}
          />
        </View>
      </>
    </>
  );
}

const getAddressPickerOptions = () => { //TODO: actually get data from jasons feature
  return [
    <Picker.Item
      label={'1'.toString()}
      value={1}
      key={'min_picker_' + 1}
    />,
    <Picker.Item
      label={'2'.toString()}
      value={2}
      key={'min_picker_' + 2}
    />,
    <Picker.Item
      label={'3'.toString()}
      value={3}
      key={'min_picker_' + 3}
    />,
    <Picker.Item
      label={'4'.toString()}
      value={4}
      key={'min_picker_' + 4}
    />,
    <Picker.Item
      label={'5'.toString()}
      value={5}
      key={'min_picker_' + 5}
    />,
    <Picker.Item
      label={'6'.toString()}
      value={6}
      key={'min_picker_' + 6}
    />,
  ];
};

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOptionButton: {
    paddingBottom: 20,
  },
  optionListView: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 30,
  },
  dropDownIcon: {
    position: 'absolute',
    right: 0,
  },
  deleteOptionIcon: {
    position: 'absolute',
    left: 0,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    paddingTop: 30,
  },
  confirmButton: {
    width: 240,
    alignSelf: 'center',
    borderRadius:30,
    backgroundColor: 'black',
  }
});

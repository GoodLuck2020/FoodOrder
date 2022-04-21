import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {Input, Button, Icon, Text, ListItem} from 'react-native-elements';
import React from 'react';
import {isValidPrice} from './AttributeValidator';
import {isUniqueOption} from '../MenuUtilities';
// import {Picker} from '@react-native-community/picker';

export function EditOptions(props) {
  return (
    <>
      {titleEditor(props)}
      {minMaxEditor(props)}
      {optionListEditor(props)}
    </>
  );
}

export function EditNewOptionName(props) {
  let updatedValue = '';
  const validateAndSubmit = () => {
    if (updatedValue.trim() === '') {
      Alert.alert('Please enter a value');
    } else if (props.item[props.toChange] !== updatedValue) {
      props.item[props.toChange] = updatedValue;
      props.navigation.navigate('Attributes', {
        item: props.item,
      });
    } else {
      props.navigation.goBack();
    }
  };
  return (
    <>
      <View style={styles.general}>
        <Input
          style={styles.tagCancelButton}
          label={props.attribute}
          multiline
          placeholder={`${props.item[props.toChange]}`}
          onChangeText={value => {
            updatedValue = value;
          }}
          onSubmitEditing={value => validateAndSubmit()}
        />
        <Button
          style={styles.navButtons}
          icon={<Icon name="undo" size={15} color="white" />}
          title="Cancel"
          onPress={() => props.navigation.goBack()}
        />
      </View>
      <Button
        style={styles.navButtons}
        icon={<Icon name="check" size={15} color="white" />}
        title="Save"
        onPress={() => validateAndSubmit()}
      />
    </>
  );
}

const titleEditor = props => {
  let updatedTitle = '';
  return (
    <>
      <View style={styles.optionListView}>
        <Text h4 style={styles.titles}>
          {props.attribute}
        </Text>
        <Icon
          raised
          containerStyle={styles.dropDownIcon}
          size={16}
          name="expand-more"
          color="#000000"
          underlayColor="#dedede"
          onPress={() => {
            props.navigation.setParams({
              editOptionTitle: !props.editOptionTitle,
            });
          }}
        />
      </View>
      {props.editOptionTitle ? (
        <Input
          label={'Option Title'}
          placeholder={props.attribute}
          onChangeText={value => {
            updatedTitle = value;
          }}
          onSubmitEditing={value => {
            props.option.optionTitle = updatedTitle;
            props.navigation.setParams({
              option: props.option,
              attribute: updatedTitle,
            });
            updatedTitle = '';
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};

const minMaxEditor = props => {
  let minimumPickerOptions = minPickerItems(props.option);
  let maximumPickerOptions = maxPickerItems(props.option);
  const isValidMinMax = () => {
    if (
      props.option.minimum < 0 ||
      props.option.maximum < props.option.minimum ||
      props.option.maximum > props.option.optionList.length
    ) {
      Alert.alert(
        'Invalid Min and Max',
        'Please enter a valid minimum and maxumum combination.',
      );
      return false;
    }
    return true;
  };

  //props.navigation.setParams();
  return (
    <>
      <View style={styles.optionListView}>
        <Text h4 style={styles.titles}>
          {`Selectable Options\n Minimum: ${props.option.minimum.toString()}  Maximum: ${props.option.maximum.toString()}`}
        </Text>
        <Icon
          raised
          containerStyle={styles.dropDownIcon}
          size={16}
          name="expand-more"
          color="#000000"
          underlayColor="#dedede"
          onPress={() => {
            props.navigation.setParams({
              editOptionMinMax: !props.editOptionMinMax,
            });
          }}
        />
      </View>
      {props.editOptionMinMax ? (
        <>
          <View>
            <Text style={styles.titles}>Minumum</Text>
            {/* <Picker
              selectedValue={props.option.minimum}
              style={styles.statusPicker}
              onValueChange={(itemValue, itemIndex) => {
                props.option.minimum = itemValue;
                props.navigation.setParams({option: props.option});
              }}>
              {minimumPickerOptions.map(picker => {
                return picker;
              })}
            </Picker>
            <Text style={styles.titles}>Maximum</Text>
            <Picker
              selectedValue={props.option.maximum}
              style={styles.statusPicker}
              onValueChange={(itemValue, itemIndex) => {
                props.option.maximum = itemValue;
                props.navigation.setParams({option: props.option});
              }}>
              {maximumPickerOptions.map(picker => {
                return picker;
              })}
            </Picker> */}
            <Button
              title="Confirm"
              onPress={() => {
                if (isValidMinMax()) {
                  props.navigation.setParams({
                    editOptionMinMax: !props.editOptionMinMax,
                  });
                }
              }}
            />
          </View>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

const minPickerItems = option => {
  let minPicker = [];
  for (let i = 0; i <= option.optionList.length; i++) {
    minPicker.push(
      <Picker.Item label={i.toString()} value={i} key={'min_picker_' + i} />,
    );
  }
  return minPicker;
};

const maxPickerItems = option => {
  let maxPicker = [];
  for (let i = 0; i <= option.optionList.length; i++) {
    maxPicker.push(
      <Picker.Item label={i.toString()} value={i} key={'max_picker_' + i} />,
    );
  }
  return maxPicker;
};

const optionListEditor = props => {
  let newOption = '';
  let newOptionPrice = '0';
  return (
    <>
      <View style={styles.optionListView}>
        <Text h4 style={styles.titles}>
          {'Option List'}
        </Text>
        <Icon
          raised
          containerStyle={styles.dropDownIcon}
          size={16}
          name="create"
          color="#000000"
          underlayColor="#dedede"
          onPress={() => {
            props.navigation.setParams({
              editOptionList: !props.editOptionList,
            });
          }}
        />
      </View>
      {props.editOptionList ? (
        <>
          <Input
            label={'Option Name'}
            placeholder={'New Option'}
            onChangeText={value => {
              newOption = value;
            }}
          />
          <Input
            label={'Option Price ($)'}
            placeholder={'0'}
            onChangeText={value => {
              newOptionPrice = value;
            }}
          />
          <Button
            icon={<Icon name="add" size={15} color="white" />}
            style={styles.addOptionButton}
            title="Add Option"
            onPress={() => {
              //TODO: make sure option name is unique
              if (newOption.trim() === '') {
                Alert.alert('Please enter a new name');
                return;
              }
              try {
                if (isValidPrice(newOptionPrice)) {
                  newOptionPrice = parseFloat(
                    newOptionPrice.replace('$', '').replace(' ', ''),
                  );
                  if (isUniqueOption(newOption, props.option.optionList)) {
                    props.option.optionList.push({
                      optionName: newOption,
                      optionPrice: newOptionPrice,
                    });
                    //increment max if it is at 0 and we added our first option
                    if (
                      props.option.optionList.length === 1 &&
                      props.option.maximum === 0
                    ) {
                      props.option.maximum = 1;
                    }
                    props.navigation.setParams({
                      option: props.option,
                    });
                  }
                } else {
                  Alert.alert('Please enter a valid price');
                }
              } catch (e) {
                props.navigation.goBack();
              }
            }}
          />
          <ScrollView>
            {props.option.optionList.map(option => {
              return (
                <View
                  key={
                    props.item.itemName +
                    '_option_' +
                    props.option.optionTitle +
                    '_' +
                    option.optionName
                  }>
                  <ListItem
                    title={option.optionName}
                    subtitle={`$${option.optionPrice}`}
                    rightIcon={{name: 'delete'}}
                    bottomDivider
                    onPress={() => {
                      //remove this option from the list
                      props.option.optionList = props.option.optionList.filter(
                        e => e.optionName !== option.optionName,
                      );
                      //adjust maximum based on list size
                      if (
                        props.option.maximum > props.option.optionList.length
                      ) {
                        props.option.maximum = props.option.optionList.length;
                        if (props.option.minimum > props.option.maximum) {
                          props.option.minimum = props.option.maximum;
                        }
                      }
                      props.navigation.setParams({option: props.option});
                    }}
                  />
                </View>
              );
            })}
          </ScrollView>
        </>
      ) : (
        <>
          <ScrollView>
            {props.option.optionList.map(option => {
              return (
                <View
                  key={
                    props.item.itemName +
                    '_option_' +
                    props.option.optionTitle +
                    '_' +
                    option.optionName
                  }>
                  <ListItem
                    title={option.optionName}
                    subtitle={`$${option.optionPrice}`}
                    bottomDivider
                  />
                </View>
              );
            })}
            <Button
              icon={
                <Icon
                  name="delete"
                  raised
                  containerStyle={styles.deleteOptionIcon}
                  reverse
                  size={18}
                  color="#ff0000"
                />
              }
              style={styles.deleteButton}
              title="Delete"
              buttonStyle={{
                backgroundColor: '#ff0000',
                padding: 0,
                marginTop: 15,
              }}
              onPress={() => {
                props.navigation.navigate('Delete Confirmation', {
                  deleteType: 'option',
                  option: props.option,
                  item: props.item,
                });
              }}
            />
          </ScrollView>
        </>
      )}
      <Button
        icon={<Icon name="check" size={15} color="white" />}
        title="Save"
        style={styles.tagCancelButton}
        onPress={() =>
          props.navigation.navigate('Attributes', {
            item: props.item,
          })
        }
      />
    </>
  );
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
  },
  dropDownIcon: {
    position: 'absolute',
    right: 0,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
});

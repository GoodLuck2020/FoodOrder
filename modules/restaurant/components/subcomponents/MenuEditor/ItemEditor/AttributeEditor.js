import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {Input, Button, Icon, Text, ListItem} from 'react-native-elements';
import {isValidPrice, isValidTax} from './AttributeValidator';
import {isUniqueItemName} from '../MenuUtilities';
import React from 'react';

export function EditTextAttribute(props) {
  let updatedValue = '';
  const validateAndSubmit = () => {
    if (props.item[props.toChange] !== updatedValue) {
      //check for unique itemName within the category
      if (props.toChange === 'itemName') {
        if (updatedValue.trim() === '') {
          Alert.alert('Please enter a name');
        } else if (
          !isUniqueItemName(updatedValue, props.menu, props.category)
        ) {
          Alert.alert(
            `Please enter a unique item name for the ${
              props.category
            } category.`,
          );
          return;
        }
      }
      props.item[props.toChange] = updatedValue;
      props.navigation.navigate('Attributes', {
        item: props.item,
      });
    } else {
      props.navigation.goBack();
    }
    updatedValue = '';
  };
  return (
    <>
      <View style={styles.general}>
        <Input
          style={styles.cancelButton}
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

export function EditTags(props) {
  let updatedValue = '';
  return (
    <>
      <View>
        <Text h4 style={styles.titles}>
          Add Tags
        </Text>
        <Input
          label={props.attribute}
          placeholder={'New Tag'}
          onChangeText={value => {
            updatedValue = value;
          }}
          onSubmitEditing={value => {
            if (updatedValue.trim() === '') {
              Alert.alert('Please enter a value');
            } else if (!props.item.typeTags.includes(updatedValue)) {
              props.item.typeTags.push(updatedValue);
              props.navigation.setParams({
                item: props.item,
              });
            }
            updatedValue = '';
          }}
        />
      </View>
      <ScrollView>
        {props.item.typeTags.map(tag => {
          return (
            <View key={props.item.itemName + '_' + tag}>
              <ListItem
                title={tag.toString()}
                bottomDivider
                rightIcon={{name: 'delete'}}
                onPress={() => {
                  //remove this tag from the list
                  props.item.typeTags = props.item.typeTags.filter(
                    e => e !== tag,
                  );
                  props.navigation.setParams({
                    item: props.item,
                  });
                }}
              />
            </View>
          );
        })}
      </ScrollView>
      <Button
        icon={<Icon name="check" size={15} color="white" />}
        style={styles.tagCancelButton}
        title="Save"
        onPress={() =>
          props.navigation.navigate('Attributes', {
            item: props.item,
          })
        }
      />
    </>
  );
}

export function EditNumberAttribute(props) {
  let updatedValue = '';
  const validateAndSubmit = () => {
    if (props.toChange === 'itemPrice') {
      if (isValidPrice(updatedValue)) {
        updatedValue = parseFloat(
          updatedValue.replace('$', '').replace(' ', ''),
        );
        if (props.item[props.toChange] !== updatedValue) {
          props.item[props.toChange] = updatedValue;
          props.navigation.navigate('Attributes', {
            item: props.item,
          });
        }
      } else {
        Alert.alert('Please enter a valid price');
      }
    } else if (props.toChange === 'cityTax') {
      if (isValidTax(updatedValue)) {
        updatedValue = parseFloat(
          (updatedValue = updatedValue.replace('%', '').replace(' ', '')),
        );
        if (props.item[props.toChange] !== updatedValue) {
          props.item[props.toChange] = updatedValue;
          props.navigation.navigate('Attributes', {
            item: props.item,
          });
        }
      } else {
        Alert.alert('Please enter a valid tax percent between 0 and 99');
      }
    }
  };
  return (
    <>
      <View style={styles.general}>
        <Input
          label={props.attribute}
          placeholder={`${props.item[props.toChange]}`}
          onChangeText={value => {
            updatedValue = value;
          }}
          onSubmitEditing={value => validateAndSubmit()}
        />
        <Button
          icon={<Icon name="undo" size={15} color="white" />}
          title="Cancel"
          onPress={() => props.navigation.goBack()}
        />
      </View>
      <Button
        icon={<Icon name="check" size={15} color="white" />}
        title="Save"
        onPress={() => validateAndSubmit()}
      />
    </>
  );
}

export function SelectNewCategory(props) {
  return (
    <>
      <ScrollView>
        <Text h4 style={styles.titles}>
          Choose New Category
        </Text>
        {props.menu.categories.map(category => {
          return (
            <View
              key={'new_category_selection_display_' + category.categoryName}>
              <ListItem
                title={category.categoryName}
                bottomDivider
                onPress={() => {
                  if (
                    isUniqueItemName(
                      props.item.itemName,
                      props.menu,
                      category.categoryName,
                    )
                  ) {
                    props.navigation.navigate('Attributes', {
                      newCategory: category.categoryName,
                    });
                  } else {
                    Alert.alert(
                      'Item Already Exists',
                      `An item exists in the category "${
                        category.categoryName
                      }" with the same name as this item. Try changing this item name or removing the other item.`,
                    );
                  }
                }}
              />
            </View>
          );
        })}
        <View style={styles.general}>
          <Button
            icon={<Icon name="undo" size={15} color="white" />}
            title="Cancel"
            style={styles.cancelButton}
            onPress={() => props.navigation.goBack()}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingTop: 30,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
});

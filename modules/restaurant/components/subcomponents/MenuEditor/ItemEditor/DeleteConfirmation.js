import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Icon, Text} from 'react-native-elements';
import {removeItemFromCategory} from '../MenuUtilities';

export function DeleteConfirmation({navigation, route}) {
  return (
    <>
      <View style={styles.general}>
        <Icon name="warning" size={30} color="orange" />
        <Text>{deleteWarningMessage(route.params)}</Text>
        <Button
          icon={<Icon name="undo" size={15} color="white" />}
          title="Cancel"
          onPress={() => navigation.goBack()}
        />
      </View>
      <Button
        icon={<Icon name="delete" size={15} color="white" />}
        title="Delete It"
        style={styles.deleteButton}
        onPress={() => {
          if (route.params.deleteType === 'item') {
            removeItemFromCategory(
              route.params.uneditedItemName,
              route.params.categoryName,
              route.params.menu,
            );
            navigation.navigate('Menu', {
              needsUpdate: true,
              menu: route.params.menu,
            });
          } else if (route.params.deleteType === 'option') {
            route.params.item.options = route.params.item.options.filter(
              e => e.optionTitle !== route.params.option.optionTitle,
            );
            navigation.navigate('Attributes', {
              item: route.params.item,
            });
          }
        }}
      />
    </>
  );
}

const deleteWarningMessage = params => {
  if (params.deleteType === 'option') {
    return `Are you sure you want to delete your option: ${
      params.option.optionTitle
    }`;
  } else if (params.deleteType === 'item') {
    return `Are you sure you want to delete your item: ${params.itemName}`;
  }
  return '';
};

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    textAlign: 'center',
    padding: 20,
    paddingTop: 10,
  },
  optionListView: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  addOptionIcon: {
    position: 'absolute',
    right: 0,
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
});

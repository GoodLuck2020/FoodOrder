import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Button, Icon, Text, ListItem} from 'react-native-elements';
import {
  hasChangedCategory,
  addItemToCategory,
  removeItemFromCategory,
} from '../MenuUtilities';

export default function Attributes({navigation, route}) {
  
  const toggleAvailablility = () => {
    route.params.item.available = !route.params.item.available;
    navigation.setParams({item: route.params.item});
  };
  return (
    <ScrollView>
      <ListItem
        title={'Available'}
        switch={{
          value: route.params.item.available,
          onChange: () => toggleAvailablility(),
        }}
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'Item Tags',
            toChange: 'typeTags',
          })
        }
      />
      <Text h4 style={styles.titles}>
        Item Information
      </Text>
      <ListItem
        title={'Name'}
        subtitle={route.params.item.itemName}
        bottomDivider
        chevron
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'Item Name',
            toChange: 'itemName',
          })
        }
      />
      <ListItem
        title={'Price'}
        subtitle={`$${route.params.item.itemPrice}`}
        bottomDivider
        chevron
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'Item Price ($)',
            toChange: 'itemPrice',
          })
        }
      />
      <ListItem
        title={'Item Description'}
        subtitle={route.params.item.itemDescription}
        bottomDivider
        chevron
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'Item Description',
            toChange: 'itemDescription',
          })
        }
      />
      <ListItem
        title={'Additional Health Information'}
        subtitle={route.params.item.additionalHealthInfo}
        bottomDivider
        chevron
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'Additional Health Information',
            toChange: 'additionalHealthInfo',
          })
        }
      />
      <ListItem
        title={'City Tax'}
        subtitle={`${route.params.item.cityTax}%`}
        bottomDivider
        chevron
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'City Tax (%)',
            toChange: 'cityTax',
          })
        }
      />
      <ListItem
        title={'Item Tags'}
        badge={{
          value: route.params.item.typeTags.length,
          textStyle: {color: 'white'},
          containerStyle: {marginTop: 0},
        }}
        bottomDivider
        chevron
        onPress={() =>
          navigation.navigate('Editor', {
            item: route.params.item,
            attribute: 'Item Tags',
            toChange: 'typeTags',
          })
        }
      />
      <ListItem
        title={'Picture'}
        bottomDivider
        chevron
        onPress={() => {
          navigation.navigate('PhotoSelector', {item: route.params.item});
        }}
      />
      <View style={styles.optionListView}>
        <Text h4 style={styles.titles}>
          Item Options
        </Text>
        <Icon
          raised
          containerStyle={styles.addOptionIcon}
          size={16}
          name="add"
          color="#000000"
          underlayColor="#dedede"
          onPress={() => {
            // TODO: fix this thing
            route.params.item.options.push({
              optionTitle: `Edit Me!${Math.floor(
                Math.random() * 10000,
              ).toString()}`,
              optionList: [
                {
                  optionName: 'option name',
                  optionPrice: 0.0,
                },
              ],
              minimum: 0,
              maximum: 1,
            });
            navigation.setParams({item: route.params.item});
          }}
        />
      </View>
      {route.params.item.options.map(option => {
        return (
          <View key={option.optionTitle + '_' + option.optionList.toString()}>
            <ListItem
              title={option.optionTitle}
              bottomDivider
              chevron
              onPress={() =>
                navigation.navigate('Editor', {
                  item: route.params.item,
                  attribute: option.optionTitle,
                  option: option,
                  toChange: 'options',
                  editOptionTitle: false,
                  editOptionList: false,
                  editOptionMinMax: false,
                })
              }
            />
          </View>
        );
      })}
      <Button
        icon={
          <Icon name="cloud-upload" type="ionicons" size={25} color="white" />
        }
        title=" Save and Update Menu"
        onPress={() => {
          updateOldItem(route.params.oldItem, route.params.item);
          if (
            hasChangedCategory(route.params.category, route.params.newCategory)
          ) {
            addItemToCategory(
              route.params.oldItem,
              route.params.newCategory,
              route.params.menu,
            );
            removeItemFromCategory(
              route.params.oldItem.itemName,
              route.params.category,
              route.params.menu,
            );
            navigation.setParams({menu: route.params.menu});
          }
          //if the item is new, add it to the category
          else if (route.params.isNew) {
            addItemToCategory(
              route.params.oldItem,
              route.params.category,
              route.params.menu,
            );
          }
          navigation.navigate('Menu', {
            needsUpdate: true,
          });
        }}
        style={styles.saveButton}
      />
      <Button
        icon={<Icon name="swap-vert" type="ionicons" size={25} color="white" />}
        title=" Change Item Category"
        onPress={() => {
          navigation.navigate('Editor', {
            item: route.params.item,
            toChange: 'category',
            menu: route.params.menu,
          });
        }}
        style={styles.deleteButton}
      />
      <Button
        icon={<Icon name="delete" size={25} color="white" />}
        title=" Delete Item"
        onPress={() =>
          navigation.navigate('Delete Confirmation', {
            itemName: route.params.item.itemName,
            deleteType: 'item',
          })
        }
        style={styles.deleteButton}
      />
    </ScrollView>
  );
}

const updateOldItem = (oldItem, newItem) => {
  if (oldItem.itemName !== newItem.itemname) {
    oldItem.itemName = newItem.itemName;
  }
  if (oldItem.itemDescription !== newItem.itemDescription) {
    oldItem.itemDescription = newItem.itemDescription;
  }
  if (oldItem.itemPrice !== newItem.itemPrice) {
    oldItem.itemPrice = newItem.itemPrice;
  }
  if (oldItem.additionalHealthInfo !== newItem.additionalHealthInfo) {
    oldItem.additionalHealthInfo = newItem.additionalHealthInfo;
  }
  if (oldItem.cityTax !== newItem.cityTax) {
    oldItem.cityTax = newItem.cityTax;
  }
  if (oldItem.picture !== newItem.picture) {
    oldItem.picture = newItem.picture;
  }
  if (oldItem.available !== newItem.available) {
    oldItem.available = newItem.available;
  }
  oldItem.typeTags = newItem.typeTags;
  oldItem.options = newItem.options;
};

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    textAlign: 'center',
    padding: 20,
    paddingTop: 20,
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

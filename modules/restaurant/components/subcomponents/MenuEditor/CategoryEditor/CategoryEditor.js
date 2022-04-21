import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
//import Checkbox from '@react-native-community/checkbox';
import {Button, Icon, Text, ListItem, Input,CheckBox} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import {isUniqueCategory} from '../MenuUtilities';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';

const CategoryEditor = ({route, navigation}) => {
  const [items, setItems] = useState(route.params.updatedData);
  useEffect(() => {
    navigation.addListener('focus', () => {
      setItems(route.params.updatedData);
    });
  });

  const update = (index, item) => {
    let data = [...items];
    data[index] = item;
    setItems(data);
    navigation.setParams({updatedData: data});
  };

  const deleteItem = index => {
    let data = items.filter((item, i) => i != index);
    setItems(data);
    navigation.setParams({updatedData: data});
  };

  const updateMenu = () => {
    navigation.navigate('Menu', {needsUpdate: true, menu: {items}});
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1,marginTop:15}}>
        <FlatList
          data={items ?? []}
          renderItem={({item, index}) => (
            <MenuItem
              menu={item}
              editable={true}
              onUpdate={data => update(index, data)}
              onDelete={() => deleteItem(index)}
              edit={() =>
                navigation.navigate('ItemEditor', {
                  index,
                  item,
                  menuItems: items ?? [],
                })
              }
            />
          )}
          keyExtractor={({item, index}) => index + ''}
        />
      </View>
      <Button
        buttonStyle={styles.buttonStyle}
        style={{marginLeft: 10, marginRight: 10}}
        title="Save and Update Menu"
        onPress={updateMenu}
      />
    </View>
  );
};

const MenuItem = ({menu, editable, edit, onUpdate, onDelete}) => {
  const deleteItem = () => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this Menu Item?',
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
  }

  return (
    <View style={styles.menuItem}>
      {editable && (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <CheckBox
              checked={menu.itemAvailable}
              containerStyle={{backgroundColor:'transparent',borderWidth:0,padding:0,margin:0}}
              title="UNAVAILABLE"
              onPress={() => onUpdate({...menu, itemAvailable: !menu.itemAvailable})}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop:5,
              paddingLeft:5
            }}>
            <Icon name="delete" size={RFValue(20,580)} color="red" onPress={onDelete} />
            <Text style={{color: 'red', marginLeft: 10}}>Delete Item</Text>
          </View>
        </View>
      )}
      <TouchableOpacity onPress={edit} style={{display:'flex',flexDirection:'row',marginLeft:5,flex:1,alignItems:'center'}}>
        <Image
          source={{uri: `${menu.picture}?update=${new Date().getSeconds()}`}}
          style={{width: wp('20'), height: wp('20'),borderRadius:15}}
        />
        <View style={{marginLeft: 5, flex: 1}}>
          <Text style={styles.item} textBreakStrategy="simple">
            {menu.itemName}
          </Text>
          <Text style={styles.item} textBreakStrategy="simple">
            ${menu.price}
          </Text>
          <Text style={styles.item} textBreakStrategy="highQuality">
            {menu.description}
          </Text>
        </View>

      </TouchableOpacity>
      
    </View>
  );
};

const CategoryView = props => {
  let EditorStack = createStackNavigator();
  return (
    <EditorStack.Navigator
      title="Edit Categories"
      mode="modal"
      headerMode="none"
      initialRouteName="Categories">
      <EditorStack.Screen
        name="Categories"
        component={CategoriesList}
        initialParams={{
          menu: props.menu,
          oldMenu: props.oldMenu,
        }}
        options={{headerShown: false}}
      />
      <EditorStack.Screen
        name="Editor"
        component={EditCategory}
        initialParams={{
          menu: props.menu,
        }}
        options={({navigation}) => ({
          title: 'Editor',
          headerStatusBarHeight: 10,
        })}
      />
      <EditorStack.Screen
        name="Delete Confirmation"
        component={DeleteConfirmation}
        initialParams={{
          menu: props.menu,
        }}
      />
    </EditorStack.Navigator>
  );
};

function EditCategory({navigation, route}) {
  return (
    <EditCategoryName
      navigation={navigation}
      menu={route.params.menu}
      category={route.params.category}
    />
  );
}

function EditCategoryName(props) {
  let updatedName = '';
  const validateAndSubmit = () => {
    updatedName = updatedName.trim();
    if (props.category.categoryName !== updatedName) {
      if (updatedName === '') {
        Alert.alert('Please enter a name');
      } else if (!isUniqueCategory(updatedName, props.menu)) {
        Alert.alert('Please enter a unique category name');
        return;
      }
      props.category.categoryName = updatedName;
      props.navigation.navigate('Categories', {
        category: props.category,
      });
    }
  };
  return (
    <>
      <View style={styles.categoryEditorView}>
        <Text h4 style={styles.titlesPopped}>
          {props.category.categoryName}
        </Text>
        <Icon
          raised
          containerStyle={styles.deleteCategoryIcon}
          size={16}
          name="delete"
          color="#F86D64"
          reverse
          underlayColor="#F86D64"
          onPress={() => {
            props.navigation.navigate('Delete Confirmation', {
              category: props.category,
              menu: props.menu,
            });
          }}
        />
      </View>
      <View style={styles.general}>
        <Input
          inputStyle={styles.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder={`Category Name`}
          onChangeText={value => {
            updatedName = value;
          }}
          //onSubmitEditing={value => validateAndSubmit()}
        />
        <Button
          style={styles.navButtons}
          buttonStyle={{backgroundColor: '#F86D64', width: 100}}
          title="Cancel"
          onPress={() => props.navigation.goBack()}
        />
      </View>
      <View style={{padding: 15}}>
        <Button
          style={styles.navButtons}
          buttonStyle={styles.buttonStyle}
          title="Save"
          onPress={() => validateAndSubmit()}
        />
      </View>
    </>
  );
}

function CategoriesList({navigation, route}) {
  return (
    <>
      <View style={styles.categoryEditorView}>
        <Text h4 style={styles.titles}>
          {'Categories'}
        </Text>
        <Icon
          raised
          containerStyle={styles.addCategoryIcon}
          size={16}
          name="add"
          color="#000000"
          onPress={() => {
            let newLength = route.params.menu.categories.push({
              categoryName: 'New Category',
              timeServed: ['All Day'],
              items: [],
            });
            navigation.navigate('Editor', {
              category: route.params.menu.categories[newLength - 1],
              menu: route.params.menu,
            });
          }}
        />
      </View>
      <ScrollView>
        {route.params.menu.categories.map(category => {
          return (
            <View key={'category_editor_display_' + category.categoryName}>
              <View style={styles.menuListView}>
                <ListItem
                  title={category.categoryName}
                  subtitle={`Items: ${category.items.length}`}
                  bottomDivider
                  chevron
                  onPress={() =>
                    navigation.navigate('Editor', {
                      menu: route.params.menu,
                      category: category,
                    })
                  }
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={{padding: 15}}>
        <Button
          icon={
            <Icon name="cloud-upload" type="ionicons" size={25} color="white" />
          }
          title=" Save and Update Menu"
          onPress={() => {
            updateOldMenu(route.params.oldMenu, route.params.menu);
            navigation.navigate('Menu', {
              needsUpdate: true,
              menu: route.params.oldMenu,
            });
          }}
          buttonStyle={styles.buttonStyle}
          style={styles.saveButton}
        />
      </View>
    </>
  );
}

function updateOldMenu(oldMenu, newMenu) {
  oldMenu.categories = newMenu.categories;
}

function DeleteConfirmation({navigation, route}) {
  return (
    <>
      <View style={styles.general}>
        <Icon name="warning" size={30} color="orange" />
        <Text>{`Are you sure you want to delete the ${
          route.params.category.categoryName
        } category?`}</Text>
        <Button
          buttonStyle={{backgroundColor: '#F86D64'}}
          icon={<Icon name="undo" size={15} color="white" />}
          title="Cancel"
          onPress={() => navigation.goBack()}
        />
      </View>
      <Button
        icon={<Icon name="delete" size={15} color="white" />}
        title="Delete It"
        buttonStyle={[styles.buttonStyle, {marginLeft: 15, marginRight: 15}]}
        style={styles.deleteButton}
        onPress={() => {
          removeCategoryFromMenu(
            route.params.category.categoryName,
            route.params.menu,
          );
          navigation.navigate('Categories', {
            menu: route.params.menu,
          });
        }}
      />
    </>
  );
}

function removeCategoryFromMenu(categoryName, menu) {
  console.log(categoryName);
  console.log(menu.categories);
  menu.categories = menu.categories.filter(
    category => category.categoryName !== categoryName,
  );
  console.log(menu.categories);
}

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
    marginLeft: 15,
    marginRight: 15,
  },
  categoryEditorView: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    padding: 15,
    backgroundColor: 'white',
  },
  deleteCategoryIcon: {
    position: 'absolute',
    left: 0,
  },
  addCategoryIcon: {
    position: 'absolute',
    right: 0,
  },
  titlesPopped: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
    backgroundColor: '#e8e8e8',
  },
  titles: {
    textAlign: 'center',
    color: '#03a5fc',
    padding: 10,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 11,
    paddingTop: 8,
    paddingBottom: 8,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 35,
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 1,
    padding: 5,
    alignItems: 'center',
  },
  item: {
    fontSize: RFValue(10, 580),
    marginBottom: 5,
    color: 'black',
    flexWrap: 'wrap',
  },
});

export default CategoryEditor;

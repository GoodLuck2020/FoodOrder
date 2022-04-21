import React, {useState, useEffect} from 'react';
import {
  Image,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  Text,
  Divider,
  CheckBox,
  Icon,
  Input,
} from 'react-native-elements';
import {widthPercentageToDP} from 'react-native-responsive-screen';
// import {
//   TouchableOpacity,
//   TouchableHighlight,
// } from 'react-native-gesture-handler';
// import SelectMultiple from 'react-native-select-multiple';
// import {autoShowTooltip} from 'aws-amplify';

export default function AddItemToCart({navigation, route}) {
  console.log(route.params.item);
  // MAKE A NEW REFERENCE OBJECT TO MUTATE, OTHERWISE IT WILL MUTATE THE ORIGINAL ITEM
  let itemToAdd = route.params.item; //menu item will be passed back and added to the order
  //item should follow the structure of the items in the Order json so we can push it on the end of the list
  const {options, itemName, itemDescription} = itemToAdd;
  const [code, setCode] = useState('');

  //if they end up adding the item to their cart you should navigate like so:
  /*
  navigation.navigate('MenuDisplay', {
    addToCart: true,
    itemToAdd: itemToAdd,
  });
  */

  /*
    itemToAdd - CURRENT SHAPE
    {
      additionalHealthInfo: '',
      available: true,
      cityTax: 8,
      itemDescription:
        'Your choice of meat with pico de gallo, guacamole, and cheese served in a flour tortilla.',
      itemId: 1,
      itemName: 'Burrito',
      itemPrice: 9.59,
      options: [
        {
          maximum: 1,
          minimum: 1,
          optionList: [Array],
          optionTitle: 'Choice of Protein',
        },
        {
          maximum: 3,
          minimum: 0,
          optionList: [Array],
          optionTitle: 'Add In'
        },
      ],
      picture: '',
      typeTags: [],
    }
  */

  /*
    EXPECTED RETURN OBJECT SHAPE? - itemToAdd
    {
      "itemName": "",
      "itemDescription": "",
      "itemQuantity": 0,
      "itemPrice": 0,
      "options": [
        {
          "optionTitle": "",
          "optionList": [
            {
              "optionName": "",
              "optionPrice": 0.0
            }
          ]
        }
      ],
      "specialInstructions": ""
    }
  */

  /*
    TEMPORARY STATE FOR SPECIAL INSTRUCTIONS
  */
  const [specialInstructions, setSpecialInstructions] = useState('');

  /*
    TEMPORARY STATE FOR QUANTITY
    ---- CURRENTLY NO QUANTITY PROPERTY ON ITEM OBJECT ----
  */
  // const [quantity, setQuantity] = useState(1);

  /*
    CREATES AN ARRAY OF ARRAYS BASED ON THE NUMBER OF OPTIONS.
    USED TO KEEP TRACK OF WHAT OPTIONS HAS BEEN SELECTED.
  */
  const [selectOptions, setSelectOptions] = useState([]);
  const [number, setNumber] = useState(1);

  /*
    INPUTS: OPTION ITEM NAME, OPTION INDEX
    UTILIZES THE MAXIMUM PROPERTY FOR EACH OPTION TO HELP LIMIT OPTIONS.
    CURRENTLY, A USER NEEDS TO DE-SELECT (IF AT MAX), BEFORE SELECTING AGAIN.

    TODO: CLEAN UP REPEATED LOGIC
  */
  const selectHandler = (name, index) => {
    const {maximum} = options[index];
    const selectionLength = selectOptions[index].length;
    let deepCopyOptions = JSON.parse(JSON.stringify(selectOptions));

    if (selectionLength < maximum) {
      if (selectOptions[index].includes(name)) {
        // Filter
        deepCopyOptions[index] = deepCopyOptions[index].filter(x => x !== name);
      } else {
        // Push
        deepCopyOptions[index].push(name);
      }
    } else {
      if (selectOptions[index].includes(name)) {
        // Filter
        deepCopyOptions[index] = deepCopyOptions[index].filter(x => x !== name);
      }
    }

    setSelectOptions(deepCopyOptions);
  };

  /*
    UPDATE ITEM SHAPE BEFORE ADDING TO CART
  */
  const updateItemShape = () => {
    // let updatedOptions = options.map((option, index) => {
    //   let filteredItems = option.optionList.filter(({optionName}) =>
    //     selectOptions[index].includes(optionName),
    //   );

    //   return {
    //     ...option,
    //     optionList: filteredItems,
    //   };
    // });

    //itemToAdd.options = updatedOptions;

    // TODO: ADD SPECIAL INSTRUCTIONS
    itemToAdd.specialInstructions = specialInstructions;
    // TODO: ADD QUANTITY(?)
  };

  /*
     VALIDATE WHETHER OR NOT ALL THE REQUIRED OPTIONS WERE SELECTED (IF APPLICABLE)
  */
  const validateItem = () => {
    let valid = true;

    options?.forEach(({minimum}, index) => {
      if (selectOptions[index].length < minimum) {
        valid = false;
      }
    });

    return valid;
  };

  const addItemToCart = () => {
    let isValid = validateItem();
    if (!isValid) {
      return;
    }

    updateItemShape();

    navigation.navigate('MenuDisplay', {
      addToCart: true,
      itemToAdd: {...itemToAdd, quantity: number, code},
    });
  };

  const checkout = () => {
    let isValid = validateItem();
    if (!isValid) {
      return;
    }

    updateItemShape();

    navigation.navigate('Order Review', {
      order: {
        items: [itemToAdd],
        restaurantName:
          route.params.restaurant.Profile.restaurantInfo.restaurantName,
      },
      restaurant: route.params.restaurant.Profile,
      promotion: route.params.restaurant.Promotion
        ? JSON.parse(route.params.restaurant.Promotion)
        : [],
    });
  };

  return (
    <ScrollView style={styles.general}>
      <Text style={styles.itemName}>{itemName}</Text>
      <View style={styles.itemPictureContainer}>
        <Image
          style={styles.itemPicture}
          resizeMethod="scale"
          resizeMode="center"
          // TODO: change this to itemToAdd.itemPic
          source={{uri: itemToAdd.picture}}
        />
      </View>

      <Text style={styles.itemDescription}>{itemDescription}</Text>
      <Divider style={styles.divider} />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: 15,
          paddingRight: 15,
        }}>
        <Text style={{fontSize: 23}}>Quantity</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: 'grey',
            borderRadius: 15,
            padding: 5,
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={() => setNumber(Math.max(number - 1, 1))}>
            <Icon type="font-awesome" name="caret-down" />
          </TouchableOpacity>
          <Text style={{marginLeft: 15, marginRight: 15}}>{number}</Text>
          <TouchableOpacity onPress={() => setNumber(number + 1)}>
            <Icon type="font-awesome" name="caret-up" />
          </TouchableOpacity>
        </View>
      </View>
      {/* CONDITIONALLY RENDER JUST IN CASE RESTAURANTS DO NOT OFFER CUSTOMIZATIONS */}
      {options?.map(({optionList, optionTitle, minimum}, optionsIndex) => {
        return (
          <View key={optionTitle}>
            {/* TODO: POSSIBLY DISPLAY MIN/MAX FOR USERS */}
            <Text style={styles.itemOptionTitle}>
              {optionTitle}{' '}
              <Text style={minimum > 0 && styles.itemOptionSubtitle}>
                {minimum > 0 ? ' (Required)' : ' (Optional)'}
              </Text>
            </Text>

            {optionList.map(({optionName}) => {
              return (
                <View key={optionName}>
                  <CheckBox
                    title={optionName}
                    containerStyle={styles.optionListContainer}
                    checkedIcon="circle"
                    uncheckedIcon="circle-o"
                    checked={selectOptions[optionsIndex].includes(optionName)}
                    onPress={() => selectHandler(optionName, optionsIndex)}
                  />
                </View>
              );
            })}
          </View>
        );
      })}
      {/* TODO: Create input for special instructions - temporary placeholder */}

      <View>
        <Text style={styles.itemOptionTitle}>Special Instructions</Text>
        <Input
          placeholder="Optional instructions..."
          value={specialInstructions}
          onChangeText={text => setSpecialInstructions(text)}
        />
      </View>
      <View>
        <Text style={styles.itemOptionTitle}>Promotion code</Text>
        <Input
          placeholder="Promotion Copde..."
          value={code}
          autoCapitalize="none"
          onChangeText={text => setCode(text)}
        />
      </View>
      {/* TODO: Update item price as options are added/removed */}
      <View style={styles.addToCartButton}>
        <Button
          type="solid"
          title="Add to Cart"
          style={{flex: 1}}
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            // console.log(itemToAdd.itemPrice);
            addItemToCart();
            // navigation.navigate('MenuDisplay', {
            //   addToCart: true,
            //   itemToAdd: itemToAdd,
            // });
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemPictureContainer: {
    height: 250,
    // backgroundColor: 'red'
  },
  itemPicture: {
    height: 250,
    width: 300,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  itemName: {
    fontSize: 30,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  },
  itemDescription: {
    color: '#818181',
    fontSize: 16,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  divider: {
    // color: '#818181',
    borderColor: '#818181',
    margin: 10,
  },
  optionListContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  itemOptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 10,
  },
  itemOptionSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 10,
    color: 'red',
  },
  itemOptionChoice: {
    fontSize: 16,
    paddingLeft: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  optionToggleButton: {
    height: 32,
    width: 32,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#818181',
    padding: 10,
  },
  addToCartButton: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    alignSelf: 'center',
    borderColor: '#000066',
    backgroundColor: '#000066',
    width: 65,
    height: 65,
  },
  buttonPress: {
    alignSelf: 'center',
    borderColor: '#ddd',
    backgroundColor: '#ddd',
    width: 75,
    height: 75,
  },
  buttonStyle: {
    backgroundColor: '#F86D64',
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
    width: widthPercentageToDP('90'),
  },
});

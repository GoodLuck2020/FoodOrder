import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RNS3} from 'react-native-aws3';
import {
  EditTextAttribute,
  EditNumberAttribute,
  EditTags,
  SelectNewCategory,
} from './AttributeEditor';
import {Icon, Button, Input} from 'react-native-elements';
import AddItem from './AddItem';
import {DeleteConfirmation} from './DeleteConfirmation';
import {EditOptions} from './OptionsEditor';
import SelectPhotos from './PhotoSelector';
import {
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {Auth} from 'aws-amplify';
import config from '../../../../../customer/config';
import Loading from 'react-native-loading-spinner-overlay';
import {decode} from 'base64-arraybuffer';
import AWS from 'aws-sdk';

// export default class ItemEditor extends React.Component {
//   constructor(props) {
//     super(props);
//     this.navigation = props.navigation;
//     this.menu = props.route.params.menu;
//     this.category = props.route.params.category;
//     this.state = {
//       isNew: props.route.params.new,
//       item: props.route.params.newItem,
//       oldItem: props.route.params.item,
//     };
//   }

//   render() {
//     return <View />;
//   }
// }

const ItemEditor = ({route, navigation}) => {
  const [item, setItem] = useState(
    route.params.item
      ? route.params.item
      : {
          picture: '',
          itemName: '',
          price: 0,
          description: '',
        },
  );

  const [loading, setloading] = useState(false);

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (route.params.item) {
      setItem(route.params.item);
    } else {
      setItem({
        picture: '',
        itemName: '',
        price: 0,
        description: '',
      });
    }
  }, [route.params.item]);

  const openpicker = () => {
    ImagePicker.openPicker({}).then(res => {
      setImage({
        uri: res.path,
        type: res.mime,
        name: res.filename,
      });
    });
  };

  const uploadimage = keyString => {
    return new Promise((resolve, reject) => {
      RNS3.put(image, {
        keyPrefix: keyString + '/',
        bucket: config.bucket,
        region: 'us-west-1',
        accessKey: config.accessKeyId,
        secretKey: config.secretAccessKey,
      })
        .progress(function(progress) {
          console.log(progress);
        })

        .then(response => {
          let {location} = response.body.postResponse;
          resolve(location);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  };

  const updateimage1 = (keyString, blob) => {
    return new Promise((resolve, reject) => {
      var s3 = new AWS.S3({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      });

      let body = decode(blob);

      s3.upload(
        {
          Bucket: config.bucket,
          Key: keyString,
          Body: body,
          ContentType: 'image/jpg',
          ACL: 'public-read',
        },
        (err, data) => {
          console.log(err);
          if (!err) {
            resolve(data.Location);
          } else {
            reject(err);
          }
        },
      );
    });
  };

  const submitResult = async () => {
    setloading(true);
    let info = await Auth.currentUserInfo();
    let data = item;
    let updatedData = route.params.menuItems;
    try {
      try {
        if (image) {
          let blob = await RNFetchBlob.fs.readFile(image.uri, 'base64');

          let keyString =
            'restaurants/' +
            info.username +
            '/menuPhotos/' +
            new Date().getTime() +
            '.jpg';
          // let body = {
          //   convertedUri: blob,
          //   restName: info.username,
          //   menuItem: item.itemName,
          //   dataType: 'restaurantMenu',
          // };

          // const responseimg = await fetch(
          //   'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/updates3bucket',
          //   {
          //     method: 'POST',
          //     mode: 'cors',
          //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          //     credentials: 'same-origin', // include, *same-origin, omit
          //     headers: {
          //       'Content-Type': 'multipart/form-data',
          //       Connection: 'keep-alive',
          //       // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
          //     },
          //     body: JSON.stringify(body),
          //   },
          // );

          // const responsejson = await responseimg.json();
          // data = {
          //   ...item,
          //   picture: JSON.parse(responsejson.body).Location,
          // };

          let location = await updateimage1(keyString, blob);
          data = {
            ...item,
            picture: location,
          };
        }
      } catch (e) {
        console.log(e);
      }

      if (route.params.index != undefined) {
        updatedData[route.params.index] = data;
      } else {
        updatedData.push(data);
      }
      setloading(false);
      navigation.navigate('CategoryEditor', {updatedData});
    } catch (e) {
      console.log(e);

      setloading(false);
    }
  };

  return (
    <ScrollView style={style.container}>
      <View style={{marginBottom: 10, flex: 1}}>
        <TouchableOpacity
          style={[style.photo, {marginBottom: 30}]}
          onPress={() => openpicker()}>
          {item.picture || image ? (
            <Image
              source={{
                uri: image ? image.uri : item.picture + '?update=' + new Date(),
              }}
              style={style.photo}
            />
          ) : (
            <Icon name="photo" size={wp('15')} />
          )}
        </TouchableOpacity>
        <Input
          inputStyle={style.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Item Name"
          value={item.itemName}
          onChangeText={value => setItem({...item, itemName: value})}
        />
        <Input
          inputStyle={[style.input, {minHeight: 100}]}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Description"
          numberOfLines={3}
          textAlignVertical="top"
          value={item.description}
          multiline={true}
          onChangeText={value => setItem({...item, description: value})}
        />
        <Input
          inputStyle={style.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Price"
          keyboardType="number-pad"
          leftIcon={<Icon name="attach-money" />}
          value={item.price}
          onChangeText={value => setItem({...item, price: value})}
        />
      </View>
      <Button
        buttonStyle={[style.buttonStyle, {marginBottom: 30}]}
        title={`Save/${route.params.item ? 'Update' : 'Submit'}`}
        onPress={submitResult}
      />
      <Loading visible={loading} />
    </ScrollView>
  );
};

const ItemView = props => {
  let EditorStack = createStackNavigator();
  return (
    <EditorStack.Navigator
      title="Edit Attribute"
      mode="modal"
      headerMode="none"
      initialRouteName="Attributes">
      <EditorStack.Screen
        name="Attributes"
        component={AddItem}
        initialParams={{
          item: props.item,
          oldItem: props.oldItem,
          isNew: props.isNew,
          menu: props.menu,
          category: props.categoryName,
          newCategory: '',
        }}
        options={{headerShown: false}}
      />
      <EditorStack.Screen
        name="Editor"
        component={EditItem}
        initialParams={{
          item: props.item,
          menu: props.menu,
          category: props.categoryName,
        }}
        options={({navigation}) => ({
          title: 'Editor',
          headerStatusBarHeight: 10,
          headerBackTitle: 'Attributes',
        })}
      />
      <EditorStack.Screen
        name="PhotoSelector"
        component={SelectPhotos}
        initialParams={{
          item: props.item,
          menu: props.menu,
          category: props.categoryName,
        }}
        options={({navigation}) => ({
          title: 'Photos',
          headerStatusBarHeight: 10,
          headerBackTitle: 'Attributes',
        })}
      />
      <EditorStack.Screen
        name="Delete Confirmation"
        component={DeleteConfirmation}
        initialParams={{
          item: props.item,
          menu: props.menu,
          uneditedItemName: props.oldItem.itemName,
          categoryName: props.categoryName,
        }}
      />
    </EditorStack.Navigator>
  );
};

function EditItem({navigation, route}) {
  if (
    route.params.toChange === 'itemPrice' ||
    route.params.toChange === 'cityTax'
  ) {
    return (
      <EditNumberAttribute
        navigation={navigation}
        item={route.params.item}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
      />
    );
  } else if (route.params.toChange === 'typeTags') {
    return (
      <EditTags
        navigation={navigation}
        item={route.params.item}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
      />
    );
  } else if (route.params.toChange === 'options') {
    return (
      <EditOptions
        navigation={navigation}
        item={route.params.item}
        option={route.params.option}
        attribute={route.params.attribute}
        toChange={route.params.toChange}
        editOptionTitle={route.params.editOptionTitle}
        editOptionList={route.params.editOptionList}
        editOptionMinMax={route.params.editOptionMinMax}
      />
    );
  } else if (route.params.toChange === 'category') {
    return (
      <SelectNewCategory
        navigation={navigation}
        item={route.params.item}
        menu={route.params.menu}
      />
    );
  }
  return (
    <EditTextAttribute
      navigation={navigation}
      item={route.params.item}
      attribute={route.params.attribute}
      toChange={route.params.toChange}
      menu={route.params.menu}
      category={route.params.category}
    />
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  photo: {
    width: wp('30'),
    height: wp('30'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 15,
    borderColor: '#DDD',
    borderWidth: 1,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#DED7D7',
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
  },
});

export default ItemEditor;

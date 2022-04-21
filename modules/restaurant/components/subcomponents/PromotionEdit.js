import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from 'react-native';
import Loading from 'react-native-loading-spinner-overlay';
import {Input, Icon, Button, CheckBox} from 'react-native-elements';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import ImagePicker from 'react-native-image-crop-picker';
import {Auth} from 'aws-amplify';
import RNFetchBlob from 'rn-fetch-blob';
import DatePicker from 'react-native-datepicker';
import AWS from 'aws-sdk';
import {decode} from 'base64-arraybuffer';
import config from '../../../customer/config';

export default function PromotionEdit({navigation, route}) {
  const [image, setimage] = useState(null);
  const [loading, setloading] = useState(false);
  const [promotion, setpromotion] = useState({
    picture: '',
    title: '',
    details: '',
    discount: 0,
    budget: 0,
    from: new Date(),
    expired: new Date(),
  });

  useEffect(() => {
    if (route.params.item) {
      setpromotion({
        ...route.params.item,
        from: route.params.item.from
          ? new Date(route.params.item.from)
          : new Date(),
        expired: route.params.item.expired
          ? new Date(route.params.item.expired)
          : new Date(),
      });
    }
    setimage(null);
  }, [route.params.item]);

  const promotionlist = route.params.promotion ? route.params.promotion : [];
  let promotiondata = promotion;

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

  const updatepromotion = async () => {
    setloading(true);
    let info = await Auth.currentUserInfo();

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
        //   menuItem: promotion.title,
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
        // console.log(responsejson);
        const location = await updateimage1(keyString, blob);
        promotiondata = {
          ...promotion,
          picture: location,
        };
      }

      let data = [promotiondata, ...promotionlist];
      if (route.params.index != undefined) {
        data = promotionlist.map((item, index) =>
          index == route.params.index ? promotiondata : item,
        );
      }

      let body = {
        'restaurant-id': info.username,
        promotion: JSON.stringify(data),
      };

      const response = await fetch(
        'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/updatepromotion',
        {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'application/json',
            Connection: 'keep-alive',
            // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(body), // body data type must match “Content-Type” header
        },
      );
      let apiResponse = await response.json();
      navigation.navigate('Promotion', {promotion: data});
      setloading(false);
      return apiResponse;
    } catch (e) {
      console.log(e);
      setloading(false);
    }
  };

  const openpicker = () => {
    ImagePicker.openPicker({}).then(res => {
      setimage({
        uri: res.path,
        type: res.mime,
        filename: res.path.split('/').pop(),
      });
    });
  };

  const removePromotion = () => {
    Alert.alert(
      'Delete Promotion',
      'Are you sure you want to delete this promotion?',
      [{text: 'Ok', onPress: deletePromotion}, {text: 'Cancel'}],
    );
  };

  const deletePromotion = async () => {
    let info = await Auth.currentUserInfo();
    setloading(true);
    let data = promotionlist.filter(
      (item, index) => index != route.params.index,
    );

    let body = {
      'restaurant-id': info.username,
      promotion: JSON.stringify(data),
    };

    const response = await fetch(
      'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/updatepromotion',
      {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
          // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(body), // body data type must match “Content-Type” header
      },
    );
    let apiResponse = await response.json();
    setloading(false);
    navigation.navigate('Promotion', {promotion: data});

    return apiResponse;
  };

  console.log(promotion.from);
  console.log(new Date());

  return (
    <ScrollView style={style.container}>
      <View style={{marginBottom: 56}}>
        {route.params.item && (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EEE',
              marginBottom: 15,
            }}>
            <Icon name="delete" color="red" raised onPress={removePromotion} />
            <Text style={{color: 'red'}}>DELETE PROMOTION</Text>
          </View>
        )}
        <TouchableOpacity
          style={[style.photo, {marginBottom: 30}]}
          onPress={() => openpicker()}>
          {promotion.picture || image ? (
            <Image
              source={{uri: image ? image.uri : promotion.picture}}
              style={style.photo}
            />
          ) : (
            <Icon name="photo" size={wp('15')} />
          )}
        </TouchableOpacity>
        <Input
          inputStyle={style.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Title"
          value={promotion.title}
          onChangeText={value => setpromotion({...promotion, title: value})}
        />
        <Input
          inputStyle={[style.input, {alignItems: 'baseline', minHeight: 100}]}
          textAlignVertical="top"
          inputContainerStyle={{borderBottomWidth: 0}}
          numberOfLines={5}
          placeholder="Details"
          multiline={true}
          value={promotion.details}
          onChangeText={value => setpromotion({...promotion, details: value})}
        />
        <Input
          inputStyle={style.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Discount Amount"
          keyboardType="number-pad"
          value={promotion.discount}
          leftIcon={<Icon name="attach-money" />}
          onChangeText={value => setpromotion({...promotion, discount: value})}
        />
        <Input
          inputStyle={style.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Budget Amount"
          keyboardType="number-pad"
          value={promotion.budget + ''}
          leftIcon={<Icon name="attach-money" />}
          onChangeText={value => setpromotion({...promotion, budget: value})}
        />
        <CheckBox
          title="ENTIRE ORDER"
          checked={promotion.type == 'order'}
          onPress={() =>
            setpromotion({
              ...promotion,
              type: promotion.type == 'order' ? '' : 'order',
            })
          }
        />
        <CheckBox
          title="SPECIFIC ITEMS"
          checked={promotion.type == 'specific'}
          onPress={() =>
            setpromotion({
              ...promotion,
              type: promotion.type == 'specific' ? '' : 'specific',
            })
          }
        />
        {promotion.type === 'specific' && (
          <Input
            inputStyle={[style.input, {alignItems: 'baseline', minHeight: 100}]}
            textAlignVertical="top"
            inputContainerStyle={{borderBottomWidth: 0}}
            numberOfLines={5}
            placeholder="Add Items, separated by ','"
            multiline={true}
            value={promotion.addItems}
            onChangeText={value =>
              setpromotion({...promotion, addItems: value})
            }
          />
        )}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 15,
          }}>
          <Text style={{marginRight: 15, flex: 1}}>START DATE:</Text>
          <DatePicker
            mode="date"
            format="MM/DD/YYYY"
            cancelBtnText="Cancel"
            confirmBtnText="Confirm"
            date={promotion.from ?? new Date()}
            timeZoneOffsetInMinutes={0}
            onDateChange={date => {
              setpromotion({
                ...promotion,
                from: new Date(
                  `${date.split('/')[2]}-${date.split('/')[0]}-${
                    date.split('/')[1]
                  }T08:00:00`,
                ),
              });
            }}
            customStyles={{dateIcon: {display: 'none'}, dateInput: style.input}}
          />
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 15,
          }}>
          <Text style={{marginRight: 15, flex: 1}}>EXPIRATION DATE:</Text>
          <DatePicker
            mode="date"
            format="MM/DD/YYYY"
            cancelBtnText="Cancel"
            confirmBtnText="Confirm"
            date={promotion.expired ?? new Date()}
            onDateChange={date =>
              setpromotion({
                ...promotion,
                expired: new Date(
                  `${date.split('/')[2]}-${date.split('/')[0]}-${
                    date.split('/')[1]
                  }T08:00:00`,
                ),
              })
            }
            customStyles={{dateIcon: {display: 'none'}, dateInput: style.input}}
          />
        </View>
        <Button
          title={`Save/${route.params.item ? 'Update' : 'Submit'}`}
          onPress={updatepromotion}
          buttonStyle={{
            backgroundColor: '#F86D64',
            paddingTop: 15,
            paddingBottom: 15,
            marginTop: 24,
          }}
        />
      </View>
      <Loading visible={loading} />
    </ScrollView>
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
});

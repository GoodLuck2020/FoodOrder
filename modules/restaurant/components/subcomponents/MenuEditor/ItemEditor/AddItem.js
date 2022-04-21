import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {ListItem, Text, Input, Icon, Button} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import {RFValue} from 'react-native-responsive-fontsize';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import {
  hasChangedCategory,
  addItemToCategory,
  removeItemFromCategory,
} from '../MenuUtilities';
import RNFetchBlob from 'rn-fetch-blob';
import {Auth} from 'aws-amplify';
export default function AddItem({navigation, route}) {
  const [data, setdata] = useState(route.params.item);
  const [image, setimage] = useState(null);
  const [tagview, settagview] = useState(false);
  const [optionview, setoptionview] = useState(false);
  const [tagname, settagname] = useState('');
  const [optionlist, setoptionlist] = useState(false);
  const [optiondetail, setoptiondetail] = useState({
    optionName: '',
    optionPrice: 0,
  });
  const [editindex, seteditindex] = useState(-1);
  const [option, setoption] = useState({
    optionTitle: '',
    min: 0,
    max: 0,
    optionlist: [],
  });

  useEffect(() => {
    setdata(route.params.item);
  }, [route.params.item]);
  const toggleAvailablility = () => {
    setdata({...data, available: !data.available});
  };

  const openpicker = () => {
    ImagePicker.openPicker({})
      .then(file => {
        setimage({
          uri: file.path,
          type: file.mime,
          name: file.path.split('/').pop(),
        });
      })
      .catch(err => console.log(err));
  };

  const addoptionlist = () => {
    if (optiondetail.optionName && optiondetail.optionPrice) {
      setoption({...option, optionlist: [optiondetail, ...option.optionlist]});
      setoptiondetail({optionName: '', optionPrice: 0});
      setoptionlist(false);
    }
  };

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

  useEffect(() => {
    if (!optionview) {
      setoption({
        optionTitle: '',
        min: 0,
        max: 0,
        optionlist: [],
      });
    }
  }, [optionview]);

  useEffect(() => {
    if (!optionlist) {
      setoptiondetail({optionName: '', optionPrice: 0});
      seteditindex(-1);
    }
  }, [optionlist]);

  const addoption = () => {
    if (option.optionTitle) {
      if (editindex == -1) {
        setdata({...data, options: [option, ...data.options]});
      } else {
        let options = [...data.options];
        options[editindex] = option;
        setdata({...data, options});
      }
      setoptionview(false);
    }
  };

  async function updateS3() {
    let blob = await RNFetchBlob.fs.readFile(image.uri, 'base64');
    const info = await Auth.currentUserInfo();
    let body = {
      convertedUri: blob,
      restName: info.username,
      menuItem: data.itemName,
      dataType: 'restaurantMenu',
    };

    const response = await fetch(
      'https://9yl3ar8isd.execute-api.us-west-1.amazonaws.com/beta/updates3bucket',
      {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
          Authorization: 'none',
          // ‘Content-Type’: ‘application/x-www-form-urlencoded’,
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(body), // body data type must match “Content-Type” header
      },
    );
    let apiResponse = await response.json(); // parses JSON response into native JavaScript objects
    return apiResponse;
  }

  const savemenuitem1 = async () => {
    let data = await updateS3(image);
    console.log(data.blob());
  };
  const savemenuitem = async () => {
    let savedata = {...data};
    if (image) {
      let imagedata = await updateS3(image);
      savedata.picture = JSON.parse(imagedata.body).Location;
    }

    updateOldItem(route.params.oldItem, savedata);
    if (hasChangedCategory(route.params.category, route.params.newCategory)) {
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
  };

  const deletemenuitem = () => {
    navigation.navigate('Delete Confirmation', {
      itemName: route.params.item.itemName,
      deleteType: 'item',
    });
  };

  return (
    <ScrollView
      style={{backgroundColor: 'white'}}
      showsVerticalScrollIndicator={false}>
      <ListItem
        title={'Available'}
        switch={{
          value: data.available,
          onChange: () => toggleAvailablility(),
        }}
      />
      <Text h4 style={styles.titles}>
        Item Information
      </Text>
      <View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 15,
          }}>
          <TouchableOpacity style={styles.image} onPress={openpicker}>
            {data.picture || image ? (
              <Image
                source={{
                  uri: image ? image.uri : data.picture + '?date=' + new Date(),
                }}
                style={styles.image}
              />
            ) : (
              <Icon name="picture" type="antdesign" size={RFValue(30, 580)} />
            )}
          </TouchableOpacity>
        </View>
        <Input
          inputStyle={styles.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Name"
          value={data.itemName}
          onChangeText={value => setdata({...data, itemName: value})}
        />
        <Input
          inputStyle={styles.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Price"
          keyboardType="number-pad"
          value={data.itemPrice + ''}
          onChangeText={value => setdata({...data, itemPrice: value})}
        />
        <Input
          inputStyle={styles.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Description"
          numberOfLines={5}
          textAlignVertical="top"
          value={data.itemDescription}
          onChangeText={value => setdata({...data, itemDescription: value})}
        />
        <Input
          inputStyle={styles.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="Additional Health Information"
          value={data.additionalHealthInfo}
          onChangeText={value =>
            setdata({...data, additionalHealthInfo: value})
          }
        />
        <Input
          inputStyle={styles.input}
          inputContainerStyle={{borderBottomWidth: 0}}
          placeholder="City Tax"
          value={data.cityTax}
          onChangeText={value => setdata({...data, cityTax: value})}
        />
        <View style={{marginBottom: 25}}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text h4 style={styles.titles}>
                Tags
              </Text>
            </View>
            <Icon
              raised
              size={16}
              name="add"
              color="#000000"
              underlayColor="#dedede"
              onPress={() => {
                settagview(true);
              }}
            />
          </View>
          {data.typeTags.map((item, index) => (
            <View key={index + ''}>
              <ListItem
                title={item.toString()}
                bottomDivider
                rightIcon={{
                  name: 'delete',
                  onPress: () => {
                    let tags = [...data.typeTags];
                    tags.splice(index, 1);
                    setdata({
                      typeTags: tags,
                    });
                  },
                }}
                onPress={() => {
                  settagview(true);
                  settagname(item);
                }}
              />
            </View>
          ))}
        </View>
        <View style={{marginBottom: 25}}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text h4 style={styles.titles}>
                Item Options
              </Text>
            </View>
            <Icon
              raised
              size={16}
              name="add"
              color="#000000"
              underlayColor="#dedede"
              onPress={() => setoptionview(true)}
            />
          </View>
          <View>
            {data.options.map((item, index) => (
              <ListItem
                key={index + ''}
                title={item.optionTitle}
                bottomDivider
                rightIcon={{
                  name: 'delete',
                  onPress: () => {
                    let optionlist = [...data.options];
                    optionlist.splice(index, 1);
                    setdata({...data, options: optionlist});
                  },
                }}
                onPress={() => {
                  setoptionview(true);
                  seteditindex(index);
                  setoption(item);
                }}
              />
            ))}
          </View>
        </View>
      </View>
      <Modal isVisible={tagview} onBackdropPress={() => settagview(false)}>
        <View style={styles.modalinside}>
          <Text h4 style={styles.titles}>
            Edit Tag
          </Text>
          <Input
            label="Tag Name"
            inputStyle={styles.input}
            inputContainerStyle={{borderBottomWidth: 0}}
            placeholder="Tag Name"
            value={tagname}
            onChangeText={value => settagname(value)}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <Button
              type="solid"
              title="Cancel"
              buttonStyle={{backgroundColor: '#F86D64', width: 100}}
              onPress={() => {
                settagname('');
                settagview(false);
              }}
            />
            <Button
              type="solid"
              title="Save"
              buttonStyle={{backgroundColor: '#F86D64', width: 100}}
              onPress={() => {
                if (tagname) {
                  setdata({...data, typeTags: [tagname, ...data.typeTags]});
                  settagview(false);
                }
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal isVisible={optionview}>
        <View style={styles.modalinside}>
          <Text h4 style={styles.titles}>
            Edit Option
          </Text>
          <Input
            label="Option Title"
            inputStyle={styles.input}
            inputContainerStyle={{borderBottomWidth: 0}}
            placeholder="Option Title"
            value={option.optionTitle}
            onChangeText={value => setoption({...option, optionTitle: value})}
          />
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Input
                label="Minimum"
                inputStyle={styles.input}
                inputContainerStyle={{borderBottomWidth: 0}}
                placeholder="Minimum"
                value={option.min + ''}
                onChangeText={value => setoption({...option, min: value})}
                keyboardType="number-pad"
              />
            </View>
            <View style={{flex: 1}}>
              <Input
                label="Maximum"
                inputStyle={styles.input}
                inputContainerStyle={{borderBottomWidth: 0}}
                placeholder="Maximum"
                value={option.max + ''}
                onChangeText={value => setoption({...option, max: value})}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View style={{marginBottom: 25}}>
            <View style={{display: 'flex', flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text h4 style={styles.titles}>
                  Option List
                </Text>
              </View>
              <Icon
                raised
                size={16}
                name="add"
                color="#000000"
                underlayColor="#dedede"
                onPress={() => setoptionlist(!optionlist)}
              />
            </View>
            <View>
              {optionlist && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{flex: 1}}>
                    <Input
                      label="Option Label"
                      value={optiondetail.optionName}
                      onChangeText={value =>
                        setoptiondetail({...optiondetail, optionName: value})
                      }
                      style={{flex: 1}}
                      inputStyle={styles.input}
                      inputContainerStyle={{borderBottomWidth: 0}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Input
                      label="Option Price"
                      value={optiondetail.optionPrice + ''}
                      onChangeText={value =>
                        setoptiondetail({...optiondetail, optionPrice: value})
                      }
                      style={{flex: 1}}
                      inputStyle={styles.input}
                      inputContainerStyle={{borderBottomWidth: 0}}
                      keyboardType="number-pad"
                    />
                  </View>
                  <Icon
                    raised
                    size={16}
                    name="add"
                    color="#000000"
                    underlayColor="#dedede"
                    onPress={addoptionlist}
                  />
                </View>
              )}
              <View>
                {option.optionlist.map((item, index) => (
                  <ListItem
                    key={index + ''}
                    title={item.optionName}
                    bottomDivider
                    subtitle={'$' + item.optionPrice}
                    rightIcon={{
                      name: 'delete',
                      onPress: () => {
                        let optionlist = [...option.optionlist];
                        optionlist.splice(index, 1);
                        setoption({...option, optionlist: optionlist});
                      },
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <Button
              type="solid"
              title="Cancel"
              buttonStyle={{backgroundColor: '#F86D64', width: 100}}
              onPress={() => {
                setoptionview(false);
                setoptionlist(false);
              }}
            />
            <Button
              type="solid"
              title="Save"
              buttonStyle={{backgroundColor: '#F86D64', width: 100}}
              onPress={addoption}
            />
          </View>
        </View>
      </Modal>
      <View style={{padding: 15}}>
        <Button
          title="Save Menu Item"
          buttonStyle={{
            backgroundColor: '#F86D64',
            paddingTop: 15,
            paddingBottom: 15,
            borderRadius: 5,
          }}
          onPress={savemenuitem}
        />
        <Button
          title="Delete Menu Item"
          buttonStyle={{
            backgroundColor: '#F86D64',
            paddingTop: 15,
            paddingBottom: 15,
            borderRadius: 5,
            marginTop: 5,
          }}
          onPress={deletemenuitem}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  input: {
    backgroundColor: 'white',
    borderColor: '#DED7D7',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 11,
    paddingTop: 8,
    paddingBottom: 8,
  },
  image: {
    width: wp('30'),
    height: wp('30'),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 15,
  },
  modalinside: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
});

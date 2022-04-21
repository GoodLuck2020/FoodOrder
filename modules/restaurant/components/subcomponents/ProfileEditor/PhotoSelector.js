import CameraRoll from '@react-native-community/cameraroll';
import React from 'react';
import {
  View,
  //Text,
  TouchableHighlight,
  Modal,
  StyleSheet,
  Button,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';

const {width} = Dimensions.get('window');

export default class SelectPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.profile = props.route.params.profile;
    this.mounted = true;
    this.state = {
      modalVisible: true,
      photos: [],
      index: null,
    };
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  uploadToBucket(photoData, profileData) {
    updateS3(photoData, profileData);
    async function updateS3(profilePicture, userName) {
      console.log(profilePicture, 'profilePic var');
      const body = JSON.stringify(profilePicture);
      // let token = null;
      // let prom = Auth.currentSession().then(
      //   info => (token = info.getIdToken().getJwtToken()),
      // );
      // await prom;
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
          body: body, // body data type must match “Content-Type” header
        },
      );
      let apiResponse = await response; // parses JSON response into native JavaScript objects
      console.log(apiResponse);
    }
  }

  getPhotos = () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'All',
    }).then(r => {
      if (this.mounted) {
        this.setState({photos: r.edges});
      }
    });
  };

  render() {
    this.getPhotos();
    return (
      <View style={styles.container}>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.modalVisible}
          //onRequestClose={() => console.log('closed')}
        >
          <View style={styles.modalContainer}>
            <Button title="Close" onPress={() => this.navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollView}>
              {this.state.photos.map((p, i) => {
                return (
                  <TouchableHighlight
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{opacity: i === this.state.index ? 0.5 : 1}}
                    key={i}
                    underlayColor="transparent"
                    onPress={() => {
                      this.profile.displayItem.itemPicture = p.node.image.uri;
                      this.navigation.navigate('Profile', {
                        profile: this.profile,
                      });
                    }}>
                    <Image
                      style={{
                        width: width / 3,
                        height: width / 3,
                      }}
                      source={{uri: p.node.image.uri}}
                    />
                  </TouchableHighlight>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    paddingTop: 30,
    flex: 1,
  },
  scrollView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  shareButton: {
    position: 'absolute',
    width,
    padding: 10,
    bottom: 0,
    left: 0,
  },
});

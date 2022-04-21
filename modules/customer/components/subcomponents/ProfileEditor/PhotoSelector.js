import CameraRoll from '@react-native-community/cameraroll';
import React from 'react';
//function to hit api for update profile lambda
import updateDynamoCustomer from './updateDynamoCustomer';
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
                      this.profile.customerInfo.picture = p.node.image.uri;
                      this.navigation.navigate('User Profile', {
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

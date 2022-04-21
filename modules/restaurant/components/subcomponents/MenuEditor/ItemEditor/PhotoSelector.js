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
    this.item = props.route.params.item;
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
                    style={{opacity: i === this.state.index ? 0.5 : 1}}
                    key={i}
                    underlayColor="transparent"
                    onPress={() => {
                      this.item.picture = p.node.image.uri;
                      this.navigation.navigate('Attributes', {item: this.item});
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

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default class Analytics extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.general}>
        <Text> Coming Soon! </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  general: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
  },
});

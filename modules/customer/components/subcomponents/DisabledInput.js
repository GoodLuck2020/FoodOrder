import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';

export default class DisabledInput extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                {this.props.label ? (
                    <Text style={styles.labelText}>{this.props.label}</Text>
                ) : null}
                <Text style={styles.disabledText}>{this.props.value}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 8,
        marginTop: 10,
    },
    labelText: {
        color: '#89949D',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledText: {
        fontSize: 18,
        color: '#666666',
        paddingLeft: 11,
        paddingTop: 5,
        paddingBottom: 8,
        textDecorationLine: 'underline'
    }
});

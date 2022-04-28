import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../../../theme/Images';

export default class RoundButton extends React.Component {
    render() {
        return (
            <TouchableOpacity
                style={[this.props.style]}
                onPress={() => this.props.enabled !== false && this.props.onPress()}>
                <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={[
                        '#FF7F56',
                        '#F35B47',
                        '#E83939',
                    ]}
                    style={[styles.gradientOverlay]}
                />
                {this.props.theme == 'main' ? (
                    <View
                        style={[
                            this.props.size == 'small'
                                ? styles.smallButtonContainer
                                : styles.buttonContainer,
                            this.props.enabled === false ? {opacity: 0.5} : {opacity: 1},
                            styles.mainButton,
                        ]}>
                        <Text style={[styles.buttonText, styles.whiteText]}>
                            {this.props.title}
                        </Text>
                    </View>
                ) : null}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: 52,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },

    smallButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        height: 40,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },

    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 52,
        borderRadius: 5,
    },

    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'white',
    },

    mainButton: {
    },

    buttonText: {
        fontSize: 20,
    },

    outlineText: {
        color: '#333',
    },

    whiteText: {
        color: 'white',
    },

    blackText: {
        color: '#101010',
    },

    grayText: {
        color: '#939393',
    },

    redText: {
        color: '#D21717',
    },
});

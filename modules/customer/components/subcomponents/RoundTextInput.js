import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Image,
    Text,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import Images from '../../../theme/Images';

export default class RoundTextInput extends Component {
    constructor() {
        super();
        this.state = {
            displayPassword: false,
            showAddressList: false,
        };
    }

    render() {
        const {
            type,
            icon,
            errorMessage,
            theme,
            label,
            prefixIcon,
        } = this.props;

        return (
            <View style={[styles.container, this.props.style]}>
                {label && label.length > 0 ? (
                    <Text style={styles.labelText}>{label}</Text>
                ) : null}
                <View
                    style={[
                        theme && theme == 'theme2'
                            ? styles.contentWithLabel
                            : styles.content,
                        prefixIcon ? {paddingLeft: 50} : {},
                    ]}>
                    {prefixIcon ? (
                        <Image source={prefixIcon} style={styles.prefixIconImage} />
                    ) : null}
                    {type === 'text' && this._renderTextField()}
                    {type === 'button' && this._renderButtonField()}
                    {type === 'number' && this._renderNumberField()}
                    {type === 'phone' && this._renderPhoneField()}
                    {type === 'email' && this._renderEmailField()}
                    {type === 'password' && this._renderPasswordField()}
                    {type === 'textview' && this._renderTextviewField()}
                </View>
                {icon && <Image source={icon} style={styles.iconImage} />}
                {
                    errorMessage
                        ? <Text style={[styles.errorMessage, theme && theme.length > 0 ? {marginLeft: 0, marginTop: 0} : {}]}>
                            {errorMessage}
                        </Text>
                        : null
                }
            </View>
        );
    }

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Text Field ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderTextField() {
        const {
            autoFocus,
            autoCapitalize,
            editable,
            label,
            maxLength,
            textAlign,
            placeholder,
            value,
            returnKeyType,
            onRefInput,
            onChangeText,
            onSubmitEditing,
            inputStyle,
        } = this.props;

        return (
            <TextInput
                style={[
                    styles.textInput,
                    label && label.length > 0 ? {height: 40} : {},
                    textAlign ? {textAlign: textAlign} : {},
                    inputStyle,
                ]}
                underlineColorAndroid="transparent"
                placeholder={placeholder}
                onChangeText={onChangeText}
                value={value}
                autoFocus={autoFocus}
                autoCapitalize={autoCapitalize}
                editable={editable}
                maxLength={maxLength}
                ref={onRefInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
            />
        )
    }

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Button Field ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderButtonField() {
        const {
            autoFocus,
            label,
            maxLength,
            textAlign,
            placeholder,
            onRefInput,
            onSelect,
        } = this.props;
        return (
            <TouchableOpacity onPress={onSelect}>
                <View pointerEvents="none">
                    <TextInput
                        editable={false}
                        selectTextOnFocus={false}
                        style={[
                            styles.textInput,
                            label && label.length > 0 ? {height: 40} : {},
                            textAlign ? {textAlign: textAlign} : {},
                        ]}
                        underlineColorAndroid="transparent"
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        maxLength={maxLength}
                        value={value}
                        ref={onRefInput}
                    />
                </View>
            </TouchableOpacity>
        )
    }

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Number Field ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderNumberField() {
        const {
            autoFocus,
            editable,
            label,
            maxLength,
            placeholder,
            textAlign,
            value,
            returnKeyType,
            onRefInput,
            onChangeText,
            onSubmitEditing,
        } = this.props;
        return (
            <TextInput
                style={[
                    styles.textInput,
                    label && label.length > 0 ? {height: 40} : {},
                    textAlign ? {textAlign: textAlign} : {},
                ]}
                underlineColorAndroid="transparent"
                keyboardType={'numeric'}
                onChangeText={onChangeText}
                editable={editable}
                autoFocus={autoFocus}
                value={value}
                maxLength={maxLength}
                placeholder={placeholder}
                ref={onRefInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
            />
        )
    }

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Phone Field ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderPhoneField() {
        const {
            autoFocus,
            editable,
            label,
            maxLength,
            value,
            placeholder,
            textAlign,
            returnKeyType,
            onRefInput,
            onChangeText,
            onSubmitEditing,
        } = this.props;

        return (
            <TextInput
                style={[
                    styles.textInput,
                    label && label.length > 0 ? {height: 40} : {},
                    textAlign ? {textAlign: textAlign} : {},
                ]}
                underlineColorAndroid="transparent"
                keyboardType="phone-pad"
                onChangeText={onChangeText}
                value={value}
                autoFocus={autoFocus}
                editable={editable}
                maxLength={maxLength}
                placeholder={placeholder}
                ref={onRefInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
            />
        )
    }

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Email Field ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderEmailField() {
        const {
            autoFocus,
            editable,
            label,
            maxLength,
            placeholder,
            returnKeyType,
            textAlign,
            value,
            onRefInput,
            onSubmitEditing,
            onChangeText,
        } = this.props;

        return (
            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                    styles.textInput,
                    label && label.length > 0 ? {height: 40} : {},
                    textAlign ? {textAlign: textAlign} : {},
                ]}
                keyboardType="email-address"
                underlineColorAndroid="transparent"
                onChangeText={onChangeText}
                value={value}
                autoFocus={autoFocus}
                maxLength={maxLength}
                editable={editable}
                placeholder={placeholder}
                ref={onRefInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
            />
        )
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Password Field //////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderPasswordField() {
        const { displayPassword } = this.state;
        const {
            autoFocus,
            editable,
            label,
            textAlign,
            maxLength,
            value,
            placeholder,
            returnKeyType,
            onChangeText,
            onRefInput,
            onSubmitEditing,
        } = this.props;

        return (
            <TextInput
                textContentType="none"
                secureTextEntry={!displayPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                    styles.textInput,
                    label && label.length > 0 ? {height: 40} : {},
                    textAlign ? {textAlign: textAlign} : {},
                ]}
                maxLength={maxLength}
                autoFocus={autoFocus}
                underlineColorAndroid="transparent"
                onChangeText={onChangeText}
                value={value}
                editable={editable}
                placeholder={placeholder}
                ref={onRefInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
            />
        )
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Textview Field //////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    _renderTextviewField() {
        const {
            autoFocus,
            editable,
            maxLength,
            placeholder,
            value,
            returnKeyType,
            onRefInput,
            onChangeText,
            onSubmitEditing,
        } = this.props;

        return (
            <TextInput
                style={[styles.textView]}
                underlineColorAndroid="transparent"
                numberOfLines={6}
                multiline={true}
                maxLength={maxLength}
                autoFocus={autoFocus}
                onChangeText={onChangeText}
                value={value}
                editable={editable}
                placeholder={placeholder}
                ref={onRefInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
            />
        )
    }
}

const styles = StyleSheet.create({
    container: {
    },

    content: {
        borderWidth: 0.5,
        borderColor: 'white',
        paddingVertical: 2,
        borderRadius: 15,
        paddingHorizontal: 17,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.07,
        shadowRadius: 2,
        elevation: 2,
    },

    contentWithLabel: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#C9C9C9',
        marginBottom: 10,
    },

    labelText: {
        color: '#7D849A',
        fontSize: 14,
        marginBottom: 5,
    },

    prefixIconImage: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        position: 'absolute',
        left: 15,
        top: 17,
    },

    textInput: {
        fontSize: 16,
        height: 42,
        color: 'black',
    },

    hasShowButtonTextInput: {
        fontSize: 16,
        marginRight: 30,
        height: 42,
    },

    whiteText: {
        color: 'white',
    },

    grayText: {
        color: 'black',
    },

    forgotTextInput: {
        color: '#474747',
        paddingLeft: 5,
        fontSize: 17,
        paddingRight: 70,
        position: 'relative',
    },

    forgotButton: {
        position: 'absolute',
        right: 0,
    },

    forgotButtonText: {
        fontSize: 11,
        backgroundColor: '#0d4e6c',
        textTransform: 'uppercase',
        color: 'white',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5,
    },

    formField: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    eye_icon: {
        width: 21,
        height: 15,
        resizeMode: 'cover',
    },

    textView: {
        height: 105,
        color: 'black',
        textAlignVertical: 'top',
        fontSize: 16,
        marginVertical: 10,
    },

    boxContainer: {
        marginVertical: Platform.OS == 'ios' ? 4.5 : 0,
    },

    iconView: {
        left: 0,
        top: 7,
        position: 'absolute',
    },

    showPasswordButton: {
        position: 'absolute',
        right: 0,
        top: 12,
    },

    errorMessage: {
        color: '#ff0000',
        fontSize: 11,
        marginLeft: 20,
        marginTop: 5,
    },

    centerText: {
        textAlign: 'center',
    },

    dropdownIcon: {
        width: 10,
        height: 6,
        resizeMode: 'contain',
    },

    iconImage: {
        width: 18,
        height: 18,
        position: 'absolute',
        right: 20,
        top: 15,
    },
});


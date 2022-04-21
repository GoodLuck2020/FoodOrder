import json
from decimal import Decimal
import boto3

restaurantMenu = {
  "categories": [{
    "categoryName": "Mains",
    "timeServed": [""],
    "items": [{
      "itemName": "New Item",
      "itemDescription": "",
      "itemPrice": 0.0,
      "picture": "",
      "ingredients": "",
      "available": True,
      "options": [{
        "optionTitle": "",
        "optionList": [{
          "optionName": "",
          "optionPrice": 0.0
        }],
        "minimum": 0,
        "maximum": 1
      }],
      "typeTags": [""],
      "additionalHealthInfo": "",
      "cityTax": 0.0
    }]
  }],
  "defaultCityTax": 0.0
}
restaurantProfile = {
  "id": 1,
  "restaurantInfo": {
    "restaurantName": "",
    "restaurantAddress": "",
    "hoursOfOperation": {
      "mondayHours": {
        "mondayOpen": "",
        "mondayClosed": ""
      },
      "tuesdayHours": {
        "tuesdayOpen": "",
        "tuesdayClosed": ""
      },
      "wednesdayHours": {
        "wednesdayOpen": "",
        "wednesdayClosed": ""
      },
      "thursdayHours": {
        "thursdayOpen": "",
        "thursdayClosed": ""
      },
      "fridayHours": {
        "fridayOpen": "",
        "fridayClosed": ""
      },
      "saturdayHours": {
        "saturdayOpen": "",
        "satudayClosed": ""
      },
      "sundayHours": {
        "sundayOpen": "",
        "sundayClosed": ""
      }
    },
    "restaurantType": {
      "typeTags": [
        "italian",
        "fastFood",
        "pizza",
        "burger"
      ],
      "food": True,
      "drink": True
    }
  },
  "deliveryOptions": {
    "flatFee": 0.00,
    "flatFeeRadius": 5.0,
    "additionalDeliveryFee": 0.0,
    "maxRadius": 10.0
  },
  "displayItem": {
    "itemName": "",
    "itemPicture": "",
    "itemCategory": ""
  }
}

customerProfile = {
  "id": "",
  "customerInfo": {
    "username": "",
    "picture": "",
    "customerName": {
      "firstName": "",
      "lastName": ""
    },
    "customerAddress": {
      "default": "",
      "savedAddresses": [
        {
          "address": "",
          "zip": "",
          "state": ""
        },
        {
          "address": "",
          "zip": "",
          "state": ""
        }
      ]
    },
    "contactInformation": {
      "emailAddress": "",
      "contactNumber": {
        "phoneNumber": "",
        "preferredContactMethod": [
          "text",
          "call"
        ]
      }
    }
  },
  "paymentOptions": {
    "default": {
      "cardType": "",
      "cardNumber": "",
      "nameOnCard": "",
      "cvv": "",
      "expirationMonth": 0,
      "expirationYear": 0
    },
    "cards": [
      {
        "cardType": "",
        "cardNumber": "",
        "nameOnCard": "",
        "cvv": "",
        "expirationMonth": "",
        "expirationYear": ""
      },
      {
        "cardType": "",
        "cardNumber": "",
        "nameOnCard": "",
        "cvv": "",
        "expirationMonth": "",
        "expirationYear": ""
      }
    ]
  },
  "favorites": []
}



def lambda_handler(event, context):
    incoming_id = event['incoming_Id']
    response = get_user_id(incoming_id)
    return response

def get_user_id(cognito_id, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('userLookup')
    response = table.get_item(
        Key={
            'CognitoId': cognito_id
        }
    )
    if 'Item' in response:
        if response['Item']['isRestaurant']:
            return find_restaurant(response['Item']['userId'])
        else:
            return find_customer(response['Item']['userId'])
    else:
        return create_new_user(cognito_id)

    
def find_customer(customer_id, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource('dynamodb')
        
    table = dynamodb.Table('Customers')
    response = table.get_item(
        Key={
            'CustomerId': customer_id
        }
    )
    return json.dumps({
        "userData":response['Item'],
        "id": customer_id,
        "restaurant": False,
    })
    
def find_restaurant(restaurant_id, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource('dynamodb')
        
    table = dynamodb.Table('Restaurants')
    response = table.get_item(
        Key={
            'RestaurantId': restaurant_id
        }
    )
    return json.dumps({
        "userData":response['Item'],
        "id": restaurant_id,
        "restaurant": True,
    })

import uuid    
def create_new_user(cognito_id, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource('dynamodb')
    user_id = str(uuid.uuid1())
    table = dynamodb.Table('Customers')
    response = table.put_item(
       Item={
            'CustomerId': user_id,
            'customerInfo': customerProfile
        }
    )
    update_user_lookup(cognito_id, user_id)
    return find_customer(user_id)

def update_user_lookup(cognito_id, user_id, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource('dynamodb')
        
    table = dynamodb.Table('userLookup')
    response = table.put_item(
       Item={
            'CognitoId': cognito_id,
            'isRestaurant': False,
            'userId': user_id
        }
    )
    return response
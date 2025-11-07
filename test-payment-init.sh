#!/bin/bash
set -e

API_KEY="pk_ab8917b5ecbb4869057bf86d46fb9cca735cba0a8339e1619fbfec1c412a6cb2"
REGION_ID="reg_01K917GBJZ2ZJMV6A4PARVCE1K"
BASE_URL="http://localhost:9000"
CART_ID="cart_01K9EB7FGZR0C18J4H8EYYMXC3"

echo "Getting cart details..."
CART=$(curl -s -X GET "${BASE_URL}/store/carts/${CART_ID}?fields=*payment_collection,*payment_collection.payment_sessions" \
  -H "x-publishable-api-key: ${API_KEY}")

echo "Cart payment collection:"
echo $CART | jq '.cart.payment_collection'

echo -e "\nAttempting payment session initiation (method 1: direct to payment-collections)..."
PAYMENT_RESP=$(curl -s -X POST "${BASE_URL}/store/payment-collections" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}" \
  -d "{\"cart_id\":\"${CART_ID}\"}")

echo $PAYMENT_RESP | jq '.'

echo -e "\nGetting updated cart..."
CART2=$(curl -s -X GET "${BASE_URL}/store/carts/${CART_ID}?fields=*payment_collection,*payment_collection.payment_sessions" \
  -H "x-publishable-api-key: ${API_KEY}")

echo "Cart payment collection after init:"
echo $CART2 | jq '.cart.payment_collection'

PAYMENT_COLLECTION_ID=$(echo $CART2 | jq -r '.cart.payment_collection.id')

if [ "$PAYMENT_COLLECTION_ID" != "null" ]; then
  echo -e "\n✅ Payment collection created: $PAYMENT_COLLECTION_ID"
  echo -e "\nNow initiating payment session..."
  
  SESSION_RESP=$(curl -s -X POST "${BASE_URL}/store/payment-collections/${PAYMENT_COLLECTION_ID}/payment-sessions" \
    -H "Content-Type: application/json" \
    -H "x-publishable-api-key: ${API_KEY}" \
    -d '{"provider_id":"pp_system_default","data":{}}')
  
  echo $SESSION_RESP | jq '.'
fi

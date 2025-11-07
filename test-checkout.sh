#!/bin/bash
set -e

API_KEY="pk_ab8917b5ecbb4869057bf86d46fb9cca735cba0a8339e1619fbfec1c412a6cb2"
REGION_ID="reg_01K917GBJZ2ZJMV6A4PARVCE1K"
BASE_URL="http://localhost:9000"

echo "Step 1: Create a new cart"
CART_RESPONSE=$(curl -s -X POST "${BASE_URL}/store/carts" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}" \
  -d "{\"region_id\":\"${REGION_ID}\"}")

CART_ID=$(echo $CART_RESPONSE | jq -r '.cart.id')
echo "Created cart: $CART_ID"

echo -e "\nStep 2: Add a product to cart (using first available product)"
PRODUCTS=$(curl -s -X GET "${BASE_URL}/store/products?limit=1" \
  -H "x-publishable-api-key: ${API_KEY}")
VARIANT_ID=$(echo $PRODUCTS | jq -r '.products[0].variants[0].id')
echo "Adding variant: $VARIANT_ID"

curl -s -X POST "${BASE_URL}/store/carts/${CART_ID}/line-items" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}" \
  -d "{\"variant_id\":\"${VARIANT_ID}\",\"quantity\":1}" > /dev/null

echo -e "\nStep 3: Update cart with shipping address"
curl -s -X POST "${BASE_URL}/store/carts/${CART_ID}" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}" \
  -d '{
    "email": "test@example.com",
    "shipping_address": {
      "first_name": "John",
      "last_name": "Doe",
      "address_1": "123 Main St",
      "city": "San Francisco",
      "province": "CA",
      "postal_code": "94102",
      "country_code": "us",
      "phone": "555-1234"
    }
  }' > /dev/null

echo -e "\nStep 4: Get shipping options"
SHIPPING_OPTIONS=$(curl -s -X GET "${BASE_URL}/store/shipping-options?cart_id=${CART_ID}" \
  -H "x-publishable-api-key: ${API_KEY}")

echo "Available shipping options:"
echo $SHIPPING_OPTIONS | jq '.shipping_options[] | {id, name, amount}'

SHIPPING_OPTION_ID=$(echo $SHIPPING_OPTIONS | jq -r '.shipping_options[0].id')
echo -e "\nSelected shipping option: $SHIPPING_OPTION_ID"

echo -e "\nStep 5: Set shipping method"
curl -s -X POST "${BASE_URL}/store/carts/${CART_ID}/shipping-methods" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}" \
  -d "{\"option_id\":\"${SHIPPING_OPTION_ID}\"}" > /dev/null

echo -e "\nStep 6: Initiate payment session"
curl -s -X POST "${BASE_URL}/store/payment-collections" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}" \
  -d "{\"cart_id\":\"${CART_ID}\",\"provider_id\":\"pp_system_default\"}" > /dev/null

echo -e "\nStep 7: Complete the order"
ORDER_RESPONSE=$(curl -s -X POST "${BASE_URL}/store/carts/${CART_ID}/complete" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${API_KEY}")

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.order.id // .type')
echo "Order result: $ORDER_ID"

if [[ "$ORDER_ID" == "order" ]] || [[ "$ORDER_ID" == order_* ]]; then
  echo -e "\n✅ Checkout flow completed successfully!"
else
  echo -e "\n❌ Checkout failed"
  echo $ORDER_RESPONSE | jq '.'
fi

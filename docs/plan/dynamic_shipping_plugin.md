# Dynamic Shipping Calculation Module Plan (Medusa v2)

## 1. Overview
This plan outlines the implementation of a **Dynamic Shipping Calculation Module** for the Medusa v2 application. The goal is to calculate shipping costs automatically based on:
1.  **Cart Items**: Weight, quantity, subtotal, or specific tags.
2.  **User Location**: Country, Province/State, Zip Code (from the Shipping Address).

## 2. Architecture: Medusa v2 Module
In Medusa v2, custom fulfillment logic is implemented as a **Module** that registers a **Fulfillment Provider**.

### 2.1. Module Location
We will implement this as a **local module** within the existing Medusa application for simplicity and direct integration.
- **Path**: `apps/medusa/src/modules/dynamic-shipping`

### 2.2. Key Components
1.  **`service.ts`**: The core logic class extending `AbstractFulfillmentProviderService` (provided by Medusa framework) or implementing the fulfillment interface.
    - **`calculatePrice`**: The critical method where the cost calculation logic resides.
    - **`canCalculate`**: Returns `true` to signal Medusa that this provider handles real-time calculation.
    - **`validateFulfillmentData`**: Ensures the address and cart data are sufficient.
    - **`getFulfillmentOptions`**: Returns available methods (e.g., "Standard", "Express").
2.  **`index.ts`**: Module definition and export.
3.  **`medusa-config.ts`**: Configuration update to register the module.

## 3. Calculation Logic (The "Algorithm")
To make the system flexible, we will implement a configuration-based approach (or a mockable interface) for the calculation rules.

### Supported Scenarios (Examples)
1.  **Flat Rate per Item**: $5 base + $2 per extra item.
2.  **Weight Based**:
    - 0-5kg: $10
    - 5-20kg: $20
    - >20kg: $50
3.  **Regional Surcharge**:
    - Base price + $10 if Region is "Remote" (determined by Zip Code).

*Initial implementation will use a hardcoded strategy pattern to allow easy replacement with database-stored rules later.*

## 4. Implementation Steps

### Step 1: Scaffold the Module
Create the directory structure:
```bash
apps/medusa/src/modules/dynamic-shipping/
├── index.ts
├── service.ts
└── providers/
    └── dynamic-shipping.ts
```

### Step 2: Implement the Fulfillment Service
The service will implement the `calculatePrice` method.
```typescript
// Pseudo-code for service.ts
class DynamicShippingProvider extends AbstractFulfillmentProviderService {
  static identifier = "dynamic-shipping"

  async calculatePrice(optionData, data, cart): Promise<CalculatedShippingOptionPrice> {
    const items = cart.items
    const address = cart.shipping_address
    
    // 1. Calculate Total Weight
    const weight = items.reduce((sum, item) => sum + (item.variant.weight || 0) * item.quantity, 0)
    
    // 2. Determine Zone based on Address
    const zone = this.getZone(address.country_code, address.province)
    
    // 3. Lookup Rate
    const price = this.calculateRate(weight, zone)
    
    return {
      calculated_amount: price,
      is_calculated_price_tax_inclusive: false
    }
  }
  
  // ... implement other required methods (create, cancel, etc.)
}
```

### Step 3: Register the Module
Update `apps/medusa/medusa-config.ts`:
```typescript
module.exports = defineConfig({
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: { 
        providers: [
           { resolve: "./src/modules/dynamic-shipping", id: "dynamic-shipping", options: { ... } }
        ]
      }
    }
  ]
})
```

### Step 4: Admin Configuration
1.  Start the Medusa backend.
2.  Go to **Settings > Regions**.
3.  Select a Region.
4.  Add a **Shipping Option**.
5.  Select the "Dynamic Shipping" provider.
6.  **Crucial**: Set the "Price Type" to **Calculated**. This ensures Medusa calls `calculatePrice` at checkout instead of using a static database price.

### Step 5: Testing
1.  Create a test script or use the Storefront to build a cart.
2.  Set a shipping address.
3.  Verify that the shipping method response includes the dynamically calculated price.

## 5. Future Enhancements
- **Rule Engine UI**: Create a custom Admin UI Widget/Route to allow merchants to define weight brackets and zones via the dashboard (storing rules in a custom table).
- **External API Integration**: Connect `calculatePrice` to FedEx/UPS/DHL APIs for real-time carrier rates.

## 6. Implementation Notes (Updated)
The module has been implemented at `apps/medusa/src/modules/dynamic-shipping`.
- **Service**: `apps/medusa/src/modules/dynamic-shipping/service.ts`
- **Config**: `apps/medusa/medusa-config.ts` updated to include `[Modules.FULFILLMENT]`.
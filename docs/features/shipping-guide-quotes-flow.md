# Feature Specification: Shipping Guide Quotes Integration in Checkout Flow

**File Location:** `docs/features/shipping-guide-quotes-flow.md`

**Status:** Approved for Frontend Implementation

**Target Runtime:** Server + Client React (Next.js 16 App Router)

**Domain Context:** E-commerce customer-facing checkout pipeline

---

## 1. Overview & Objective

This feature integrates a multi-carrier shipping quotation, selection, and serialization mechanism into the storefront's authenticated multi-step checkout workflow (`src/app/checkout/`).

When a customer successfully selects or creates a shipping address during checkout, the frontend must dynamically request real-time delivery rate packages, render the carrier options grouped by physical shipments, inject the chosen shipping price into the cart state context as an analytical service line item, and explicitly lock the selected carrier token configurations back into the backend core database via Server Actions before moving forward to the payment processing view.

---

## 2. Complete Frontend-Driven Workflow

The interaction model consists of four sequential phases executed entirely through the frontend runtime architecture:

### Phase 1 — Quote Request

* **Trigger:** The customer completes the address configuration step (`shipping-address-step.tsx`) and an active `address_id` is verified.


* **Action:** The component triggers a Server Action (`getShippingQuotesAction`) that routes to the REST adapter layer.


* **Network Call:** `POST /api/ecommerce/me/cart/<cart_id>/shipping/quote/`
* **Payload:** `{ "address_id": "<uuid>" }`

### Phase 2 — UI Presentation & Free Shipping Guard

* **Action:** The component handles the incoming collection of quotes and groups them inside the presentation tier by `shipment_id` to fully support multi-box or split-shipment configurations natively.
* **Free Shipping Rules Engine:** If the server response returns `free_shipping: true`, the frontend **must hide all monetary prices** from the customer view interface and explicitly display the label **"Envío gratis"**. Internally, the React component state must completely preserve the authentic, hidden rate payload fields (`provider`, `amount`, `object_id`) because the operational warehouse admin still needs access to the factual cost parameters later when printing the final label.



### Phase 3 — Cart Item Injection

* **Trigger:** The customer clicks on their preferred shipping carrier option (e.g., DHL).
* **Action:** The frontend dynamically invokes the repository's existing cart strategy injection workflow (`AddItemStrategyFactory`) to append a non-physical `service` product instance acting as the delivery fee carrier into the cart.


* **Price Parameter Mapping:**
* If `free_shipping: true`, the frontend forces the addition with an explicit `price = 0`.
* If `free_shipping: false`, the frontend passes the literal `price = rate.amount`.


* **Result:** The execution updates `cart.grand_total` atomically across all synchronized sidebar aggregates and price layout displays.



### Phase 4 — Persist & Lock Selected Rate

* **Trigger:** The customer confirms their chosen selection and submits the delivery step module.
* **Action:** The frontend loops through all shipment objects present in the checkout state and executes a sequential execution block invoking the Server Action `setShipmentRatesAction` to permanently commit the selection to the database.
* **Network Call:** `PATCH /api/ecommerce/me/shipping/<shipment_id>/set/rate/` for each individual shipment.
* **Result:** The Shipment instance states transition dynamically from `kind='quote'` to `kind='purchase'`, reserving the shipping slot in the ERP workspace before navigating the user to `payment-step.tsx`.



---

## 3. API Contract & Strongly Typed Schemas

All new data definitions must be strictly appended to `src/lib/swipall/types/types.ts`.

```typescript
export interface ShippingRate {
  provider: string;
  amount: number;
  object_id: number;
  [key: string]: any; // Allow for extra metadata fields from third-party APIs
}

export interface ShipmentQuote {
  id: string; // UUID of the shipment record
  weight: number;
  rates: ShippingRate[];
}

export interface InterfaceApiShippingQuoteResponse {
  shipments: ShipmentQuote[];
  free_shipping: boolean;
}

```

---

## 4. Architectural Layer Mapping

To comply with the non-negotiable architectural principles of the codebase, the integration must be mapped across the three-layer API structure:

### A. Raw API Layer (`src/lib/swipall/api.ts`)

No internal imports or authentication context injection happens here.

* Leverage existing `post` and `patch` abstract methods.



### B. Authenticated Server Layer (`src/lib/swipall/api-server.ts`)

* Acts as the server-only runtime gateway that injects the required `httpOnly` customer JWT token (`swipall-auth-token`) transparently via `useAuthToken: true` context passing.



### C. Domain REST Adapter Layer (`src/lib/swipall/rest-adapter.ts`)

This layer is the sole point of entry for pages and server actions. Two new domain wrapper methods must be added:

```typescript
/**
 * Fetches multi-carrier shipping quotes for a given cart and address.
 */
export async function getShippingQuotes(
  cartId: string, 
  addressId: string
): Promise<InterfaceApiShippingQuoteResponse> {
  return await apiServer.post<InterfaceApiShippingQuoteResponse>(
    `/api/ecommerce/me/cart/${cartId}/shipping/quote/`,
    { address_id: addressId },
    { useAuthToken: true }
  );
}

/**
 * Commits and locks a chosen rate option to a specific shipment ID.
 */
export async function setShipmentRate(
  shipmentId: string, 
  rate: ShippingRate
): Promise<void> {
  await apiServer.patch(
    `/api/ecommerce/me/shipping/${shipmentId}/set/rate/`,
    { rate },
    { useAuthToken: true }
  );
}

```

### D. Server Actions Layer (`src/app/checkout/actions.ts`)

The secure, asynchronous boundary layer connecting UI elements with domain services.

* **`getShippingQuotesAction(addressId: string)`**: Resolves active server context cookies, extracts `cartId`, and requests real-time carrier packages.


* **`setShipmentRatesAction(shipments: { shipmentId: string; rate: ShippingRate }[])`**: Performs sequential batch mapping of selected shipment carrier tokens before returning status flags.

---

## 5. UI & Component Component Modifications

### `src/app/checkout/delivery-step.tsx`

This React Client Component requires a functional architectural refactoring to govern state interactions:

1. **Skeleton States:** While awaiting the resolution of `getShippingQuotesAction`, the component must immediately suppress incomplete states and render placeholder modules imported directly from `src/components/shared/skeletons/`.


2. **Dynamic Forms Binding:** Iterate over the `shipments` array. If multiple instances are provided by the network, display separated operational rows for each separate package structure.
3. **Price Calculation Guardrail:** The presentation layer component must **never compute, mutate, or alter prices natively**. It must render exactly the value of `rate.amount` returned by the server, unless overridden globally by the frontend checkout runtime evaluation when checking the `free_shipping: true` parameter constraint.


4. **Step Progression Guard:** The button triggering navigation to the next index (`payment-step.tsx`) must remain disabled until a valid selection choice has been allocated to every active shipment index container.



---

## 6. Implementation Guardrails Verification Checklist

* [ ] **Zero Client-Side Direct Fetches:** No raw fetch implementations targeting `/api/ecommerce/*` can exist within components. Everything must travel through `actions.ts`.


* [ ] **Strict Session Tracking:** Address token resolution and shipment operations must remain fully scoped within the boundaries of the server-backed browser cookie runtime parameters (`swipall-cart-id`).


* [ ] **Type System Safety compliance:** The codebase must execute successfully without throwing type layout structural warnings when calling the verification runner script: `npm run check-types`.


* [ ] **No Trace Logs:** Ensure absolutely no `console.log` statements or leftover commented-out blocks remain in the execution pathways of modified files.
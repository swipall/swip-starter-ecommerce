# Merida mayoreo — Purpose

> This storefront is the **customer-facing purchase interface** of the Swipall commerce platform. Its job is to translate the Swipall REST API into a fast, reliable shopping experience — from product discovery to confirmed payment — without requiring the customer to leave a single flow.

---

## What does this frontend do?

### 1. Product Discovery

The primary entry point for customers browsing the catalog.

- **Home page**: Renders dynamic sections (banners, sliders, category groups, product carousels, custom HTML) driven by backend configuration, without hardcoding layout.
- **Collections**: Browsable category pages with faceted filtering and sorting.
- **Search**: Full-text product search with filter controls.
- **Product detail**: Variant selector, image gallery, pricing display (`price` as final price, `web_price` as crossed-out reference), stock awareness, and extra/compound material selection.

### 2. Cart

Session-based shopping cart persisted via a cookie (`swipall-cart-id`).

- Add, update, and remove items.
- Strategy-based add-to-cart: simple products merge quantity; compound products always create a new line (different material combinations are distinct items).
- Stock validation on add: throws if requested quantity exceeds available stock.
- Promotion code application and removal.
- Cart repricing when the customer's price list changes (e.g., after login).

### 3. Checkout

Multi-step checkout flow gated behind authentication.

1. **Shipping address** — select a saved address or enter a new one.
2. **Delivery method** — choose from available shipping options.
3. **Payment** — select payment method; MercadoPago integration for online payment.
4. **Review** — final confirmation before placing the order.

After payment, the `/shop/mp/order/` route handles the MercadoPago callback, validates order status, and cleans up the cart session.

### 4. Customer Account

Full self-service account management, accessible only to authenticated users.

- **Profile**: Edit name, email (with re-verification), and password.
- **Addresses**: Create, edit, delete, and set default shipping/billing addresses.
- **Orders**: Paginated order history with detailed order views and status tracking.

### 5. Authentication

Email/password authentication with JWT session management.

- Registration with email verification flow (`/verify-pending` → `/verify`).
- Login/logout with JWT stored in `httpOnly` cookies.
- Password reset via email token.
- Email address change with re-verification.

### 6. Pricing by Customer

Customers belong to price lists that determine their final prices and minimum order amounts.

- Price list is detected on login and kept in sync via tab-visibility events.
- When a price list changes, the cart is repriced automatically and the page is refreshed.
- Minimum amount enforcement is applied at cart and checkout.

---

## Why it exists

### 1. Owned customer purchase channel

Swipall provides the ERP and product catalog. This storefront gives merchants a branded, self-service purchase channel so customers can buy directly without involving a sales agent for every transaction.

### 2. B2B pricing model

The storefront is designed for a B2B context where different customers see different prices. Price lists are customer-specific, and the UI reflects the correct price at every step — product listing, cart, and checkout — without exposing other tiers.

### 3. Reduce agent workload

By moving product browsing, cart management, checkout, and order tracking to a self-service interface, sales agents are freed from manually processing routine orders.

---

## What this frontend does NOT do

- **It is not an admin panel.** Product catalog, pricing rules, and customer accounts are managed in the Swipall backend. This frontend is read-only for catalog data.
- **It is not a CRM or inbox.** Conversation management, lead tracking, and agent assignment live in `swip-flow`.
- **It does not call the ERP directly.** All data flows through the Swipall REST API (`SWIPALL_SHOP_API_URL`).
- **It does not process payments directly.** Payment is handled by MercadoPago; the frontend only creates a preference and handles the redirect callback.
- **It is not a content management system.** CMS pages (`/page/[slug]`) and home section configuration are defined in the backend.

---

## Key domain concepts

### Product kinds

| Kind | Behavior |
|---|---|
| `product` | Standard single SKU |
| `group` | Multiple variants (e.g., sizes, colors) — customer selects a variant |
| `compound` | Has selectable extra materials; each material combination is a distinct cart line |
| `service` | Non-physical deliverable |

### Price fields

- **`price`** — the final price the customer pays.
- **`web_price`** — the reference/original price, shown crossed out when higher than `price`.

### Cart session

Cart is anonymous until the customer logs in. On login, `setCustomerToCart` attaches the customer to the cart and triggers a reprice.

### Price list sync

When a customer's price list changes (detected on tab focus), `usePriceListReprice` calls `repriceCart` and refreshes the page to ensure all displayed prices are up to date.

---

## External dependencies

| Dependency | Role |
|---|---|
| Swipall REST API | All product, cart, order, and customer data |
| MercadoPago | Online payment processing |
| CDN (`mmcb.b-cdn.net`, `mmcbv4.b-cdn.net`) | Product image delivery |
| Next.js ISR (`/api/revalidate`) | On-demand cache invalidation triggered by the backend |

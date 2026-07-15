<p align="center">
  <a href="https://swipall.io">
    <img alt="Swipall logo" height="60" width="auto" src="https://a.storyblok.com/f/328257/699x480/8dbb4c7a3c/logo-icon.png/m/0x80">
  </a>
</p>
<h1 align="center">
  Swipall Next.js Storefront (REST API)
</h1>
<h3 align="center">
    A Next.js 16 storefront for Swipall REST API with JWT authentication
</h3>
<p align="center">
 Migrated from Vendure GraphQL to Swipall REST API with modern authentication patterns.
</p>

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Swipall backend running (Django REST API)

### Environment Configuration

Copy `.env.example` to `.env.local` and update with your Swipall backend URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
SWIPALL_SHOP_API_URL=http://localhost:3001/api
```

### Installation

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to see your storefront.

## Architecture

### REST API Integration
- **Client:** [src/lib/swipall/api.ts](src/lib/swipall/api.ts) - HTTP client with JWT support
- **Adapter:** [src/lib/swipall/rest-adapter.ts](src/lib/swipall/rest-adapter.ts) - Domain functions for products, cart, checkout, orders, auth
- **Caching:** [src/lib/swipall/cached.ts](src/lib/swipall/cached.ts) - Next.js App Router data caching with `cacheLife` and `cacheTag`

### Authentication
- JWT tokens stored in httpOnly cookies (secure, SameSite=Lax)
- Bearer token support for API requests
- Server Actions for secure mutations
- Session management with cookie-based JWT

## Features

**Authentication & Accounts**
- Customer registration with email verification
- Login/logout with session management
- Password reset & change password
- Email address updates with verification

**Customer Account**
- Profile management (name, email, password)
- Address management (create, update, delete, set default)
- Order history with pagination & detailed order views

**Product Browsing**
- Collections & featured products
- Product detail pages with variants & galleries
- Full-text search with faceted filtering
- Pagination & sorting

**Shopping Cart**
- Add/remove items, adjust quantities
- Promotion code support
- Real-time cart updates with totals

**Checkout**
- Multi-step flow: shipping address, delivery method, payment, review
- Saved address selection
- Shipping method selection
- Payment integration

**Order Management**
- Order confirmation page
- Order tracking with status
- Detailed order information

## Roadmap

- Multi-currency support (coming soon)
- Multi-language with next-intl (coming soon)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details

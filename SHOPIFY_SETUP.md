# RecycleRabbit Shopify Integration

A single-product ecommerce store built with Shopify Storefront API and Express.js.

## Setup

### Prerequisites
- Node.js 16+
- Shopify store with products
- Storefront API access token

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Shopify credentials:
```bash
cp .env.example .env
```

3. Get your Shopify credentials:
   - **SHOPIFY_STORE**: `your-store.myshopify.com`
   - **SHOPIFY_STOREFRONT_TOKEN**: Generate in Shopify Admin > Apps > App and sales channel settings > Develop apps
   - **SHOPIFY_PRODUCT_ID**: Find in Shopify Admin > Products (format: `gid://shopify/Product/123456`)
   - **SHOPIFY_VARIANT_ID**: Find in product details (format: `gid://shopify/ProductVariant/789012`)

### Running

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

Server runs on `http://localhost:3000`

## Features

- Single product display with image, title, description, and price
- Quantity selector (up/down buttons and input field)
- Cart creation and redirect to Shopify checkout
- Responsive design with mobile support
- Error handling and loading states

## API Endpoints

- `GET /api/product` - Fetch product details
- `POST /api/cart` - Create cart and get checkout URL (body: `{ quantity: number }`)

## Notes

- The product must have at least one variant in Shopify
- Checkout redirects to Shopify's hosted checkout
- All transactions are handled by Shopify Payments

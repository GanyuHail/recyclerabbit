import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const PRODUCT_ID = process.env.SHOPIFY_PRODUCT_ID;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const shopifyGraphQL = async (query, variables = {}) => {
  const response = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
};

// Fetch product details
app.get('/api/product', async (req, res) => {
  try {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    `;
    const data = await shopifyGraphQL(query, { id: PRODUCT_ID });
    res.json(data.product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create cart and get checkout URL
app.post('/api/cart', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const createCartQuery = `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;

    const variantId = process.env.SHOPIFY_VARIANT_ID;
    if (!variantId) {
      return res.status(500).json({ error: 'SHOPIFY_VARIANT_ID not configured' });
    }

    const data = await shopifyGraphQL(createCartQuery, {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: parseInt(quantity, 10),
          },
        ],
      },
    });

    const checkoutUrl = data.cartCreate.cart.checkoutUrl;
    res.json({ checkoutUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

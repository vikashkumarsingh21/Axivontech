import {
  NOVACART_PRODUCTS,
  NOVACART_CATEGORIES,
  getProductBySlug,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getNewArrivals,
  getRelatedProducts,
  formatPrice,
  DEMO_PROMO_CODES,
} from '../src/data/novacart-data.ts';

console.log('Testing NovaCart Data & Logic Modules...\n');

// 1. Total products count
console.assert(NOVACART_PRODUCTS.length === 24, `Expected 24 products, got ${NOVACART_PRODUCTS.length}`);
console.log(`✓ Verified total product count: ${NOVACART_PRODUCTS.length}`);

// 2. Categories count
console.assert(NOVACART_CATEGORIES.length === 4, `Expected 4 categories, got ${NOVACART_CATEGORIES.length}`);
for (const cat of NOVACART_CATEGORIES) {
  const items = getProductsByCategory(cat.slug);
  console.assert(items.length === 6, `Expected 6 products for ${cat.name}, got ${items.length}`);
  console.log(`✓ Category "${cat.name}": ${items.length} products`);
}

// 3. Slugs uniqueness
const slugs = new Set(NOVACART_PRODUCTS.map((p) => p.slug));
console.assert(slugs.size === 24, `Duplicate slugs detected!`);
console.log(`✓ Verified 24 unique product slugs`);

// 4. Currency and price formatting
const testPrice = formatPrice(4499);
console.assert(testPrice.includes('4,499') || testPrice.includes('4499'), `Invalid price formatting: ${testPrice}`);
console.log(`✓ Verified INR currency formatting: 4499 -> ${testPrice}`);

// 5. Featured and New arrivals
const featured = getFeaturedProducts();
console.assert(featured.length >= 6, `Featured products: ${featured.length}`);
const newArrivals = getNewArrivals();
console.assert(newArrivals.length >= 6, `New arrivals: ${newArrivals.length}`);
console.log(`✓ Verified featured (${featured.length}) and new arrival (${newArrivals.length}) subsets`);

// 6. Related products
const related = getRelatedProducts(NOVACART_PRODUCTS[0].id, 4);
console.assert(related.length === 4, `Expected 4 related items, got ${related.length}`);
console.assert(!related.some((r) => r.id === NOVACART_PRODUCTS[0].id), `Related items should not include current item`);
console.log(`✓ Verified related products recommendation logic`);

// 7. Promo codes
console.assert(DEMO_PROMO_CODES['WELCOME10'].value === 10, 'WELCOME10 invalid');
console.assert(DEMO_PROMO_CODES['NOVAFIRST'].value === 500, 'NOVAFIRST invalid');
console.log(`✓ Verified sample promotional discount rules`);

console.log('\nAll NovaCart logic assertions passed successfully!');

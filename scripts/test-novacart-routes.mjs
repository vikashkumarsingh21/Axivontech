const baseUrl = 'http://localhost:3001';

const routes = [
  // 1. Core NovaCart routes
  '/demo-projects/ecommerce/novacart',
  '/demo-projects/ecommerce/novacart/shop',
  '/demo-projects/ecommerce/novacart/category/fashion-accessories',
  '/demo-projects/ecommerce/novacart/category/bags-travel',
  '/demo-projects/ecommerce/novacart/category/home-living',
  '/demo-projects/ecommerce/novacart/category/tech-accessories',
  '/demo-projects/ecommerce/novacart/products/minimalist-matte-chrono-watch',
  '/demo-projects/ecommerce/novacart/products/aeroflex-commuter-backpack-22l',
  '/demo-projects/ecommerce/novacart/products/ceramic-pour-over-carafe-dripper',
  '/demo-projects/ecommerce/novacart/products/noise-isolating-studio-headphones',
  '/demo-projects/ecommerce/novacart/search',
  '/demo-projects/ecommerce/novacart/wishlist',
  '/demo-projects/ecommerce/novacart/cart',
  '/demo-projects/ecommerce/novacart/login',
  '/demo-projects/ecommerce/novacart/register',
  '/demo-projects/ecommerce/novacart/checkout',
  '/demo-projects/ecommerce/novacart/account',
  '/demo-projects/ecommerce/novacart/order-confirmation',

  // 2. Existing Demo Projects & Catalogue
  '/demo-projects',
  '/demo-projects/business/corporatepro',
  '/demo-projects/healthcare/medicare',
  '/demo-projects/food/foodiehub',
  '/demo-projects/education/edusmart',

  // 3. Main Axivon site
  '/',
  '/contact?project=NovaCart',
];

async function runTests() {
  console.log(`Running comprehensive route verification against ${baseUrl}...\n`);
  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      const text = await res.text();
      if (res.status === 200) {
        console.log(`✓ [200 OK] ${route} (${(text.length / 1024).toFixed(1)} KB)`);
        passed++;
      } else {
        console.error(`✗ [HTTP ${res.status}] ${route}`);
        failed++;
      }
    } catch (err) {
      console.error(`✗ [FETCH ERROR] ${route}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${routes.length} total routes.`);
  if (failed > 0) process.exit(1);
}

runTests();

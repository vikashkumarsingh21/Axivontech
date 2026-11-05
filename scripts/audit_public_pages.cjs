const fs = require('fs');
const path = require('path');

const publicPages = [
  'src/app/page.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/pricing/page.tsx',
  'src/app/reviews/page.tsx',
  'src/app/industries/page.tsx',
  'src/app/download/page.tsx',
  'src/app/services/page.tsx',
  'src/app/services/web-development/page.tsx',
  'src/app/services/mobile-app-development/page.tsx',
  'src/app/services/ai-solutions/page.tsx',
  'src/app/services/custom-software-development/page.tsx',
  'src/app/services/cloud-solutions/page.tsx',
  'src/app/services/digital-marketing/page.tsx',
  'src/app/services/seo-services/page.tsx',
  'src/app/services/ui-ux-design/page.tsx',
  'src/app/services/automation/page.tsx',
  'src/app/services/robotics-iot/page.tsx',
  'src/app/portfolio/page.tsx',
  'src/app/portfolio/[slug]/page.tsx',
  'src/app/demo-projects/page.tsx',
  'src/app/demo-projects/[slug]/page.tsx',
  'src/app/demo-projects/business/corporatepro/page.tsx',
  'src/app/demo-projects/ecommerce/novacart/page.tsx',
  'src/app/demo-projects/education/edusmart/page.tsx',
  'src/app/demo-projects/fitness/fitzone/page.tsx',
  'src/app/demo-projects/food/foodiehub/page.tsx',
  'src/app/demo-projects/healthcare/medicare/page.tsx',
  'src/app/demo-projects/real-estate/estatevista/page.tsx',
  'src/app/demo-projects/saas/leadpilot/page.tsx',
  'src/app/careers/page.tsx',
  'src/app/careers/[slug]/page.tsx',
  'src/app/careers/privacy/page.tsx',
  'src/app/careers-privacy/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/business-partner/page.tsx',
  'src/app/business-partner/apply/page.tsx',
  'src/app/business-partner/policy/page.tsx',
  'src/app/business-partner-terms/page.tsx',
  'src/app/broker-terms/page.tsx',
  'src/app/broker-program/terms/page.tsx',
  'src/app/partner-program/terms/page.tsx',
  'src/app/payment-terms/page.tsx',
  'src/app/legal/page.tsx',
  'src/app/legal/company-information/page.tsx',
  'src/app/privacy-policy/page.tsx',
  'src/app/privacy-requests/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/terms-and-conditions/page.tsx',
  'src/app/security-policy/page.tsx',
  'src/app/service-delivery-policy/page.tsx',
  'src/app/refund-cancellation-policy/page.tsx',
  'src/app/cookie-policy/page.tsx',
  'src/app/cookie-preferences/page.tsx',
  'src/app/ai-privacy-notice/page.tsx',
  'src/app/ai-usage/page.tsx',
  'src/app/acceptable-use-policy/page.tsx',
  'src/app/accessibility/page.tsx',
  'src/app/disclaimer/page.tsx',
  'src/app/intellectual-property/page.tsx',
  'src/app/lead/[referralCode]/page.tsx',
  'src/app/project/start/[referralCode]/page.tsx',
];

console.log('Checking existence of all ' + publicPages.length + ' public pages:');
let missingCount = 0;
for (const p of publicPages) {
  const full = path.join(process.cwd(), p);
  if (!fs.existsSync(full)) {
    console.error('MISSING FILE:', p);
    missingCount++;
  }
}
console.log('Missing public page files:', missingCount);

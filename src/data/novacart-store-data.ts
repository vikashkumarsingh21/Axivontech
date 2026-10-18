import { Product, NOVACART_PRODUCTS } from "./novacart-data";

export interface DemoOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
}

export type DemoOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface DemoOrder {
  id: string; // e.g. "AXV-ORD-8942"
  createdAt: string; // ISO date string
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: DemoOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: DemoOrderStatus;
  paymentMethod: string;
  paymentStatus: "PAID" | "PENDING";
}

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpend: number;
  joinedAt: string;
}

// Initial deterministic seeded demo orders
export const SEED_DEMO_ORDERS: DemoOrder[] = [
  {
    id: "AXV-ORD-9102",
    createdAt: "2026-10-15T14:32:00.000Z",
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    customerPhone: "+91 98765 43210",
    shippingAddress: {
      address: "42, 100 Feet Road, Indiranagar",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560038",
    },
    items: [
      {
        productId: "nc-prod-01",
        productName: "Minimalist Matte Chrono Watch",
        quantity: 1,
        price: 4499,
        variant: "Slate Black",
        image: "/images/demo-projects/novacart/watch-matte-chrono.jpg",
      },
    ],
    subtotal: 4499,
    shipping: 0,
    discount: 0,
    total: 4499,
    status: "PROCESSING",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
  },
  {
    id: "AXV-ORD-8854",
    createdAt: "2026-10-14T09:15:00.000Z",
    customerName: "Rohan Varma",
    customerEmail: "rohan.varma@example.com",
    customerPhone: "+91 98123 45678",
    shippingAddress: {
      address: "15B Cyber City, Phase 2",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122002",
    },
    items: [
      {
        productId: "nc-prod-07",
        productName: "Aeroflex Commuter Backpack 22L",
        quantity: 1,
        price: 5999,
        variant: "Matte Black",
        image: "/images/demo-projects/novacart/backpack-commuter.jpg",
      },
      {
        productId: "nc-prod-19",
        productName: "MagCharge 3-in-1 Wireless Stand",
        quantity: 1,
        price: 3799,
        variant: "Space Gray",
        image: "/images/demo-projects/novacart/tablet-stand.jpg",
      },
    ],
    subtotal: 9798,
    shipping: 0,
    discount: 500,
    total: 9298,
    status: "SHIPPED",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
  },
  {
    id: "AXV-ORD-8620",
    createdAt: "2026-10-12T18:40:00.000Z",
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    customerPhone: "+91 97654 32109",
    shippingAddress: {
      address: "88 Jubilee Hills, Road No. 36",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500033",
    },
    items: [
      {
        productId: "nc-prod-13",
        productName: "Artisanal Pour-Over Ceramic Set",
        quantity: 2,
        price: 2899,
        variant: "Warm Sand",
        image: "/images/demo-projects/novacart/ceramic-pourover.jpg",
      },
    ],
    subtotal: 5798,
    shipping: 0,
    discount: 0,
    total: 5798,
    status: "DELIVERED",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
  },
  {
    id: "AXV-ORD-8115",
    createdAt: "2026-10-08T11:20:00.000Z",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@example.com",
    customerPhone: "+91 99887 76655",
    shippingAddress: {
      address: "204 Sea Face Towers, Worli",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400018",
    },
    items: [
      {
        productId: "nc-prod-20",
        productName: "Studio ANC Wireless Headphones",
        quantity: 1,
        price: 8499,
        variant: "Obsidian",
        image: "/images/demo-projects/novacart/studio-headphones.jpg",
      },
    ],
    subtotal: 8499,
    shipping: 0,
    discount: 849,
    total: 7650,
    status: "DELIVERED",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
  },
];

// Initial deterministic seeded customers
export const SEED_DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "cust-01",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+91 98765 43210",
    city: "Bangalore",
    ordersCount: 1,
    totalSpend: 4499,
    joinedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "cust-02",
    name: "Rohan Varma",
    email: "rohan.varma@example.com",
    phone: "+91 98123 45678",
    city: "Gurugram",
    ordersCount: 1,
    totalSpend: 9298,
    joinedAt: "2026-08-15T11:30:00.000Z",
  },
  {
    id: "cust-03",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 97654 32109",
    city: "Hyderabad",
    ordersCount: 1,
    totalSpend: 5798,
    joinedAt: "2026-09-10T14:20:00.000Z",
  },
  {
    id: "cust-04",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 99887 76655",
    city: "Mumbai",
    ordersCount: 1,
    totalSpend: 7650,
    joinedAt: "2026-07-22T08:45:00.000Z",
  },
];

export const DEMO_STORAGE_KEYS = {
  ORDERS: "novacart_demo_orders_v1",
  PRODUCTS: "novacart_demo_products_v1",
  CUSTOMERS: "novacart_demo_customers_v1",
  CART: "novacart_demo_cart_v1",
  WISHLIST: "novacart_demo_wishlist_v1",
};

/**
 * Loads orders from localStorage, fallback to SEED_DEMO_ORDERS
 */
export function getStoredDemoOrders(): DemoOrder[] {
  if (typeof window === "undefined") return SEED_DEMO_ORDERS;
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(
        DEMO_STORAGE_KEYS.ORDERS,
        JSON.stringify(SEED_DEMO_ORDERS)
      );
      return SEED_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DEMO_ORDERS;
  }
}

/**
 * Saves orders to localStorage
 */
export function saveStoredDemoOrders(orders: DemoOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEMO_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Loads products from localStorage, fallback to NOVACART_PRODUCTS
 */
export function getStoredDemoProducts(): Product[] {
  if (typeof window === "undefined") return NOVACART_PRODUCTS;
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(
        DEMO_STORAGE_KEYS.PRODUCTS,
        JSON.stringify(NOVACART_PRODUCTS)
      );
      return NOVACART_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return NOVACART_PRODUCTS;
  }
}

/**
 * Saves products to localStorage
 */
export function saveStoredDemoProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEMO_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Completely resets demonstration data back to initial seeded state
 */
export function resetDemoStoreData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      DEMO_STORAGE_KEYS.ORDERS,
      JSON.stringify(SEED_DEMO_ORDERS)
    );
    localStorage.setItem(
      DEMO_STORAGE_KEYS.PRODUCTS,
      JSON.stringify(NOVACART_PRODUCTS)
    );
    localStorage.setItem(
      DEMO_STORAGE_KEYS.CUSTOMERS,
      JSON.stringify(SEED_DEMO_CUSTOMERS)
    );
    localStorage.removeItem(DEMO_STORAGE_KEYS.CART);
    localStorage.removeItem(DEMO_STORAGE_KEYS.WISHLIST);
  } catch {
    // Ignore
  }
}

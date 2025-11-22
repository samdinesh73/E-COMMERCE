export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const ENDPOINTS = {
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  CATEGORIES: "/categories",
  AUTH: "/auth",
  AUTH_ME: "/auth/me",
  AUTH_SIGNUP: "/auth/signup",
  AUTH_SIGNIN: "/auth/signin",
  WISHLIST: "/wishlist",
  PAYMENTS: "/payments",
  PAYMENTS_RAZORPAY: "/payments/razorpay",
  PAYMENTS_RAZORPAY_VERIFY: "/payments/razorpay/verify",
};

export const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const ENDPOINTS = {
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
};

export const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export const storeRoutes = [
  {
    path: "/store",
    element: "Store",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/marketplace",
    element: "Marketplace",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/marketplace/lives",
    element: "LivesMarketplace",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/subscription-plans",
    element: "SubscriptionPlans",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/virtual-store",
    element: "VirtualStore",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/nft-marketplace",
    element: "NFTMarketplace",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/wallet",
    element: "Wallet",
    requiresAuth: true,
    showNavbar: true
  }
];

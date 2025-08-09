export const monetizationRoutes = [
  {
    path: "/monetization",
    element: "MonetizationDashboard",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/subscription-plans",
    element: "SubscriptionPlans",
    requiresAuth: false,
    showNavbar: true
  },
  {
    path: "/affiliate-program",
    element: "AffiliateProgram",
    requiresAuth: true,
    showNavbar: true
  }
];

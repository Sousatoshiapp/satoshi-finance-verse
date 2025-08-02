export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: "Dashboard",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/profile",
    element: "Profile", 
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/user/:userId",
    element: "UserProfile",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/social",
    element: "Social",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/duels",
    element: "Duels",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/satoshi-city",
    element: "SatoshiCity",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/leaderboard",
    element: "Leaderboard",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/settings",
    element: "Settings",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/p2p-transfer",
    element: "P2PTransfer",
    requiresAuth: true,
    showNavbar: true
  }
];

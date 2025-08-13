export const publicRoutes = [
  {
    path: "/",
    element: "Welcome",
    requiresAuth: false,
    showNavbar: false
  },
  {
    path: "/auth",
    element: "Auth",
    requiresAuth: false,
    showNavbar: false
  },
  {
    path: "/welcome",
    element: "Welcome",
    requiresAuth: false,
    showNavbar: false
  },
  {
    path: "/password-reset",
    element: "PasswordReset",
    requiresAuth: false,
    showNavbar: false
  },
  {
    path: "/oauth-callback",
    element: "OAuthCallback",
    requiresAuth: false,
    showNavbar: false,
    isDirectImport: true
  },
  {
    path: "/onboarding",
    element: "Onboarding",
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: true
  }
];

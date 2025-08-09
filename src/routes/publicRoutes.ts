export const publicRoutes = [
  {
    path: "/",
    element: "AppIntro",
    requiresAuth: false,
    showNavbar: false
  },
  {
    path: "/intro",
    element: "AppIntro",
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
  }
];

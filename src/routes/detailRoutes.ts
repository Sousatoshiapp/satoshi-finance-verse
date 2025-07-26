export const detailRoutes = [
  {
    path: "/avatar/:id",
    element: "AvatarDetail",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/boost/:id",
    element: "BoostDetail",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/skin/:id",
    element: "SkinDetail",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/accessory/:id",
    element: "AccessoryDetail",
    requiresAuth: true,
    showNavbar: true
  }
];

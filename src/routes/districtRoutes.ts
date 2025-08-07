export const districtRoutes = [
  {
    path: "/district/:districtId",
    element: "ImmersiveDistrictPage",
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: true
  },
  {
    path: "/quiz/district/:districtId",
    element: "DistrictQuizPage",
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: true
  },
  {
    path: "/district-duel/:duelId",
    element: "DistrictDuelPage",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/district/:districtId/residents",
    element: "DistrictResidentsPage",
    requiresAuth: true,
    showNavbar: false
  }
];

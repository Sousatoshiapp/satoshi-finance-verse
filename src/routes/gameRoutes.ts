export const gameRoutes = [
  {
    path: "/quiz",
    element: "Quiz",
    requiresAuth: true,
    showNavbar: true
  },
  // {
  //   path: "/solo-quiz", // LEGACY - COMENTADO
  //   element: "SoloQuiz",
  //   requiresAuth: true,
  //   showNavbar: false
  // },
  {
    path: "/enhanced-quiz",
    element: "EnhancedQuiz",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/tournaments",
    element: "Tournaments",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/tournament/:tournamentId",
    element: "TournamentDetail",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/tournament-quiz/:tournamentId",
    element: "TournamentQuizSpecific",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/find-opponent",
    element: "FindOpponent",
    requiresAuth: true,
    showNavbar: true
  },
  {
    path: "/game-mode",
    element: "GameMode",
    requiresAuth: true,
    showNavbar: true,
    isDirectImport: true
  },
  {
    path: "/btc-duel",
    element: "BtcDuel",
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: true
  },
  {
    path: "/concept-connections",
    element: "ConceptConnectionsPage",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/quiz/solo",
    element: "SoloQuiz",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/quiz/study",
    element: "StudyMode",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/quiz/import",
    element: "ImportExport",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/casino-duel/:duelId",
    element: "CasinoDuelScreen",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/select-opponent",
    element: "SelectOpponentScreen",
    requiresAuth: true,
    showNavbar: true
  }
];

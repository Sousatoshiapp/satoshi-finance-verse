export const adminRoutes = [
  {
    path: "/admin",
    element: "AdminDashboard",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/settings",
    element: "AdminSettings",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/users",
    element: "AdminUsersAll",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/users/premium",
    element: "AdminUsersPremium",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/users/moderation",
    element: "AdminUsersModeration",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/finance/revenue",
    element: "AdminFinanceRevenue",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/finance/beetz",
    element: "AdminFinanceBeetz",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/finance/subscriptions",
    element: "AdminFinanceSubscriptions",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/finance/reports",
    element: "AdminFinanceReports",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/quiz/questions",
    element: "AdminQuizQuestions",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/quiz/categories",
    element: "AdminQuizCategories",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/quiz/generator",
    element: "AdminPanel",
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: true
  },
  {
    path: "/admin/social/posts",
    element: "AdminSocialPosts",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/gamification",
    element: "AdminGamification",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/ai-content",
    element: "AdminAIContent",
    requiresAuth: true,
    showNavbar: false
  },
  {
    path: "/admin/monetization",
    element: "AdminMonetization",
    requiresAuth: true,
    showNavbar: false
  }
];

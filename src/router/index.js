import { createRouter, createWebHistory } from "vue-router";

import { HOME_ROUTE } from "@/constants/routes";

const routes = [
  {
    path: HOME_ROUTE,
    component: () => import("@/views/Home"),
  },
  {
    path: "/login",
    component: () => import("@/views/Login"),
  },
  {
    path: "/create-review-form-only-admin-auth",
    component: () => import("@/views/CreateReviewForm"),
  },
  {
    path: "/get-review-form-only-admin-auth",
    component: () => import("@/views/GetReviewForm"),
  },
  {
    path: "/create-review-request-only-admin-auth",
    component: () => import("@/views/CreateReviewRequest"),
  },
  {
    path: "/get-review-request-only-admin-auth",
    component: () => import("@/views/GetReviewRequest"),
  },
  {
    path: "/close-review-request-only-admin-auth",
    component: () => import("@/views/CloseReviewRequest"),
  },
  {
    path: "/submit-review-only-admin-auth",
    component: () => import("@/views/SubmitReview"),
  },
  {
    path: "/grants",
    component: () => import("@/views/Grants"),
  },
  {
    path: "/grants/:grant_id",
    component: () => import("@/views/Grant"),
  },
  {
    path: "/grants/:grant_id/submit-review/",
    component: () => import("@/views/GrantSubmitReview"),
  },
];

const scrollBehavior = (to, from, savedPosition) => {
  return savedPosition || to.meta?.scrollPos || { top: 0, left: 0 };
};

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior,
});

router.beforeEach((to, from, next) => {
  const main = document.getElementById("main");

  from.meta?.scrollPos && (from.meta.scrollPos.top = main.scrollTop);
  return next();
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");

  if (authRequired && !loggedIn && process.env.VUE_APP_ENABLE_LOGIN == "true") {
    return next({
      path: "/login",
      query: { returnUrl: to.path },
    });
  }

  next();
});

router.afterEach((to) => {
  if (
    process.env.VUE_APP_FIREBASE_MEASUREMENT_ID !== "{firebaseMeasurementId}"
  ) {
    // eslint-disable-next-line no-undef
    gtag("config", process.env.VUE_APP_FIREBASE_MEASUREMENT_ID, {
      page_path: to.fullPath,
      send_page_view: true,
    });
  }
});

router.afterEach((to) => {
  const main = document.getElementById("main");

  if (to.meta?.scrollPos?.top) {
    setTimeout(() => {
      main.scrollTop = to.meta.scrollPos.top;
    }, 1);
  }
});

export default router;

export const DEFAULT_LOGIN_REDIRECT = "/customer/dashboard";

export const publicRoutes = ["/", "/auth/new-verification"];

export const authRoutes = ["/auth/login", "/auth/signup", "/auth/error"];

export const apiAuthPrefix = "/api/auth";

export const apiRoutes = [
  // all apis of website
  "/api/data",
];

export const privateRoutes = ["/customer/dashboard", "/settings", "/vendor/dashboard"];

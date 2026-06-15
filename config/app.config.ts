export const appConfig = {
  name: "VEX Real Estate Blockchain Portal",
  version: "0.1.0",

  storageKeys: {
    session: "vex_session",
    theme: "vex_theme",
  },

  auth: {
    loginRedirect: "/dashboard",
    logoutRedirect: "/login",
  },
};
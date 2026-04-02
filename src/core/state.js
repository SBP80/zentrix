export const state = {
  logged: localStorage.getItem("zentrix_logged") === "true",
  view: "inicio",
  menuOpen: false,
  weekOffset: 0,
};

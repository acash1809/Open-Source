exports.errorPage = (req, res, next) => {
  res
    .status(404)
    .render("404", {
      pageTitle: "ERROR 404",
      path: "/404",
      isAuthenticated: req.session.isLoggedIn
    });
};
exports.get505 = (req, res, next) => {
  res
    .status(500)
    .render("500", {
      pageTitle: "ERROR!",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn
    });
};

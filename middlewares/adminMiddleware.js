const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Accès refusé. Vous n'êtes pas un administrateur." });
  }
};

export default adminMiddleware;
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès refusé. Jeton non fourni." });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    req.user = decoded; // important pour le controller
    next();
  } catch (error) {
    console.error("Erreur middleware auth:", error);
    res.status(401).json({ message: "Token invalide." });
  }
};

export default authMiddleware;


















// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Accès refusé. Jeton non fourni." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(400).json({ message: "Jeton invalide." });
//   }
// };

// export default authMiddleware;
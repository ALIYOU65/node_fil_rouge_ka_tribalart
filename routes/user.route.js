import { Router } from "express";
import { register, login, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router()

// Routes publiques pour l'inscription et la connexion
router.post('/register', register);
router.post('/login', login);

// Route pour lister tous les utilisateurs :
// Nécessite que l'utilisateur soit connecté (auth) et qu'il soit un admin (adminMiddleware).
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);

// Routes pour un utilisateur spécifique :
// Protégées par les middlewares pour que seuls les administrateurs puissent modifier ou supprimer des utilisateurs.
router.get('/:id', getUserById);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
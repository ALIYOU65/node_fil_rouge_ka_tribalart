import { Router } from "express";  
import { createPanier, getPaniers, getPanierById, updatePanier, deletePanier, addArticleToPanier, getPanierByUserId, removeArticleFromPanier, viderMonPanier, finaliserPanier } from "../controllers/panier.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Routes pour l'ajout et la récupération du panier de l'utilisateur connecté
// Ces routes sont placées en premier pour éviter que Express ne les confonde avec des ID.
router.post("/add-article", authMiddleware, addArticleToPanier);
router.get('/mon-panier', authMiddleware, getPanierByUserId);

// Nouvelle route pour vider le panier après paiement
router.patch('/vider-mon-panier', authMiddleware, viderMonPanier);

// Routes pour gérer les paniers via leur ID (souvent utilisées par un admin)
router.get("/all", getPaniers);
router.get("/:id", getPanierById);
router.put("/:id", updatePanier);
router.delete('/remove-article/:articleId', authMiddleware, removeArticleFromPanier);
router.delete("/:id", deletePanier);
router.post("/new", createPanier);
router.post('/panier/finaliser', authMiddleware, finaliserPanier);

export default router;






















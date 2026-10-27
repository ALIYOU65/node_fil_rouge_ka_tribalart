import { Router } from "express";
import { 
  createPanier, 
  getPaniers, 
  getPanierById, 
  updatePanier, 
  deletePanier, 
  addArticleToPanier, 
  getPanierByUserId, 
  removeArticleFromPanier, 
  viderMonPanier, 
  finaliserPanier 
} from "../controllers/panier.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Routes spécifiques 
router.post("/add-article", authMiddleware, addArticleToPanier);
router.get('/mon-panier', authMiddleware, getPanierByUserId);
router.patch('/vider-mon-panier', authMiddleware, viderMonPanier);
router.delete('/remove-article/:articleId', authMiddleware, removeArticleFromPanier);  
router.post('/panier/finaliser', authMiddleware, finaliserPanier);

// Routes générales
router.get("/all", getPaniers);
router.post("/new", createPanier);

// Routes avec paramètres
router.get("/:id", getPanierById);
router.put("/:id", updatePanier);
router.delete("/:id", deletePanier);

export default router;



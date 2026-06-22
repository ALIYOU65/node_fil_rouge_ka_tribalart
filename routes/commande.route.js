import { Router } from "express";
import { 
  createCommande, 
  getAllCommandes, 
  getCommandeById, 
  updateCommande, 
  deleteCommande,  
  achatImmediat 
} from "../controllers/commande.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Routes CRUD commande
router.post('/new', createCommande);
router.get('/all', getAllCommandes);
router.get('/:id', getCommandeById);
router.put('/:id', updateCommande);
router.delete('/:id', deleteCommande);

// Route pour l'achat immédiat avec authentification
router.post('/achat-immediat', authMiddleware, achatImmediat);

export default router;











// import { Router } from "express";
// import { createCommande, getAllCommandes, getCommandeById, updateCommande, deleteCommande,  achatImmediat } from "../controllers/commande.controller.js";
// import authMiddleware from "../middlewares/authMiddleware.js";

// const router = Router();

// router.post('/new', createCommande);
// router.get('/all', getAllCommandes);
// router.get('/:id', getCommandeById);
// router.put('/:id', updateCommande);
// router.delete('/:id', deleteCommande);
// // Nouvelle route pour l'achat immédiat avec le middleware
// router.post('/achat-immediat', authMiddleware, achatImmediat);

// export default router;

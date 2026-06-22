import { Router } from "express";
import { createArticle, getAllArticles, getArticleById, updateArticle, deleteArticle, attachImages, detachImages, getArticlesByCategory } from "../controllers/article.controller.js"; 
import { upload } from "../middlewares/multer.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
 

const router = Router();

// Routes protégées pour les administrateurs
router.post( "/new", authMiddleware, adminMiddleware, upload.array("images"), createArticle );

// Routes pour la création et la récupération de tous les articles
router.post('/new', upload.array('images'), createArticle); 
router.get('/all', getAllArticles);

// Route spécifique pour le filtrage par catégorie (DOIT être avant la route /:id)
router.get('/by-category', getArticlesByCategory);

// Routes générales qui utilisent un paramètre d'ID dynamique
router.put('/attach/:id', attachImages);
router.put('/detach/:id', detachImages);
router.get('/:id', getArticleById);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;














// import { Router } from "express";
// import { createArticle, getAllArticles, getArticleById, updateArticle, deleteArticle, attachImages, detachImages, articleController.getArticlesByCategory } from "../controllers/article.controller.js"
// import { upload } from "../middleware/multer.js"; 

// const router = Router()

// router.post('/new', upload.array('images'), createArticle); 
// // router.post('/new', createArticle)
// router.get('/all', getAllArticles)
// router.put('/attach/:id', attachImages)
// router.put('/detach/:id', detachImages)
// router.get('/:id', getArticleById)
// router.put('/:id', updateArticle)
// router.delete('/:id', deleteArticle)
// router.get('/by-category', articleController.getArticlesByCategory);

// export default router

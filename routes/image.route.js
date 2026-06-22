import { Router } from "express";
import { createImage, getAllImages, getImageById, updateImage, deleteImage, deleteImageFromDocument } from "../controllers/image.controller.js";
import { uploadImages } from "../middlewares/multer.js"; 
const router = Router();

// Route pour plusieurs fichiers (champ "images")
router.post('/new', uploadImages, createImage);

// Routes classiques
router.get('/all', getAllImages);
router.get('/:id', getImageById);
router.put('/:id', uploadImages, updateImage);
router.delete('/:id', deleteImage);
router.delete('/:id/:imageId', deleteImageFromDocument);

export default router;



















// import { Router } from "express";
// import { createImage, getAllImages, getImageById, updateImage, deleteImage, deleteImageFromDocument } from "../controllers/image.controller.js";
// import { upload, uploadImages } from "../middleware/multer.js"; // on importe uploadImages
// import { deleteImageFromDocument } from '../controllers/image.controller.js';


// const router = Router();

// // Route pour plusieurs fichiers (champ "images")
// router.post('/new', uploadImages, createImage);

// // Routes classiques
// router.get('/all', getAllImages);
// router.get('/:id', getImageById);
// // routes/image.route.js
// router.put('/:id', uploadImages, updateImage);
// router.delete('/:id', deleteImage);
// router.delete('/:id/:imageId', deleteImageFromDocument);

// export default router;

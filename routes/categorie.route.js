import { Router } from "express";
import { createCategorie, getAllCategories, getCategorieById, updateCategorie, deleteCategorie } from "../controllers/categorie.controller.js"

const router = Router()

router.post('/new', createCategorie)
router.get('/all', getAllCategories)
router.get('/:id', getCategorieById)
router.put('/:id', updateCategorie)
router.delete('/:id', deleteCategorie)

export default router
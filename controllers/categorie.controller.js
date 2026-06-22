import Categorie from "../models/categorie.model.js"
import categorieValidation from "../validations/categorie.validation.js"

const createCategorie = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }
        const {error} = categorieValidation(body).categorieCreate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const categorie = new Categorie(body)
        const newCategorie = await categorie.save()
        return res.status(201).json(newCategorie)        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getAllCategories = async(req, res) => {
    try {
        const categories = await Categorie.find()

        console.log('Categories found:', categories); // Loguez les résultats bruts
        console.log('Total categories:', categories.length); // Loguez le nombre de catégories

        return res.status(200).json(categories)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getCategorieById = async(req,res) => {
    try {
        const categorie = await Categorie.findById(req.params.id)
        if(!categorie){
            return res.status(404).json({message: "La catégorie n'existe pas"})
        }
        return res.status(200).json(categorie)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const updateCategorie = async(req,res) => {
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }

        const {error} = categorieValidation(body).categorieUpdate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const updatedCategorie = await Categorie.findByIdAndUpdate(req.params.id, body, {new: true})
        if(!updatedCategorie){
            res.status(404).json({message: "La catégorie n'existe pas"})
        }
        return res.status(200).json(updatedCategorie)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const deleteCategorie = async(req, res) => {
    try {
        const categorie = await Categorie.findByIdAndDelete(req.params.id)
        if(!categorie){
            return res.status(404).json({message: "La catégorie n'existe pas"})
        }
        return res.status(200).json({message: "La catégorie a été supprimée"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

export { createCategorie, getAllCategories, getCategorieById, updateCategorie, deleteCategorie }
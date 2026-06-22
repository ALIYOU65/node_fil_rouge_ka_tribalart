import Article from "../models/article.model.js"
import Categorie from "../models/categorie.model.js"
import Picture from "../models/image.model.js"
import articleValidation from "../validations/article.validation.js"


const createArticle = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }
        const {error} = articleValidation(body)
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        
        if(body.categories){
            for(let id of body.categories){
                const categorie = await Categorie.findById(id)
                if(!categorie) return res.status(404).json({message: "la catégorie n'existe pas"})
            }
        }

        const article = new Article(body)
        const newArticle = await article.save()
        return res.status(201).json(newArticle )       
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getAllArticles = async(req, res) => {
    try {
        const articles = await Article.find().populate('categories', 'nom').populate({
    path: 'images',
    populate: {
        path: 'images',
        select: 'url filename'
    }
})
        return res.status(200).json(articles)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getArticleById = async(req,res) => {
    try {
           const article = await Article.findById(req.params.id) // Changement ici
                .populate('categories', 'nom')
                .populate({
                    path: 'images',
                    populate: {
                        path: 'images',
                        select: 'url filename'
    }
})
        if(!article){
            return res.status(404).json({message: "L'article n'existe pas"})
        }
        return res.status(200).json(article)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const updateArticle  = async(req,res) => {
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }

        const {error} = articleValidation(body).articleUpdate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const updatedArticle  = await Article.findByIdAndUpdate(req.params.id, body, {new: true})
        if(!updatedArticle){
            return res.status(404).json({message: "L'article n'existe pas"})
        }
        return res.status(200).json(updatedArticle)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const deleteArticle = async(req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id)
        if(!article){
            return res.status(404).json({message: "L'article n'existe pas"})
        }
        return res.status(200).json({message: "L'article a été supprimé"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const attachImages = async(req, res) => {
    try {
        const { body } = req
        if(!body || !body.images){
            return res.status(400).json({message: "pas de message dans la requête"})
        }
        
        const {error} = articleValidation(body).articleAddOrRemove
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        
        for(let imageId of body.images){
          const image = await Picture.findById(imageId)
          if(!image){
            return res.status(404).json({message: `l'image ${imageId} n'existe pas`})
          }
        }

        const article = await Article.findById(req.params.id)
        if(!article){
            return res.status(404).json({message: `L'article ${req.params.id} n'existe pas`})
        }

          for(let imageId of body.images){
            if(!article.images.includes(imageId)){
                article.images = [...article.images, imageId]
            }
          }

        const updateArticle = await Article.findByIdAndUpdate(req.params.id, {images: article.images}, {new: true})
        
        return res.status(200).json(updateArticle)

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const detachImages = async(req, res) => {
    try {
        const { body } = req
        if(!body || !body.images){
            return res.status(400).json({message: "pas de message dans la requête"})
        }
        
        const {error} = articleValidation(body).articleAddOrRemove
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        for(let imageId of body.images){
          const image = await Picture.findById(imageId)
          if(!image){
            return res.status(404).json({message: `l'image ${imageId} n'existe pas`})
          }
        }

        const article = await Article.findById(req.params.id)
        if(!article){
            return res.status(404).json({message: `L'article ${req.params.id} n'existe pas`})
        }
        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, { $pull: { images: { $in: body.images } } }, { new : true })
        return res.status(200).json(updatedArticle)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erreur serveur", error: error})
    }
}

// Nouvelle fonction pour filtrer les articles par catégorie
const getArticlesByCategory = async (req, res) => {
    try {
        const { nom } = req.query; // Récupère le nom de la catégorie depuis les paramètres de la requête

        if (!nom) {
            // Si aucun nom de catégorie n'est fourni, on peut soit retourner tous les articles, soit une erreur.
            return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
        }

        // On trouve tous les articles et on les "peuple" (populate) avec leur catégorie
        const articles = await Article.find().populate({
            path: 'categories',
            match: { nom: nom } // On ne fait correspondre que les documents de catégorie avec le nom fourni
        }).populate({
            path: 'images',
            populate: {
                path: 'images',
                select: 'url filename'
            }
        });

        // On filtre le résultat pour ne garder que les articles qui ont au moins une catégorie correspondante.
        // La méthode `populate` avec `match` retourne un tableau vide pour les articles qui ne correspondent pas.
        const filteredArticles = articles.filter(article => article.categories && article.categories.length > 0);

        return res.status(200).json(filteredArticles);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la récupération des articles par catégorie.", error: error });
    }
};

export { createArticle , getAllArticles , getArticleById, updateArticle , deleteArticle , attachImages, detachImages, getArticlesByCategory };

























// import Article from "../models/article.model.js"
// import Categorie from "../models/categorie.model.js"
// import Picture from "../models/image.model.js"
// import articleValidation from "../validations/article.validation.js"


// const createArticle = async(req,res)=>{
//     try {
//         const {body} = req
//         if(!body){
//             return res.status(400).json({message: "Pas de données dans la requête"})
//         }
//         const {error} = articleValidation(body)
//         if(error){
//             return res.status(401).json(error.details[0].message)
//         }
        
//         if(body.categories){
//             for(let id of body.categories){
//                 const categorie = await Categorie.findById(id)
//                 if(!categorie) return res.status(404).json({message: "la catégorie n'existe pas"})
//             }
//         }

//         const article = new Article(body)
//         const newArticle = await article.save()
//         return res.status(201).json(newArticle )        
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// const getAllArticles = async(req, res) => {
//     try {
//         const articles = await Article.find().populate('categories', 'nom').populate({
//     path: 'images',
//     populate: {
//         path: 'images',
//         select: 'url filename'
//     }
// })
//         return res.status(200).json(articles)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// const getArticleById = async(req,res) => {
//     try {
//          const article = await Article.findById(req.params.id) // Changement ici
//             .populate('categories', 'nom')
//             .populate({
//                 path: 'images',
//                 populate: {
//                     path: 'images',
//                     select: 'url filename'
//     }
// })
//         if(!article){
//             return res.status(404).json({message: "L'article n'existe pas"})
//         }
//         return res.status(200).json(article)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// const updateArticle  = async(req,res) => {
//     try {
//         const {body} = req
//         if(!body){
//             return res.status(400).json({message: "Pas de données dans la requête"})
//         }

//         const {error} = articleValidation(body).articleUpdate
//         if(error){
//             return res.status(401).json(error.details[0].message)
//         }
//         const updatedArticle  = await Article.findByIdAndUpdate(req.params.id, body, {new: true})
//         if(!updatedArticle){
//             return res.status(404).json({message: "L'article n'existe pas"})
//         }
//         return res.status(200).json(updatedArticle)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// const deleteArticle = async(req, res) => {
//     try {
//         const article = await Article.findByIdAndDelete(req.params.id)
//         if(!article){
//             return res.status(404).json({message: "L'article n'existe pas"})
//         }
//         return res.status(200).json({message: "L'article a été supprimé"})
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// const attachImages = async(req, res) => {
//     try {
//         const { body } = req
//         if(!body || !body.images){
//             return res.status(400).json({message: "pas de message dans la requête"})
//         }
        
//         const {error} = articleValidation(body).articleAddOrRemove
//         if(error){
//             return res.status(401).json(error.details[0].message)
//         }
       
//         for(let imageId of body.images){
//           const image = await Picture.findById(imageId)
//           if(!image){
//             return res.status(404).json({message: `l'image ${imageId} n'existe pas`})
//           }
//         }

//         const article = await Article.findById(req.params.id)
//         if(!article){
//             return res.status(404).json({message: `L'article ${req.params.id} n'existe pas`})
//         }

//          for(let imageId of body.images){
//             if(!article.images.includes(imageId)){
//                 article.images = [...article.images, imageId]
//             }
//          }

//         const updateArticle = await Article.findByIdAndUpdate(req.params.id, {images: article.images}, {new: true})
       
//         return res.status(200).json(updateArticle)

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// const detachImages = async(req, res) => {
//     try {
//         const { body } = req
//         if(!body || !body.images){
//             return res.status(400).json({message: "pas de message dans la requête"})
//         }
        
//         const {error} = articleValidation(body).articleAddOrRemove
//         if(error){
//             return res.status(401).json(error.details[0].message)
//         }
//         for(let imageId of body.images){
//           const image = await Picture.findById(imageId)
//           if(!image){
//             return res.status(404).json({message: `l'image ${imageId} n'existe pas`})
//           }
//         }

//         const article = await Article.findById(req.params.id)
//         if(!article){
//             return res.status(404).json({message: `L'article ${req.params.id} n'existe pas`})
//         }
//         const updatedArticle = await Article.findByIdAndUpdate(req.params.id, { $pull: { images: { $in: body.images } } }, { new : true })
//         return res.status(200).json(updatedArticle)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Erreur serveur", error: error})
//     }
// }

// export { createArticle , getAllArticles , getArticleById, updateArticle , deleteArticle , attachImages, detachImages }

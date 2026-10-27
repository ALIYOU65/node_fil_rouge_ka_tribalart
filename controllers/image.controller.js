import Image from "../models/image.model.js";
import ArticleModel from "../models/article.model.js";
import imageValidation from "../validations/image.validation.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const createImage = async (req, res) => {
  try {
    // Vérifiez que des fichiers ont été envoyés par le formulaire.
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    // Construisez le tableau des images à partir des fichiers reçus.
    const images = req.files.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(file.filename)}`,
      filename: file.filename,
    }));
    
    // Ajoutez le tableau 'images' à req.body pour que Joi puisse le valider.
    req.body.images = images;

    // Exécutez la validation Joi sur le corps de la requête mis à jour.
    const { error } = imageValidation(req.body).imageCreate;
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Créez un nouveau document Mongoose avec les données validées.
    const imageDoc = new Image({
      nom: req.body.nom,
      alt: req.body.alt,
      images,
    });

    const saved = await imageDoc.save();
    return res.status(201).json(saved);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Récupérer toutes les images
const getAllImages = async (req, res) => {
  try {
    const images = await Image.find().populate('images');
    return res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Récupérer une image par ID
const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image n'existe pas" });
    return res.status(200).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

 const updateImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image n'existe pas" });
        }
       
        if (req.body.nom) {
            image.nom = req.body.nom;
        }
        if (req.body.alt) {
            image.alt = req.body.alt;
        }
        
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(file.filename)}`,
                filename: file.filename,
            }));
            image.images = image.images.concat(newImages);
        }
        const updated = await image.save();
        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};

  // Supprimer une image spécifique dans un document
  const deleteImageFromDocument = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        // Trouver le document d'image principal
        const imageDoc = await Image.findById(id);
        if (!imageDoc) {
            return res.status(404).json({ message: "Document d'image principal non trouvé." });
        }

        // Trouver l'index de l'image à supprimer dans le tableau
        const imageIndex = imageDoc.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({ message: "Image spécifique non trouvée dans le document." });
        }

        // Supprimer le fichier physique
        const filename = imageDoc.images[imageIndex].filename;
        const filePath = path.join(__dirname, "../uploads/", filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Retirer l'image du tableau et sauvegarder
        imageDoc.images.splice(imageIndex, 1);
        await imageDoc.save();

        return res.status(200).json({ message: "Image supprimée avec succès." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
  }

  // Supprimer une image
  const deleteImage = async (req, res) => {
  try {
    const articles = await ArticleModel.find({ images: req.params.id });
    if (articles.length > 0) {
      return res
        .status(400)
        .json({ message: `L'image est utilisée dans les articles : ${articles.map((a) => a.nom)}` });
    }
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "L'image n'existe pas" });

    // Supprimer les fichiers physiques
    image.images.forEach((img) => {
      const oldPath = path.join(__dirname, "../uploads/", img.filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    });

    await image.deleteOne();
    return res.status(200).json({ message: "Image supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export { createImage, getAllImages, getImageById, updateImage, deleteImage, deleteImageFromDocument };

import LigneCommande from "../models/ligneCommande.model.js";
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";

const createLigneCommande = async (req, res) => {
  try {
    const { body } = req;
    
    if (!body) {
      return res.status(400).json({ message: "Pas de données dans la requête" });
    }

    // Validez les données de la requête avec Joi.
    // L'objet 'body' est directement passé à la fonction de validation.
    const { error } = ligneCommandeValidation(body).ligneCommandeCreate;
    
    // Si Joi détecte une erreur de validation, renvoyez une erreur 400.
    if (error) {
      // Utilisez le statut 400 (Bad Request) pour les erreurs de validation
      return res.status(400).json(error.details[0].message);
    }

    // Créez le document Mongoose en utilisant directement le corps de la requête (body).
    // Ne pas utiliser 'body.attribut' car vos données sont directement à la racine de l'objet.
    const nouvelleLigneCommande = await LigneCommande.create(body);

    return res.status(201).json(nouvelleLigneCommande);
  } catch (error) {
    console.error(error); // Utilisez console.error pour les erreurs
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export default createLigneCommande;

const getAllLigneCommandes = async (req, res) => {
  try {
    const lignes = await LigneCommande.find()
      .populate("article")
      .populate("commande");

    return res.status(200).json(lignes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getLigneCommandeById = async (req, res) => {
  try {
    const ligne = await LigneCommande.findById(req.params.id)
      .populate("article")
      .populate("commande");

    if (!ligne) {
      return res.status(404).json({ message: "La ligne de commande n'existe pas" });
    }
    return res.status(200).json(ligne);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateLigneCommande = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res.status(400).json({ message: "Pas de données dans la requête" });
    }

    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const updatedLigneCommande = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("article")
      .populate("commande");

    if (!updatedLigneCommande) {
      return res.status(404).json({ message: "La ligne de commande n'existe pas" });
    }
    return res.status(200).json(updatedLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteLigneCommande = async (req, res) => {
  try {
    const ligne = await LigneCommande.findByIdAndDelete(req.params.id);
    if (!ligne) {
      return res.status(404).json({ message: "La ligne de commande n'existe pas" });
    }
    return res.status(200).json({ message: "La ligne de commande a été supprimée" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export { createLigneCommande, getAllLigneCommandes, getLigneCommandeById, updateLigneCommande, deleteLigneCommande };

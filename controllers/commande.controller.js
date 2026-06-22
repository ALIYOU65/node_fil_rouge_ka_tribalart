import mongoose from "mongoose";
import Commande from "../models/commande.model.js";
import LigneCommande from "../models/ligneCommande.model.js";
import Panier from "../models/panier.model.js";
import Article from "../models/article.model.js"; // à ajuster si tu as un modèle Article
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";

// ----------------------
// Achat immédiat
// ----------------------
export const achatImmediat = async (req, res) => {
  try {
    const userId = req.user._id; // récupéré via authMiddleware
    const { articleId, quantite } = req.body;

    if (!articleId || !quantite) {
      return res.status(400).json({ message: "Article ID et quantité requis" });
    }

    // Vérifie que l'article existe
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    // Crée la commande
    const commande = new Commande({
      numero: `CMD-${Date.now()}`,
      user: userId,
      prixTotal: article.prix * quantite,
      panier: null, // Achat immédiat n'utilise pas de panier
      ligneCommandes: []
    });

    await commande.save();

    // Crée la ligne de commande
    const ligneCommande = new LigneCommande({
      article: article._id,
      quantite,
      prix: article.prix * quantite,
      commande: commande._id
    });

    await ligneCommande.save();

    // Ajoute la ligne à la commande
    commande.ligneCommandes.push(ligneCommande._id);
    await commande.save();

    res.status(201).json({
      message: "Achat immédiat réussi",
      commande,
      ligneCommande
    });
  } catch (error) {
    console.error("Erreur achat immédiat:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ----------------------
// CRUD Commandes
// ----------------------
export const createCommande = async (req, res) => {
  try {
    const { panierId, prixTotal } = req.body;

    const commande = new Commande({
      numero: `CMD-${Date.now()}`,
      user: req.user._id,
      prixTotal,
      panier: panierId || null,
      ligneCommandes: []
    });

    await commande.save();
    res.status(201).json(commande);
  } catch (error) {
    console.error("Erreur createCommande:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().populate("user panier ligneCommandes");
    res.json(commandes);
  } catch (error) {
    console.error("Erreur getAllCommandes:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate("user panier ligneCommandes");
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json(commande);
  } catch (error) {
    console.error("Erreur getCommandeById:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const updateCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json(commande);
  } catch (error) {
    console.error("Erreur updateCommande:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteCommande:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

















































// import Commande from "../models/commande.model.js";
// import LigneCommande from "../models/ligneCommande.model.js";
// import Article from "../models/article.model.js";
// import commandeValidation from "../validations/commande.validation.js";

// const createCommande = async (req, res) => {
//   try {
//     const { body } = req;
//     if (!body || Object.keys(body).length === 0) {
//       return res.status(400).json({ message: "Pas de données dans la requête" });
//     }

//     const { error } = commandeValidation(body).commandeCreate;
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const commande = new Commande(body);
//     const newCommande = await commande.save();
//     return res.status(201).json(newCommande);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

// const getAllCommandes = async (req, res) => {
//   try {
//     const commandes = await Commande.find()
//       .populate("user")
//       .populate("panier")
//       .populate({
//         path: "ligneCommandes",
//         populate: { path: "article" },
//       });

//     return res.status(200).json(commandes);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur serveur", error: error });
//   }
// };

// const getCommandeById = async (req, res) => {
//   try {
//     const commande = await Commande.findById(req.params.id)
//       .populate("user")
//       .populate("panier")
//       .populate({
//         path: "ligneCommandes",
//         populate: { path: "article" },
//       });

//     if (!commande) {
//       return res.status(404).json({ message: "La commande n'existe pas" });
//     }
//     return res.status(200).json(commande);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur serveur", error: error });
//   }
// };

// const updateCommande = async (req, res) => {
//   try {
//     const { body } = req;
//     if (!body || Object.keys(body).length === 0) {
//       return res.status(400).json({ message: "Pas de données dans la requête" });
//     }

//     const { error } = commandeValidation(body).commandeUpdate;
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const updatedCommande = await Commande.findByIdAndUpdate(req.params.id, body, {
//       new: true,
//     })
//       .populate("user")
//       .populate("panier")
//       .populate({
//         path: "ligneCommandes",
//         populate: { path: "article" },
//       });

//     if (!updatedCommande) {
//       return res.status(404).json({ message: "La commande n'existe pas" });
//     }
//     return res.status(200).json(updatedCommande);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

// const deleteCommande = async (req, res) => {
//   try {
//     const commande = await Commande.findByIdAndDelete(req.params.id);
//     if (!commande) {
//       return res.status(404).json({ message: "La commande n'existe pas" });
//     }
//     return res.status(200).json({ message: "La commande a été supprimée" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur serveur", error: error });
//   }
// };

// const achatImmediat = async (req, res) => {
//   try {
//     const { articleId } = req.body;
//     const userId = req.user.id;

//     if (!articleId) {
//       return res.status(400).json({ message: "L'ID de l'article est requis." });
//     }

//     const article = await Article.findById(articleId);
//     if (!article) {
//       return res.status(404).json({ message: "Article non trouvé." });
//     }

//     // Vérification du stock
//     if (article.quantite <= 0) {
//       return res.status(409).json({ message: "Cet article est en rupture de stock." });
//     }

//     const ligneCommande = await LigneCommande.create({
//       article: article._id,
//       quantite: 1,
//       prixUnitaire: article.prix,
//     });

//     const nouvelleCommande = new Commande({
//       user: userId,
//       ligneCommandes: [ligneCommande._id],
//       montantTotal: article.prix,
//       statut: "En attente de paiement",
//     });

//     await nouvelleCommande.save();

//     // Décrémentation du stock après la création de la commande
//     article.quantite -= 1;
//     await article.save();

//     res.status(201).json({
//       message: "Commande créée avec succès. Article réservé.",
//       commande: nouvelleCommande,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'achat immédiat:", error);
//     res.status(500).json({
//       message: "Erreur serveur lors de la création de la commande.",
//     });
//   }
// };

// export { createCommande, getAllCommandes, getCommandeById, updateCommande, deleteCommande, achatImmediat };











// import Commande from "../models/commande.model.js";
// import LigneCommande from "../models/ligneCommande.model.js";
// import Article from "../models/article.model.js";
// import commandeValidation from "../validations/commande.validation.js";

// const createCommande = async (req, res) => {
//   try {
//     const { body } = req;
//     if (!body || Object.keys(body).length === 0) {
//       return res.status(400).json({ message: "Pas de données dans la requête" });
//     }

//     const { error } = commandeValidation(body).commandeCreate;
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const commande = new Commande(body);
//     const newCommande = await commande.save();
//     return res.status(201).json(newCommande);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

// const getAllCommandes = async (req, res) => {
//   try {
//     const commandes = await Commande.find()
//       .populate("user")
//       .populate("panier")
//       .populate({
//         path: "ligneCommandes",
//         populate: { path: "article" },
//       });

//     return res.status(200).json(commandes);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur serveur", error: error });
//   }
// };

// const getCommandeById = async (req, res) => {
//   try {
//     const commande = await Commande.findById(req.params.id)
//       .populate("user")
//       .populate("panier")
//       .populate({
//         path: "ligneCommandes",
//         populate: { path: "article" },
//       });

//     if (!commande) {
//       return res.status(404).json({ message: "La commande n'existe pas" });
//     }
//     return res.status(200).json(commande);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur serveur", error: error });
//   }
// };

// const updateCommande = async (req, res) => {
//   try {
//     const { body } = req;
//     if (!body || Object.keys(body).length === 0) {
//       return res.status(400).json({ message: "Pas de données dans la requête" });
//     }

//     const { error } = commandeValidation(body).commandeUpdate;
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const updatedCommande = await Commande.findByIdAndUpdate(req.params.id, body, {
//       new: true,
//     })
//       .populate("user")
//       .populate("panier")
//       .populate({
//         path: "ligneCommandes",
//         populate: { path: "article" },
//       });

//     if (!updatedCommande) {
//       return res.status(404).json({ message: "La commande n'existe pas" });
//     }
//     return res.status(200).json(updatedCommande);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

// const deleteCommande = async (req, res) => {
//   try {
//     const commande = await Commande.findByIdAndDelete(req.params.id);
//     if (!commande) {
//       return res.status(404).json({ message: "La commande n'existe pas" });
//     }
//     return res.status(200).json({ message: "La commande a été supprimée" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur serveur", error: error });
//   }
// };

// const achatImmediat = async (req, res) => {
//   try {
//     const { articleId } = req.body;
//     const userId = req.user.id;

//     if (!articleId) {
//       return res.status(400).json({ message: "L'ID de l'article est requis." });
//     }

//     const article = await Article.findById(articleId);
//     if (!article) {
//       return res.status(404).json({ message: "Article non trouvé." });
//     }
    
//     const ligneCommande = await LigneCommande.create({
//       article: article._id,
//       quantite: 1,
//       prixUnitaire: article.prix,
//     });

//     const nouvelleCommande = new Commande({
//       user: userId,
//       // CORRECTION ICI : Utilisez l'ID de la ligne de commande directement
//       ligneCommandes: [ligneCommande._id], 
//       montantTotal: article.prix,
//       statut: "En attente de paiement",
//     });

//     await nouvelleCommande.save();

//     res.status(201).json({
//       message: "Commande créée avec succès.",
//       commande: nouvelleCommande,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'achat immédiat:", error);
//     res.status(500).json({
//       message: "Erreur serveur lors de la création de la commande.",
//     });
//   }
// };

// export { createCommande, getAllCommandes, getCommandeById, updateCommande, deleteCommande, achatImmediat };




















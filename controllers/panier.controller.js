import Panier from "../models/panier.model.js";
import Article from "../models/article.model.js";
import panierValidation from "../validations/panier.validation.js";

const createPanier = async (req, res) => {
  try {
    // Validation des données
    const { error } = panierValidation(req.body).panierCreate;
    if (error) {
      return res.status(400).json({ message: "Erreur de validation", error: error.details });
    }

    const { user, statut, date, articles, commande } = req.body;

    // Vérifier si un panier existe déjà pour l'utilisateur
    const existingPanier = await Panier.findOne({ user });
    if (existingPanier) {
      return res.status(409).json({
        message: "Un panier existe déjà pour cet utilisateur.",
        panier: existingPanier,
      });
    }

    //  Construction des articles et calcul du montant total
    let finalArticles = [];
    let calculatedMontantTotal = 0;

    if (articles && articles.length > 0) {
      for (const item of articles) {
        const articleDetails = await Article.findById(item.articleId);
        if (!articleDetails) {
          return res
            .status(404)
            .json({ message: `Article ID ${item.articleId} non trouvé pour la création du panier.` });
        }

        const itemPrice = articleDetails.prix || 0;
        const itemQuantity = item.quantite || 1;

        finalArticles.push({
          articleId: item.articleId,
          quantite: itemQuantity,
          prix: itemPrice,
        });

        calculatedMontantTotal += itemPrice * itemQuantity;
      }
    }

    //  Création du panier
    const newPanier = await Panier.create({
      user,
      statut: statut || "EN_COURS",
      date: date ? new Date(date) : new Date(),
      montantTotal: calculatedMontantTotal,
      articles: finalArticles,
      commande: commande || null,
    });

    return res.status(201).json({
      message: "Panier créé avec succès",
      panier: newPanier,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Un panier existe déjà pour cet utilisateur.",
        error: error.message,
      });
    }
    return res.status(500).json({
      message: "Erreur serveur lors de la création du panier",
      error: error.message,
    });
  }
};

// MISE À JOUR D’UN PANIER

const updatePanier = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res.status(400).json({ message: "Pas de données dans la requête" });
    }

    // Validation des données
    const { error } = panierValidation(body).panierUpdate;
    if (error) {
      return res.status(400).json({ message: "Erreur de validation", error: error.details });
    }

    let { statut, date, montantTotal, articles, commande } = body;

    // Si le statut devient PAYE → vider le panier
    if (statut === "PAYE") {
      articles = [];
      montantTotal = 0;
    }

    const updatedPanier = await Panier.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          statut,
          date: date ? new Date(date) : undefined,
          montantTotal,
          articles,
          commande,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedPanier) {
      return res.status(404).json({ message: "Le panier n'existe pas" });
    }

    return res.status(200).json({
      message: "Panier mis à jour avec succès",
      panier: updatedPanier,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// RÉCUPÉRATION DES PANIERS

const getPaniers = async (req, res) => {
  try {
    const paniers = await Panier.find()
      .populate("articles.articleId")
      .populate("user")
      .populate("commande");

    return res.status(200).json(paniers);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


//  RÉCUPÉRATION DU PANIER PAR UTILISATEUR CONNECTÉ

const getPanierByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const panier = await Panier.findOne({ user: userId })
      .populate("articles.articleId")
      .populate("commande");

    if (!panier) {
      return res.status(404).json({ message: "Panier non trouvé pour cet utilisateur." });
    }

    res.status(200).json(panier);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};


// RÉCUPÉRATION D’UN PANIER PAR ID

const getPanierById = async (req, res) => {
  try {
    const panier = await Panier.findById(req.params.id)
      .populate("articles.articleId")
      .populate("user")
      .populate("commande");

    if (!panier) {
      return res.status(404).json({ message: "Le panier n'existe pas" });
    }

    return res.status(200).json(panier);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// VIDER LE PANIER DE L’UTILISATEUR CONNECTÉ

const viderMonPanier = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedPanier = await Panier.findOneAndUpdate(
      { user: userId },
      { $set: { articles: [], montantTotal: 0 } },
      { new: true }
    );

    if (!updatedPanier) {
      return res.status(404).json({ message: "Panier non trouvé pour le vidage." });
    }

    res.status(200).json({ message: "Panier vidé avec succès", panier: updatedPanier });
  } catch (err) {
    res.status(500).json({ error: "Impossible de vider le panier" });
  }
};

//  SUPPRESSION D’UN PANIER

const deletePanier = async (req, res) => {
  try {
    const panier = await Panier.findByIdAndDelete(req.params.id);
    if (!panier) {
      return res.status(404).json({ message: "Le panier n'existe pas" });
    }
    return res.status(200).json({ message: "Le panier a été supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// RETIRER UN ARTICLE DU PANIER
const removeArticleFromPanier = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const panier = await Panier.findOne({ user: userId });
    if (!panier) {
      return res.status(404).json({ message: "Panier non trouvé." });
    }

    // Trouver l'index de l'article
    const articleIndex = panier.articles.findIndex((item) => {
      const id = item.articleId._id
        ? item.articleId._id.toString()
        : item.articleId.toString();
      return id === articleId;
    });

    if (articleIndex === -1) {
      return res.status(404).json({ message: "Article non trouvé dans le panier." });
    }

    // Retirer l'article
    panier.articles.splice(articleIndex, 1);

    // Recalculer complètement le montantTotal
    panier.montantTotal = panier.articles.reduce((total, item) => {
      return total + (item.prix || 0) * (item.quantite || 1);
    }, 0);

    await panier.save();

    res.status(200).json({
      message: "Article retiré du panier avec succès.",
      panier,
    });
  } catch (error) {
    console.error("Erreur removeArticleFromPanier:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
  
// AJOUTER UN ARTICLE AU PANIER
const addArticleToPanier = async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.user.id;

    if (!articleId) {
      return res.status(400).json({ message: "L'ID de l'article est requis." });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé." });
    }

    let panier = await Panier.findOne({ user: userId });
    const articlePrice = article.prix || 0;

    if (!panier) {
      panier = new Panier({
        user: userId,
        articles: [{ articleId, quantite: 1, prix: articlePrice }],
        montantTotal: articlePrice,
      });
      await panier.save();
    } else {
      const articleDejaPresent = panier.articles.some(
        (item) => item.articleId.toString() === articleId
      );

      if (articleDejaPresent) {
        return res.status(409).json({
          message: "Cet article est déjà dans votre panier.",
          panier,
        });
      }

      panier.articles.push({ articleId, quantite: 1, prix: articlePrice });
      panier.montantTotal += articlePrice;
      await panier.save();
    }

    res.status(200).json({
      message: "Article ajouté au panier avec succès.",
      panier,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de l'ajout au panier.",
      error: error.message,
    });
  }
};

//  FINALISER LE PANIER APRÈS PAIEMENT

const finaliserPanier = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commandeId } = req.body;

    const panier = await Panier.findOne({ user: userId, statut: "EN_COURS" });
    if (!panier) {
      return res.status(404).json({ message: "Aucun panier en cours trouvé pour cet utilisateur." });
    }

    panier.statut = "PAYE";
    panier.articles = [];
    panier.montantTotal = 0;
    panier.commande = commandeId;

    await panier.save();

    res.status(200).json({
      message: "Le panier a été vidé et son statut a été mis à jour avec succès.",
      panier,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de la finalisation du panier.",
      error: error.message,
    });
  }
};

export { createPanier, updatePanier, getPaniers, getPanierById, deletePanier, addArticleToPanier, getPanierByUserId, removeArticleFromPanier, 
  viderMonPanier, finaliserPanier,
};


































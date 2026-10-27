import mongoose from "mongoose";
import Stripe from 'stripe';
import Commande from "../models/commande.model.js";
import LigneCommande from "../models/ligneCommande.model.js";
import Article from "../models/article.model.js"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Achat immédiat
export const achatImmediat = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { articleId, quantite = 1 } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: "Article ID requis" });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    // Création de la commande
    const commande = new Commande({
      numero: `CMD-${Date.now()}`,
      user: userId,
      prixTotal: article.prix * quantite,
      panier: null,
      statut: "EN_ATTENTE",
      ligneCommandes: []
    });
    await commande.save();

    // Création de la ligne de commande
    const ligneCommande = new LigneCommande({
      article: article._id,
      quantite,
      prixTotal: article.prix * quantite,
      commande: commande._id
    });
    await ligneCommande.save();

    // Liaison
    commande.ligneCommandes.push(ligneCommande._id);
    await commande.save();

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: article.nom,
              description: article.description?.substring(0, 200) || '',
            },
            unit_amount: Math.round(article.prix * 100),
          },
          quantity: quantite,
        },
      ],
      client_reference_id: userId.toString(),
      metadata: {
        commandeId: commande._id.toString(),
        articleId: article._id.toString(),
        type: 'achat_immediat'
      },
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: `http://localhost:5173/article/${article._id}`,
    });

    // On renvoie l'URL Stripe
    res.status(201).json({
      message: "Session de paiement créée",
      url: session.url,
      commandeId: commande._id
    });

  } catch (error) {
    console.error("Erreur achat immédiat:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// CRUD Commandes
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


















































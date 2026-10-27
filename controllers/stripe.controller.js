import Stripe from 'stripe';
import Article from '../models/article.model.js';
import Panier from '../models/panier.model.js';
import Commande from '../models/commande.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Création d’une session Stripe
export const createCheckoutSession = async (req, res) => {
  try {
    const { articles, product } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "Utilisateur non authentifié." });
    }

    let lineItems = [];

    if (articles && Array.isArray(articles)) {
      lineItems = articles.map(article => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: article.nom,
            metadata: { articleId: article._id }
          },
          unit_amount: article.prix * 100,
        },
        quantity: article.quantite,
      }));
    } else if (product) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.nom,
            metadata: { articleId: product._id }
          },
          unit_amount: product.prix * 100,
        },
        quantity: product.quantite,
      });
    } else {
      return res.status(400).json({ error: 'Aucun article ou produit fourni.' });
    }
    
    const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     mode: 'payment',
     line_items: lineItems,
     client_reference_id: userId.toString(),
     metadata: {
    userId: userId.toString(),
    type: 'panier',
    // On envoie la liste des articleIds séparés par des virgules
     articleIds: (articles || [product])
      .map(a => a._id || a.articleId)
      .filter(Boolean)
      .join(',')
    },
    success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:5173/panier',
   });
  
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    res.status(500).json({ error: error.message });
  }
};

// Webhook Stripe
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erreur de signature du Webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Event reçu:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const commandeId = session.metadata?.commandeId;
      const articleId = session.metadata?.articleId;
      const type = session.metadata?.type;

      console.log('Paiement réussi ! Session ID:', session.id);
      console.log('Metadata reçues →', { type, commandeId, articleId, userId });

      try {
        // ACHAT IMMÉDIAT 
        if (type === 'achat_immediat' && commandeId) {
          const commande = await Commande.findByIdAndUpdate(
            commandeId,
            { statut: "PAYEE" },
            { new: true }
          );
          console.log(`Commande ${commandeId} passée en PAYEE`);

          if (articleId) {
            const articleMisAJour = await Article.findByIdAndUpdate(
              articleId,
              { statut: 'Vendu', quantite: 0 },
              { new: true }
            );

            if (articleMisAJour) {
              console.log(`Article ${articleId} marqué comme Vendu →`, articleMisAJour.statut);
            } else {
              console.error(`❌ Article ${articleId} introuvable dans la base`);
            }
          } else {
            console.error('❌ articleId manquant dans les metadata Stripe');
          }
        }

        // PAIEMENT DEPUIS LE PANIER 
        else if (type === 'panier' && userId) {
          const articleIds = (session.metadata.articleIds || '')
            .split(',')
            .filter(id => id.trim() !== '');

          console.log("Articles payés depuis le panier :", articleIds);

          // Marquer chaque article comme Vendu
          for (const artId of articleIds) {
            try {
              await Article.findByIdAndUpdate(artId, {
                statut: 'Vendu',
                quantite: 0
              });
              console.log(`Article ${artId} marqué comme Vendu`);
            } catch (err) {
              console.error(`Erreur mise à jour article ${artId}:`, err);
            }
          }

          // Retirer uniquement ces articles du panier
          const panier = await Panier.findOne({ user: userId });
          if (panier) {
            panier.articles = panier.articles.filter(item => {
              const id = item.articleId._id
                ? item.articleId._id.toString()
                : item.articleId.toString();
              return !articleIds.includes(id);
            });

            // Recalculer le montantTotal
            panier.montantTotal = panier.articles.reduce((total, item) => {
              return total + (item.prix || 0) * (item.quantite || 1);
            }, 0);

            await panier.save();
            console.log(`Panier mis à jour – articles restants : ${panier.articles.length}`);
          }
        }
      } catch (err) {
        console.error('Erreur lors du traitement post-paiement:', err);
      }

      break;
    }

    default:
      console.log(`Événement non géré : ${event.type}`);
  }

  // Toujours répondre à Stripe
  res.status(200).json({ received: true });
};



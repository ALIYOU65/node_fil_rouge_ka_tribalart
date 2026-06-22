import Stripe from 'stripe';
import Article from '../models/article.model.js';
import Panier from '../models/panier.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// 🚀 Création d’une session Stripe
// ===============================
export const createCheckoutSession = async (req, res) => {
  try {
    const { articles, product } = req.body;
    const userId = req.user.id; // ✅ récupéré via le token JWT

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
      line_items: lineItems,
      mode: 'payment',
      client_reference_id: userId, // ✅ associer l’utilisateur
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/panier',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 📩 Webhook Stripe
// ===============================
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
    console.error('⚠️ Erreur de signature du Webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Event reçu:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;

      console.log('✅ Paiement réussi ! Session ID:', session.id);

      if (!userId) {
        console.error("❌ Aucun userId trouvé dans la session Stripe");
        break;
      }

      try {
        const panier = await Panier.findOne({ user: userId });
        if (!panier) {
          console.error('Panier non trouvé pour userId:', userId);
          break;
        }

        // Récupérer les articles achetés depuis Stripe
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

        for (const item of lineItems.data) {
          const articleId = item.price?.product_data?.metadata?.articleId;

          if (articleId) {
            try {
              await Article.findByIdAndUpdate(articleId, {
                statut: 'Vendu',
                quantite: 0
              });
              console.log(`✅ Article ${articleId} mis à jour en "Vendu".`);
            } catch (updateErr) {
              console.error(`Erreur mise à jour article ${articleId}:`, updateErr);
            }
          }
        }

        // Vider le panier de l’utilisateur
        panier.articles = [];
        panier.statut = 'VALIDE';
        await panier.save();
        console.log(`🛒 Panier de l'utilisateur ${userId} vidé et validé.`);
      } catch (err) {
        console.error('Erreur traitement du panier après paiement:', err);
      }
      break;
    }

    default:
      console.log(`Événement non géré : ${event.type}`);
  }

  res.status(200).json({ received: true });
};









































// import Stripe from 'stripe';
// import Article from '../models/article.model.js';
// import Panier from '../models/panier.model.js';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Création d’une session de paiement
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { articles, product, userId } = req.body;
//     let lineItems = [];

//     if (articles && Array.isArray(articles)) {
//       lineItems = articles.map(article => ({
//         price_data: {
//           currency: 'eur',
//           product_data: {
//             name: article.nom,
//             metadata: { articleId: article._id }
//           },
//           unit_amount: article.prix * 100,
//         },
//         quantity: article.quantite,
//       }));
//     } else if (product) {
//       lineItems.push({
//         price_data: {
//           currency: 'eur',
//           product_data: {
//             name: product.nom,
//             metadata: { articleId: product._id }
//           },
//           unit_amount: product.prix * 100,
//         },
//         quantity: product.quantite,
//       });
//     } else {
//       return res.status(400).json({ error: 'Aucun article ou produit fourni.' });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: lineItems,
//       mode: 'payment',
//       client_reference_id: userId, 
//       success_url: 'http://localhost:5173/success',
//       cancel_url: 'http://localhost:5173/panier',
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Webhook Stripe
// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error('⚠️ Erreur de signature du Webhook :', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   console.log('Event reçu:', event.type);

//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
//       console.log('✅ Paiement réussi ! Session ID:', session.id);

//       try {
//         const panier = await Panier.findOne({ user: session.client_reference_id });
//         if (!panier) {
//           console.error('Panier non trouvé pour userId:', session.client_reference_id);
//           break;
//         }

//         const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

//         for (const item of lineItems.data) {
//           const articleId = item.price?.metadata?.articleId;

//           if (articleId) {
//             try {
//               await Article.findByIdAndUpdate(articleId, {
//                 statut: 'Vendu',
//                 quantite: 0
//               });
//               console.log(`Statut de l'article ${articleId} mis à jour.`);
//             } catch (updateErr) {
//               console.error(`Erreur mise à jour article ${articleId}:`, updateErr);
//             }
//           }
//         }

//         panier.articles = [];
//         panier.statut = 'VALIDE';
//         await panier.save();
//         console.log(`Panier de l'utilisateur ${session.client_reference_id} vidé et statut mis à jour.`);
//       } catch (err) {
//         console.error('Erreur traitement du panier après paiement:', err);
//       }
//       break;

//     default:
//       console.log(`Événement non géré : ${event.type}`);
//   }

//   res.status(200).json({ received: true });
// };























































































// import Stripe from 'stripe';
// import Article from '../models/article.model.js';
// import Panier from '../models/panier.model.js'; // Assurez-vous que le modèle existe

// // ✅ Initialisation Stripe avec version stable
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2023-08-16',
// });

// // ✅ Création d’une session de paiement (checkout)
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { articles, product, userId } = req.body;
//     let lineItems = [];

//     if (articles && Array.isArray(articles)) {
//       lineItems = articles.map(article => ({
//         price_data: {
//           currency: 'eur',
//           product_data: {
//             name: article.nom,
//             metadata: { articleId: article._id }
//           },
//           unit_amount: article.prix * 100, // en centimes
//         },
//         quantity: article.quantite,
//       }));
//     } else if (product) {
//       lineItems.push({
//         price_data: {
//           currency: 'eur',
//           product_data: {
//             name: product.nom,
//             metadata: { articleId: product._id }
//           },
//           unit_amount: product.prix * 100,
//         },
//         quantity: product.quantite,
//       });
//     } else {
//       return res.status(400).json({ error: 'Aucun article ou produit fourni.' });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: lineItems,
//       mode: 'payment',
//       client_reference_id: userId, // ✅ Lier la session à l'utilisateur
//       success_url: 'http://localhost:5173/success',
//       cancel_url: 'http://localhost:5173/panier',
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ Webhook Stripe pour gérer les événements
// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error('⚠️  Erreur de signature du Webhook :', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
//       console.log('✅ Paiement réussi ! Session ID:', session.id);

//       try {
//         // Récupération des articles achetés
//         const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

//         for (const item of lineItems.data) {
//           const articleId = item.price?.metadata?.articleId;

//           if (articleId) {
//             try {
//               await Article.findByIdAndUpdate(articleId, {
//                 statut: 'Vendu',
//                 quantite: 0
//               });
//               console.log(`Statut de l'article ${articleId} mis à jour.`);
//             } catch (updateErr) {
//               console.error(`Erreur lors de la mise à jour de l'article ${articleId}:`, updateErr);
//             }
//           }
//         }

//         // ✅ Vider le panier de l'utilisateur et mettre à jour le statut
//         if (session.client_reference_id) {
//           const panier = await Panier.findOne({ user: session.client_reference_id });
//           if (panier) {
//             panier.articles = [];       // Vide le panier
//             panier.statut = 'PAYE';    // Met à jour le statut
//             await panier.save();        // Sauvegarde
//             console.log(`Panier de l'utilisateur ${session.client_reference_id} vidé et statut mis à jour.`);
//           } else {
//             console.log(`Aucun panier trouvé pour l'utilisateur ${session.client_reference_id}`);
//           }
//         }

//       } catch (fetchErr) {
//         console.error('Erreur lors de la récupération des line_items:', fetchErr);
//       }
//       break;

//     default:
//       console.log(`Événement non géré : ${event.type}`);
//   }

//   res.status(200).json({ received: true });
// };




























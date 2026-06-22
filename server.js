import express from "express";
import cors from "cors";
import db from "./db/db.js";
import path from "node:path";
import { fileURLToPath } from 'node:url';

// Import des fonctions de contrôleur nécessaires
import { stripeWebhook } from "./controllers/stripe.controller.js"; 
// Import des routes
import articleRoutes from "./routes/article.route.js";
import categorieRoutes from "./routes/categorie.route.js";
import userRoutes from "./routes/user.route.js";
import imageRoutes from "./routes/image.route.js";
import panierRoutes from "./routes/panier.route.js";
import commandeRoutes from "./routes/commande.route.js";
import ligneCommandeRoutes from "./routes/ligneCommande.route.js";
import paymentRoutes from "./routes/stripe.route.js";

// IMPORTS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express
const app = express();

// Gestion du CORS (Peut rester ici)
app.use(cors({
origin: "http://localhost:5173", 
 credentials: true
}));

// On utilise express.raw() pour que le corps brut de la requête soit disponible pour la vérification de signature Stripe.
app.post("/api/payment/webhook", express.raw({type: 'application/json'}), stripeWebhook);

// Ce middleware est nécessaire pour toutes les autres routes (POST, PUT, etc.)
app.use(express.json());

// Définition des autres routes (elles utiliseront express.json())
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/paniers", panierRoutes);
app.use('/api/images', imageRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/ligneCommandes", ligneCommandeRoutes);

// Les autres routes Stripe (comme /checkout) qui ont besoin de express.json()
app.use('/api/payment', paymentRoutes); 

// Route pour gérer la redirection après un paiement réussi
app.get('/success', (req, res) => { res.send(`<h1 style="color: green; text-align: center;">Votre paiement a été un succès !</h1>`); });

// Appel de la configuration de la BDD
db();

// Port d'écoute - Cette ligne doit être la dernière ou presque.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));









// import express from "express";
// import cors from "cors";
// import db from "./db/db.js";
// import path from "node:path";
// import { fileURLToPath } from 'node:url';

// // Import des routes
// import articleRoutes from "./routes/article.route.js";
// import categorieRoutes from "./routes/categorie.route.js";
// import userRoutes from "./routes/user.route.js";
// import imageRoutes from "./routes/image.route.js";
// import panierRoutes from "./routes/panier.route.js";
// import commandeRoutes from "./routes/commande.route.js";
// import ligneCommandeRoutes from "./routes/ligneCommande.route.js";
// import paymentRoutes from "./routes/stripe.route.js";

// // IMPORT
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Express
// const app = express();

// // Middleware
// app.use(express.json());

// // Gestion du CORS
// app.use(cors({
//     origin: "http://localhost:5173", 
//     credentials: true                
// }));

// // Définition des routes
// app.use('/uploads', express.static(path.join(__dirname, "uploads")));
// app.use("/api/articles", articleRoutes);
// app.use("/api/categories", categorieRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/paniers", panierRoutes);
// app.use('/api/images', imageRoutes);
// app.use("/api/commandes", commandeRoutes);
// app.use("/api/ligneCommandes", ligneCommandeRoutes);
// app.use('/api/payment', paymentRoutes);
// // Route pour gérer la redirection après un paiement réussi
// app.get('/success', (req, res) => { res.send(`<h1 style="color: green; text-align: center;">Votre paiement a été un succès !</h1>`); });

// // Appel de la configuration de la BDD
// db();

// // Port d'écoute - Cette ligne doit être la dernière ou presque.
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

























// import express from "express"
// import cors from "cors"
// import db from "./db/db.js"
// import path from "node:path"
// import { fileURLToPath } from 'node:url';


// //Import des routes
// import articleRoutes from "./routes/article.route.js";
// import categorieRoutes from "./routes/categorie.route.js";
// import userRoutes from "./routes/user.route.js";
// import imageRoutes from "./routes/image.route.js";
// import panierRoutes from "./routes/panier.route.js";
// import commandeRoutes from "./routes/commande.route.js";
// import ligneCommandeRoutes from "./routes/ligneCommande.route.js";

// // IMPORT
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Express
// const app = express();

// // Gestion du json
// app.use(express.json());

// // Gestion du CORS
// app.use(cors({
//     origin: "http://localhost:5173", 
//     credentials: true                
// }))

// // Port d'écoute
// const PORT = process.env.PORT || 3000;

// // Appel de la configuration de la BDD
// db()

// // Appel de l'API
// app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

// app.use('/uploads', express.static(path.join(__dirname, "uploads")));
// app.use("/api/articles", articleRoutes);
// app.use("/api/categories", categorieRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/paniers", panierRoutes);
// app.use('/api/images', imageRoutes);
// app.use("/api/commandes", commandeRoutes);
// app.use("/api/ligneCommandes", ligneCommandeRoutes);

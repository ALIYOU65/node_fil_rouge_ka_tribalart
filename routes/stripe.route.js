// import { Router } from "express";
// import { createCheckoutSession } from "../controllers/stripe.controller.js"; 

// const router = Router();

// // Route pour la création d'une session de paiement
// router.post("/checkout", createCheckoutSession);

// export default router;


















































import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/stripe.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Route protégée par authMiddleware (JWT obligatoire)
router.post("/checkout", authMiddleware, createCheckoutSession);

// ✅ Route webhook (Stripe doit y accéder directement → pas de middleware ici)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;











































// import { Router } from "express";
// import { createCheckoutSession, stripeWebhook } from "../controllers/stripe.controller.js";
// import express from 'express';

// const router = Router();

// // Middleware pour analyser le corps brut des requêtes webhook
// router.post("/webhook", express.raw({type: 'application/json'}), stripeWebhook);

// // Route pour la création d'une session de paiement
// router.post("/checkout", createCheckoutSession);

// export default router;
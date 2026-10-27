import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/stripe.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route protégée par authMiddleware (JWT obligatoire)
router.post("/checkout", authMiddleware, createCheckoutSession);

// Route webhook (Stripe doit y accéder directement → pas de middleware ici)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;












































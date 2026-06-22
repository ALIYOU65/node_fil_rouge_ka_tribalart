import joi from "joi";

export default function commandeValidation(body) {
const commandeCreate = joi.object({
    numero: joi.string().required(),
    statut: joi.string().valid("EN_ATTENTE", "PAYEE", "LIVREE").default("EN_ATTENTE"),
    prixTotal: joi.number().required(),
    date: joi.date(),
    user: joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    panier: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
    ligneCommandes: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)).default([])
 });

const commandeUpdate = joi.object({
    numero: joi.string(),
    statut: joi.string().valid("EN_ATTENTE", "PAYEE", "LIVREE"),
    prixTotal: joi.number(),
    date: joi.date(),
    user: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    panier: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
    ligneCommandes: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)).allow(null)
 });

  return {
   commandeCreate: commandeCreate.validate(body),
   commandeUpdate: commandeUpdate.validate(body),
  };
}
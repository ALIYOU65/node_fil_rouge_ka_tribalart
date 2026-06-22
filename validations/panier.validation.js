import joi from "joi";

export default function panierValidation(body) {
  const panierCreate = joi.object({
    statut: joi.string().valid("EN_COURS", "VALIDE").default("EN_COURS"),
    date: joi.date(),
    montantTotal: joi.number().default(0),
    articles: joi.array().items(
      joi.object({
        articleId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        prix: joi.number().required(),
        quantite: joi.number().default(1),
      })
    ),
    user: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    commande: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  });

  return {
    panierCreate: panierCreate.validate(body),
  };
}
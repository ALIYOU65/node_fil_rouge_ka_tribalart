import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    quantite: joi.number().positive().required(),
    prixTotal: joi.number().required(),
    article: joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    commande: joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
  });

  const ligneCommandeUpdate = joi.object({
    quantite: joi.number().positive(),
    prixTotal: joi.number(),
    article: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    commande: joi.string().regex(/^[0-9a-fA-F]{24}$/)
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
  };
}


































// import joi from "joi";

// export default function ligneCommandeValidation(body) {
//  const ligneCommandeCreate = joi.object({
//       quantite: joi.number().positive().required(),
//       prixTotal: joi.number().required(),
//       article: joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
//       commande: joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
//   });

//   const ligneCommandeUpdate = joi.object({
//       quantite: joi.number().positive(),
//       prixTotal: joi.number(),
//       article: joi.string().regex(/^[0-9a-fA-F]{24}$/),
//       commande: joi.string().regex(/^[0-9a-fA-F]{24}$/)
//   });

//   return {
//     ligneCommandeCreate: ligneCommandeCreate.validate(body),
//     ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
//   };
// }

import joi from "joi";

export default function imageValidation(body) {
  // Schéma pour une seule image dans le tableau
  const singleImageSchema = joi.object({
    url: joi.string().uri().required(),
    filename: joi.string().optional(),
  });

  // Validation lors de la création
  const imageCreate = joi.object({
    nom: joi.string().required().messages({
      "any.required": "Le nom de l'image est requis.",
    }),
    alt: joi.string().optional(),
    images: joi.array().items(singleImageSchema).required(),
  });

  // Validation lors de la mise à jour
  const imageUpdate = joi.object({
    nom: joi.string().optional(),
    alt: joi.string().optional(),
    images: joi.array().items(singleImageSchema).optional(),
  });

  return {
    imageCreate: imageCreate.validate(body),
    imageUpdate: imageUpdate.validate(body),
  };
}











// import joi from "joi";

// export default function imageValidation(body) {
//   // Schéma pour un seul fichier image
//   const singleImageSchema = joi.object({
//     url: joi.string().uri().required(),   // on s’assure que c’est une URL
//     filename: joi.string().optional(),    // si tu veux stocker le nom physique
//   });

//   // Validation pour la création
//   const imageCreate = joi.object({
//     nom: joi.string().required(),   
//     alt: joi.string().optional(),
//     images: joi.array().items(singleImageSchema).min(1).required(), 
//   });

//   // Validation pour la mise à jour
//   const imageUpdate = joi.object({
//     nom: joi.string().optional(),   
//     alt: joi.string().optional(),
//     images: joi.array().items(singleImageSchema).min(1).optional(), 
//   });

//   return {
//     imageCreate: imageCreate.validate(body),
//     imageUpdate: imageUpdate.validate(body),
//   };
// }


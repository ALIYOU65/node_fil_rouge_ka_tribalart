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











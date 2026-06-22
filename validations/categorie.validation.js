import joi from "joi";

export default function categorieValidation(body){
    const categorieCreate = joi.object({
          nom: joi.string().required()
    })

    const categorieUpdate = joi.object({
          nom: joi.string()
    });

    return {
        categorieCreate: categorieCreate.validate(body),
        categorieUpdate: categorieUpdate.validate(body),
    }
}

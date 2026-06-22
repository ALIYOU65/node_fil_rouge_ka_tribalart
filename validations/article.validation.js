import joi from "joi";

export default function articleValidation(body){
    const articleCreate = joi.object({
      nom: joi.string().required(),
      description: joi.string().required(),
      prix: joi.number(),
      origine: joi.string(),
      categories: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
      images: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    })

    const articleUpdate = joi.object({
      nom: joi.string(),
      description: joi.string(),
      prix: joi.number(),
      origine: joi.string(),
      pegi: joi.number(),
      categories: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
      images: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    })

    const articleAddOrRemove = joi.object({
      images: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    })

    return {
        articleCreate: articleCreate.validate(body),
        articleUpdate: articleUpdate.validate(body),
        articleAddOrRemove: articleAddOrRemove.validate(body)
    }
}
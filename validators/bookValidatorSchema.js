const Joi = require("joi");

const bookValidatorSchema = {
  createBookRequestModel: Joi.object({
    name: Joi.string().max(100).required(),
    author: Joi.string().max(100).required(),
    publicationYear: Joi.number().required(),
    price: Joi.number().required(),
    exhibitorBoothNumber: Joi.number().required(),
  }),
  bookListingRequestModel: Joi.object({
    keyword: Joi.string().allow("").trim().optional(),
    page: Joi.number().empty("").default(1).optional(),
    limit: Joi.number().empty("").default(20).max(500).optional(),
  }),
};

module.exports = bookValidatorSchema;

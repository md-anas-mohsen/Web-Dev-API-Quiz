const Joi = require("joi");

const userValidatorSchema = {
  registerUserRequestModel: Joi.object({
    name: Joi.string().max(25).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
  }),
  loginUserRequestModel: Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
  refreshUserTokenRequestModel: Joi.object({
    refreshToken: Joi.string().required(),
  }),
  createUserRequestModel: Joi.object({
    name: Joi.string().max(25).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid("user", "admin"),
  }),
  updateUserUsingAdminPrivilegeRequestModel: Joi.object({
    name: Joi.string().max(25).optional(),
    password: Joi.string().min(6).optional(),
    email: Joi.string().lowercase().email().required().optional(),
    role: Joi.string().valid("user", "admin").optional(),
  }),
  userListingRequestModel: Joi.object({
    keyword: Joi.string().allow("").trim().optional(),
    page: Joi.number().empty("").default(1).optional(),
    limit: Joi.number().empty("").default(20).max(500).optional(),
  }),
};

module.exports = userValidatorSchema;

const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');

const login = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string()
            .trim()
            .email()
            .required(),
        password: Joi.string()
            .required()
    });

    validatorHandler(req, res, next, schema);
};

module.exports = {
    login
};

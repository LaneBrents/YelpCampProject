const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({ // These are the server side validations if someone were to get past the client-side
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required()
});
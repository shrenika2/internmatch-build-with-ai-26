const Joi = require('joi');

const validateStudentProfile = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().required().max(100),
        branch: Joi.string().required(),
        year: Joi.number().integer().min(1).max(4).required(),
        collegeId: Joi.string().required(),
        bio: Joi.string().max(500).allow('', null),
        skills: Joi.array().items(Joi.string()),
        techStack: Joi.array().items(Joi.string()),
        cpProfiles: Joi.object({
            leetcode: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
            codeforces: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
            codechef: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
        }).default({}),
        links: Joi.object({
            linkedin: Joi.string().uri({ scheme: ['http', 'https'] }).pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/).allow('', null),
            github: Joi.string().uri({ scheme: ['http', 'https'] }).pattern(/^https?:\/\/(www\.)?github\.com\/.*$/).allow('', null),
            portfolio: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
        }).default({}),
        resumeUrl: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
        experiences: Joi.array().items(Joi.object({
            title: Joi.string().required(),
            company: Joi.string().required(),
            description: Joi.string().allow('', null),
            startDate: Joi.date().required(),
            endDate: Joi.date().allow('', null),
            isCurrent: Joi.boolean().default(false),
        })).default([]),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

module.exports = {
    validateStudentProfile,
};

const Joi = require('joi');

const validateStudentProfile = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().required().max(100),
        branch: Joi.string().required(),
        year: Joi.number().integer().min(1).max(4).required(),
        collegeId: Joi.string().required(),
        college: Joi.string().required(),
        location: Joi.string().allow('', null),
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
        resumeFileUrl: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
        parsedSkills: Joi.array().items(Joi.string()).allow(null),
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

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().min(2).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        role: Joi.string().valid('student', 'faculty', 'company').required(),
        studentProfile: Joi.object({
            branch: Joi.string().allow('', null),
            year: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null),
            college: Joi.string().allow('', null),
            cgpa: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null),
            skills: Joi.array().items(Joi.string()).default([]),
            links: Joi.object({
                linkedin: Joi.string().uri().allow('', null),
                github: Joi.string().uri().allow('', null),
                portfolio: Joi.string().uri().allow('', null),
            }).default({})
        }).when('role', { is: 'student', then: Joi.required(), otherwise: Joi.optional() }),
        companyProfile: Joi.object({
            companyName: Joi.string().allow('', null),
            hrEmail: Joi.string().email().allow('', null),
        }).when('role', { is: 'company', then: Joi.required(), otherwise: Joi.optional() }),
        facultyProfile: Joi.object({
            department: Joi.string().allow('', null),
            designation: Joi.string().allow('', null),
        }).when('role', { is: 'faculty', then: Joi.required(), otherwise: Joi.optional() }),
    });
    return schema.validate(data);
};

module.exports = {
    validateStudentProfile,
    validateLogin,
    validateRegister,
};

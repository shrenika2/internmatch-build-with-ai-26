const asyncHandler = require('express-async-handler');

// Hardcoded knowledge base for mock questions
const questionBank = {
    'Frontend Developer': {
        technical: [
            "Explain the concept of React hooks and how they differ from class lifecycle methods.",
            "Describe the Critical Rendering Path and how you would optimize a web page for performance.",
            "What is the Virtual DOM and how does React's reconciliation algorithm work?",
            "How do you handle state management in large-scale React applications?",
            "Explain the difference between SSR (Server-Side Rendering) and CSR (Client-Side Rendering)."
        ],
        behavioral: [
            "Tell me about a time you had to learn a new technology quickly to meet a project deadline.",
            "Describe a situation where you disagreed with a designer's UI/UX choice. How did you resolve it?",
            "Tell me about a time you successfully optimized a slow web application."
        ]
    },
    'Backend Developer': {
        technical: [
            "Explain the differences between REST and GraphQL APIs. When would you use each?",
            "How do you design a scalable microservices architecture?",
            "Describe the ACID properties in database transactions and why they are important.",
            "What strategies would you use to secure an API against common vulnerabilities (OWASP top 10)?",
            "Explain indexing in databases and the trade-offs of using it heavily."
        ],
        behavioral: [
            "Tell me about a time when a critical system failed in production. How did you handle the outage?",
            "Describe a project where you had to collaborate closely with frontend teams to define API contracts.",
            "How do you handle prioritizing technical debt vs. shipping new features?"
        ]
    },
    'Data Scientist': {
        technical: [
            "Explain the bias-variance tradeoff in machine learning models.",
            "How do you deal with highly imbalanced datasets when training a classification model?",
            "Describe the difference between bagging and boosting ensemble methods.",
            "What evaluation metrics would you choose for a model predicting rare fraudulent transactions?",
            "Explain the concept of Principal Component Analysis (PCA) and its applications."
        ],
        behavioral: [
            "Tell me about a time you had to explain a complex ML model to a non-technical stakeholder.",
            "Describe a situation where your model performed well offline but failed in production.",
            "How do you handle incomplete or very messy datasets?"
        ]
    },
    'Default': {
        technical: [
            "Walk me through your problem-solving process when debugging an unfamiliar codebase.",
            "Explain a complex technical concept you recently learned as simply as possible.",
            "How do you ensure your code is readable, maintainable, and well-tested?",
            "Describe a challenging technical problem you solved recently.",
            "What is your approach to learning new programming languages or frameworks?"
        ],
        behavioral: [
            "Tell me about a time you made a mistake that affected your team, and how you recovered.",
            "Describe a situation where you had to work under a tight deadline.",
            "How do you handle receiving critical feedback on your work?"
        ]
    }
};

/**
 * @desc    Generate mock interview questions based on role and experience
 * @route   POST /api/ai/generate-questions
 * @access  Private (Student)
 */
const getMockQuestions = asyncHandler(async (req, res) => {
    const { jobRole = '', experience = '0' } = req.body;

    // Determine the category
    let categoryKey = 'Default';
    const roleLower = jobRole.toLowerCase();

    if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('web developer')) {
        categoryKey = 'Frontend Developer';
    } else if (roleLower.includes('backend') || roleLower.includes('api') || roleLower.includes('server')) {
        categoryKey = 'Backend Developer';
    } else if (roleLower.includes('data') || roleLower.includes('ml') || roleLower.includes('machine learning')) {
        categoryKey = 'Data Scientist';
    }

    const { technical, behavioral } = questionBank[categoryKey];

    // Helper to shuffle array
    const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

    // Pick 3 technical and 2 behavioral
    const selectedTechnical = shuffleArray(technical).slice(0, 3);
    const selectedBehavioral = shuffleArray(behavioral).slice(0, 2);

    // Combine and shuffle the final set
    const finalSet = shuffleArray([...selectedTechnical, ...selectedBehavioral]);

    res.status(200).json({
        success: true,
        roleMatched: categoryKey,
        experienceAssumed: experience,
        questions: finalSet
    });
});

module.exports = {
    getMockQuestions
};

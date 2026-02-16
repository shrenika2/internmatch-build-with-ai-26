const OpenAI = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const path = require('path');
const env = require('../config/env');
const logger = require('../utils/logger');
const fs = require('fs');


const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

/**
 * AI Service for Resume Parsing and Skill Matching
 * TRACE: Resume File -> Text Extraction -> Skill Parsing -> Keyword Matching -> Score
 */
const aiService = {
    /**
     * Extract text from a PDF buffer using pdf-parse
     * @param {Buffer} buffer - PDF file buffer
     */
    extractTextFromPDF: async (buffer) => {
        try {
            const data = await pdf(buffer);
            const text = data.text || '';
            logger.info(`[AI_SERVICE] PDF Parsed. Raw Length: ${text.length || 0}`);

            // IMAGE-BASED PDF CHECK: 
            // Image-based PDFs fail because they contain raw pixel data instead of a selectable text layer.
            // Standard parsers cannot "read" them without OCR (Optical Character Recognition).
            // Users should regenerate the PDF from a text editor or use an editable format like DOCX.
            if (text.trim().length < 50) {
                return {
                    success: false,
                    errorType: 'IMAGE_BASED_PDF',
                    message: 'This PDF appears to be image-based or scanned. AI cannot extract text from images. Please upload a text-based PDF or DOCX resume.'
                };
            }

            return { success: true, text };
        } catch (error) {
            logger.error(`[AI_SERVICE] PDF Extraction Error: ${error.message}`);
            // Return structured error instead of throwing a crash
            return {
                success: false,
                errorType: 'EXTRACTION_FAILED',
                message: 'The PDF file structure is unreadable or corrupted. Please try a different version.'
            };
        }
    },

    /**
     * Extract text from a DOCX buffer using mammoth
     * @param {Buffer} buffer - DOCX file buffer
     */
    extractTextFromDOCX: async (buffer) => {
        try {
            const result = await mammoth.extractRawText({ buffer });
            const text = result.value || '';
            logger.info(`[AI_SERVICE] DOCX Parsed. Raw Length: ${text.length || 0}`);

            if (text.trim().length < 50) {
                return {
                    success: false,
                    errorType: 'EMPTY_DOCX',
                    message: 'The DOCX file contains no readable text or is empty.'
                };
            }

            return { success: true, text };
        } catch (error) {
            logger.error(`[AI_SERVICE] DOCX Extraction Error: ${error.message}`);
            return {
                success: false,
                errorType: 'EXTRACTION_FAILED',
                message: 'Failed to extract text from the DOCX file.'
            };
        }
    },

    /**
     * Fetch file from URL and extract text (PDF or DOCX)
     * Handles buffering and stream conversion
     * @deprecated Use extractTextFromFile for direct uploads
     */
    extractTextFromURL: async (url) => {
        if (!url) return { success: false, message: 'No URL provided' };

        try {
            logger.info(`[AI_SERVICE] Fetching resume from: ${url}`);
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
            const buffer = Buffer.from(response.data);

            // Routing based on extension
            if (url.toLowerCase().split('?')[0].endsWith('.docx')) {
                return await aiService.extractTextFromDOCX(buffer);
            } else {
                return await aiService.extractTextFromPDF(buffer);
            }
        } catch (error) {
            logger.error(`[AI_SERVICE] File Fetching/Extraction Error: ${error.message}`);
            return {
                success: false,
                errorType: 'FETCH_FAILED',
                message: 'Failed to fetch the resume asset from the target URL.'
            };
        }
    },

    /**
     * Extract text directly from a local file path
     * @param {string} filePath - Path to the file on disk
     */
    extractTextFromFile: async (filePath) => {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'File not found on disk.' };
            }

            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(filePath).toLowerCase();

            if (ext === '.docx') {
                return await aiService.extractTextFromDOCX(buffer);
            } else {
                return await aiService.extractTextFromPDF(buffer);
            }
        } catch (error) {
            logger.error(`[AI_SERVICE] Local File Extraction Error: ${error.message}`);
            return {
                success: false,
                errorType: 'LOCAL_READ_FAILED',
                message: 'Internal error reading the local file asset.'
            };
        }
    },

    /**
     * Delete a temporary file from disk
     * @param {string} filePath 
     */
    deleteTempFile: (filePath) => {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) logger.error(`[AI_SERVICE] Failed to delete temp file: ${err.message}`);
                else logger.info(`[AI_SERVICE] Temp file deleted: ${filePath}`);
            });
        }
    },


    /**
     * Parse resume text and extract skills using OpenAI GPT
     * Uses structured JSON response format
     */
    extractSkills: async (extractionResult) => {
        // Handle structured error from extraction phase
        if (typeof extractionResult === 'object' && extractionResult.success === false) {
            logger.warn(`[AI_SERVICE] Extraction failed, skipping AI parsing: ${extractionResult.message}`);
            return { skills: [], error: extractionResult.message };
        }

        const resumeText = typeof extractionResult === 'object' ? extractionResult.text : extractionResult;

        if (!resumeText || resumeText.trim().length < 50) {
            logger.warn('[AI_SERVICE] Resume text too short or empty. Extraction aborted.');
            return { skills: [] };
        }

        if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key') {
            logger.warn('[AI_SERVICE] Missing OpenAI API Key. Using fallback skills.');
            return { skills: ["JavaScript", "Node.js", "React"] };
        }

        try {
            const prompt = `
                You are high-precision Recruitment AI. Analyze the resume text provided.
                EXTRACT a clean list of technical skills, frameworks, and tools.
                NORMALIZE them (e.g., "React.js" -> "React", "NodeJS" -> "Node.js").
                REMOVE soft skills like "leadership" or "teamwork".
                RETURN ONLY JSON: {"skills": ["Skill1", "Skill2"]}

                RESUME TEXT:
                ${resumeText.substring(0, 6000)}
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-0125",
                messages: [
                    { role: "system", content: "You are a professional resume parsing engine that only outputs JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            const parsed = JSON.parse(completion.choices[0].message.content);
            const skills = Array.isArray(parsed.skills) ? parsed.skills : [];

            logger.info(`[AI_SERVICE] OpenAI extracted ${skills.length} skills.`);
            return { skills };
        } catch (error) {
            logger.error(`[AI_SERVICE] OpenAI Skill Parsing Error: ${error.message}`);
            return { skills: [] };
        }
    },

    /**
     * Skill matching logic (Percentage match)
     * Case-insensitive fuzzy matching for keywords
     */
    calculateMatchScore: (resumeSkills, requiredSkills) => {
        if (!requiredSkills || requiredSkills.length === 0) {
            logger.info('[AI_SERVICE] No required skills for this opportunity. Score: 100');
            return 100;
        }
        if (!resumeSkills || resumeSkills.length === 0) {
            logger.warn('[AI_SERVICE] No skills found in resume. Score: 0');
            return 0;
        }

        const rSkills = resumeSkills.map(s => s.toLowerCase().trim());
        const targetSkills = requiredSkills.map(s => s.toLowerCase().trim());

        // Find matches (Case-insensitive keyword overlap)
        const matched = targetSkills.filter(req =>
            rSkills.some(res => res.includes(req) || req.includes(res))
        );

        const score = Math.round((matched.length / targetSkills.length) * 100);
        logger.info(`[AI_SERVICE] Matched ${matched.length}/${targetSkills.length} skills. Score: ${score}%`);

        return Math.min(score, 100);
    }
};

module.exports = aiService;

const axios = require('axios');
const logger = require('./logger');

/**
 * GitHub API Service for Project Evaluation
 * Fetches metrics: Commits, Contributors, PRs, and Activity.
 */
const githubService = {
    /**
     * Parses GitHub URL to extract owner and repo name
     * Supports: https://github.com/owner/repo or owner/repo
     */
    parseUrl: (url) => {
        if (!url) return null;
        const cleanUrl = url.replace('https://github.com/', '').replace('.git', '');
        const parts = cleanUrl.split('/');
        if (parts.length >= 2) {
            return { owner: parts[0], repo: parts[1] };
        }
        return null;
    },

    /**
     * Fetch repository metrics
     * @param {string} repositoryUrl 
     */
    getRepoMetrics: async (repositoryUrl) => {
        const target = githubService.parseUrl(repositoryUrl);
        if (!target) return null;

        const { owner, repo } = target;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            // Token should be in .env if available to avoid rate limits
            ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
        };

        try {
            logger.info(`[GITHUB] Fetching metrics for ${owner}/${repo}`);

            // 1. Fetch Commits (stats/contributors gives a nice overview)
            const statsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/stats/contributors`, { headers, timeout: 5000 });
            const contributorsData = statsRes.data || [];

            const totalCommits = contributorsData.reduce((acc, curr) => acc + curr.total, 0);
            const contributorCount = contributorsData.length;

            // 2. Fetch Pull Requests
            const prsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, { headers, timeout: 5000 });
            const prCount = (prsRes.data || []).length;

            // 3. Fetch README content for documentation analysis
            let readmeContent = '';
            try {
                const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
                const readmeData = readmeRes.data;
                if (readmeData.content) {
                    readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
                }
            } catch (e) {
                logger.warn(`[GITHUB] README not found for ${owner}/${repo}`);
            }

            // Calculate Normalized Git Score (0-10)
            // Logic: 
            // - Commits (Max 5 points): >100 commits = 5, else linearly scaled
            // - Contributors (Max 2 points): >2 contributors = 2, 1 = 1
            // - PRs (Max 3 points): >5 PRs = 3, else scaled
            const commitScore = Math.min(5, (totalCommits / 100) * 5);
            const contribScore = Math.min(2, contributorCount);
            const prScore = Math.min(3, (prCount / 5) * 3);

            const gitScore = parseFloat((commitScore + contribScore + prScore).toFixed(1));

            return {
                gitScore,
                totalCommits,
                contributorCount,
                prCount,
                readmeContent,
                repoFullName: `${owner}/${repo}`
            };

        } catch (error) {
            logger.error(`[GITHUB] API Failure: ${error.message}`);
            return null;
        }
    }
};

module.exports = githubService;

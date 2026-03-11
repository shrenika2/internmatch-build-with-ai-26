const calculateMatchScore = (studentProfile, opportunity) => {
    let score = 0;
    const breakdown = {
        keywordMatch: 0,
        experienceAlignment: 0,
        education: 0,
        projectRelevance: 0,
        details: []
    };

    // 1. Keyword Match (40%)
    const studentSkills = [
        ...(studentProfile.parsedSkills || []),
        ...(studentProfile.skills || [])
    ].map(s => String(s).toLowerCase().trim());
    
    const requiredSkills = (opportunity.requiredSkills || []).map(s => String(s).toLowerCase().trim());
    
    if (requiredSkills.length > 0) {
        let matchedSkillsCount = 0;
        requiredSkills.forEach(reqSkill => {
            const isMatch = studentSkills.some(studentSkill => 
                studentSkill.includes(reqSkill) || reqSkill.includes(studentSkill)
            );
            if (isMatch) matchedSkillsCount++;
        });
        
        const keywordScore = (matchedSkillsCount / requiredSkills.length) * 40;
        score += keywordScore;
        breakdown.keywordMatch = Math.round(keywordScore);
        breakdown.details.push(`Matched ${matchedSkillsCount} out of ${requiredSkills.length} required skills.`);
    } else {
        score += 40;
        breakdown.keywordMatch = 40;
        breakdown.details.push('No specific skills required by opportunity (automatic full points).');
    }

    // 2. Experience Alignment (30%)
    let totalExpMonths = 0;
    if (studentProfile.experiences && studentProfile.experiences.length > 0) {
        studentProfile.experiences.forEach(exp => {
            if (exp.startDate) {
                const start = new Date(exp.startDate);
                const end = exp.isCurrent || !exp.endDate ? new Date() : new Date(exp.endDate);
                const diffMonths = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24 * 30));
                totalExpMonths += diffMonths;
            }
        });
    }

    const reqExpMonths = opportunity.eligibilityCriteria?.minExperience || opportunity.minExperience || 0;
    if (reqExpMonths > 0) {
        if (totalExpMonths >= reqExpMonths) {
            score += 30;
            breakdown.experienceAlignment = 30;
            breakdown.details.push(`Meets experience requirement (${totalExpMonths} months).`);
        } else {
            const expScore = (totalExpMonths / reqExpMonths) * 30;
            score += expScore;
            breakdown.experienceAlignment = Math.round(expScore);
            breakdown.details.push(`Partial experience match (${totalExpMonths} / ${reqExpMonths} months).`);
        }
    } else {
        if (totalExpMonths > 0) {
            score += 30;
            breakdown.experienceAlignment = 30;
            breakdown.details.push(`Candidate has ${totalExpMonths} months of experience (None required).`);
        } else {
            score += 20; // baseline if no exp required and no exp
            breakdown.experienceAlignment = 20;
            breakdown.details.push('No prior experience, but none required.');
        }
    }

    // 3. Education/CGPA (20%)
    const studentCGPA = studentProfile.cgpa || 0;
    const reqCGPA = opportunity.eligibilityCriteria?.minCGPA || 0;
    
    if (reqCGPA > 0) {
        if (studentCGPA >= reqCGPA) {
            score += 20;
            breakdown.education = 20;
            breakdown.details.push(`CGPA meets requirement (${studentCGPA} >= ${reqCGPA}).`);
        } else {
            const diff = reqCGPA - studentCGPA;
            if (diff <= 1.0) {
                const cgpaScore = Math.max(0, 20 - (diff * 20));
                score += cgpaScore;
                breakdown.education = Math.round(cgpaScore);
                breakdown.details.push(`CGPA is below requirement (${studentCGPA} < ${reqCGPA}).`);
            } else {
                breakdown.details.push(`CGPA significantly below requirement (${studentCGPA}).`);
            }
        }
    } else {
        score += 20;
        breakdown.education = 20;
        breakdown.details.push('No minimum CGPA required.');
    }

    // 4. Project Relevance (10%)
    const descText = opportunity.description ? String(opportunity.description).toLowerCase() : '';
    let relevanceScore = 0;
    
    if (descText) {
        const titleText = opportunity.title ? String(opportunity.title).toLowerCase() : '';
        const searchTerms = [...requiredSkills, titleText].filter(Boolean);
        
        let studentTextBlock = '';
        if (studentProfile.experiences) {
            studentTextBlock += studentProfile.experiences.map(e => (e.title || '') + ' ' + (e.description || '')).join(' ').toLowerCase();
        }
        
        if (studentProfile.projects) { 
             studentTextBlock += studentProfile.projects.map(p => (p.title || '') + ' ' + (p.description || '')).join(' ').toLowerCase();
        }
        
        studentTextBlock += studentSkills.join(' ').toLowerCase();
        
        let matchCount = 0;
        for (const term of searchTerms) {
            if (term.length > 3 && studentTextBlock.includes(term)) {
                matchCount++;
            }
        }
        
        if (searchTerms.length > 0) {
             const ratio = matchCount / searchTerms.length;
             relevanceScore = Math.min(10, Math.round(ratio * 15));
        } else {
             relevanceScore = 5;
        }

        score += relevanceScore;
        breakdown.projectRelevance = relevanceScore;
        breakdown.details.push(`Project/Experience relevance score: ${relevanceScore}/10.`);
    } else {
        score += 10;
        breakdown.projectRelevance = 10;
        breakdown.details.push('No description to match project relevance against.');
    }

    return {
        score: Math.min(100, Math.round(score)),
        breakdown
    };
};

module.exports = { calculateMatchScore };

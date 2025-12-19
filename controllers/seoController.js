const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// Very small heuristic SEO generator as a safe local fallback.
const generateSEO = async (req, res) => {
	try {
		const { title = '', description = '' } = req.body || {};
		const cleanDesc = stripHtml(description || '');

		// SEO title: prefer given title, otherwise first 60 chars of description
		let seoTitle = title && String(title).trim() ? String(title).trim() : cleanDesc.slice(0, 60);
		if (seoTitle.length > 60) seoTitle = seoTitle.slice(0, 57) + '...';

		// SEO description: first 150 chars of cleaned description
		let seoDescription = cleanDesc.slice(0, 157);
		if (seoDescription.length >= 157) seoDescription = seoDescription.slice(0, 154) + '...';

		// SEO keywords: take title words + most common words from description (filter short/common words)
		const common = new Set(['the','and','for','with','that','this','from','your','are','was','but','have','has','who','what','which','when','where','how','a','an','in','on','of','to','is','it']);
		const titleWords = String(seoTitle).toLowerCase().split(/[^a-z0-9]+/).filter(w => w && w.length > 2 && !common.has(w));
		const descWords = cleanDesc.toLowerCase().split(/[^a-z0-9]+/).filter(w => w && w.length > 3 && !common.has(w));
		const freq = {};
		descWords.forEach(w => freq[w] = (freq[w]||0) + 1);
		const descTop = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]);
		const keywords = Array.from(new Set([...titleWords.slice(0,5), ...descTop])).slice(0,10);

		return res.json({ seoTitle, seoDescription, seoKeywords: keywords });
	} catch (err) {
		console.error('generateSEO error:', err);
		return res.status(500).json({ message: 'Failed to generate SEO' });
	}
};

module.exports = { generateSEO };

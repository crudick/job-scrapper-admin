const _ = require('lodash');

// Import helper functions
const {
	compose,
	composeAsync,
	extractNumber,
	enforceHttpsUrl,
	fetchHtmlFromUrl,
	extractFromElems,
	fromPairsToObject,
	fetchElemInnerText,
	fetchElemAttribute,
	extractUrlAttribute
} = require("./helpers");

// scotch.io (Base URL)
const LINKEDIN_BASE = "https://www.linkedin.com/jobs/";

///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Resolves the url as relative to the base scotch url
 * and returns the full URL
 */
const scotchRelativeUrl = url =>
	_.isString(url) ? `${LINKEDIN_BASE}${url.replace(/^\/*?/, "/")}` : null;

/**
 * Extract a single post from container element
 */
const extractPost = elem => {
	
	const position = elem.find('a.result-card__full-card-link');
	const company = elem.find('a[data-tracking-control-name="public_jobs_job-result-card_result-card_subtitle-click"]');
	const time = elem.find('time.job-result-card__listdate');
	const postingId = elem.attr('data-job-id');
	return {
		position: fetchElemInnerText(position),
		company: fetchElemInnerText(company),
		postingId: postingId,
		age: fetchElemInnerText(time),
		source: 'LinkedIn'
	};
};


/**
 * Extract profile from a Scotch author's page using the Cheerio parser instance
 * and returns the author profile object
 */
const extractJobPostings = $ => {
	
	const searchTitle = $('span.results-context-header__query-search');
	const extractPosts = extractFromElems(extractPost)();
	const joblist = $('ul.jobs-search__results-list');
	const jobPosts = joblist.find("li.job-result-card");
	
	console.log('jobs: ' + jobPosts.length);
	return Promise.all([
		fetchElemInnerText(searchTitle),
		extractPosts(jobPosts)($)
	]).then(([ title, posts ]) => ({ title, posts }));

};

/**
 * Fetches the Scotch profile of the given author
 */
const fetchJobPostings = (keywords, city, state) => {
	//search/?keywords=solutions%20architect&location=Greater%20Minneapolis-St.%20Paul%20Area
	
	const SEARCH_URL = `${LINKEDIN_BASE}search/?keywords=${keywords}&location=${city}%2C%20${state}`;
	return composeAsync(extractJobPostings, fetchHtmlFromUrl)(SEARCH_URL);
};

module.exports = { fetchJobPostings };
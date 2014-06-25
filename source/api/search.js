var middleware = require('../middleware');
var search = require('../models/search');

function searchService(app) {
	app.get('/api/search',
		middleware.analytics.track('search', {query: 'text'}),
		middleware.paging(),
		searchItems);

	function searchItems(req, res, next) {
		search.items(req.user, req.query, req.paging, function (err, results) {
			if (err) {
				return next(err);
			}

			res.json(results);
		});
	}
}

module.exports = searchService;

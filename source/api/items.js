var items = require('../models/items');
var users = require('../models/users');
var middleware = require('../middleware');

function itemsService(app) {
	app.get('/api/items',
		middleware.paging(),
		getItems
	);

	app.get('/api/items/user/:id',
		middleware.validate.id('id'),
		middleware.paging(),
		getUserItems
	);

	app.get('/api/items/count',
		middleware.access.guest(),
		getItemsCount
	);

	app.get('/api/items/inbox',
		middleware.paging(),
		getInbox
	);

	app.get('/api/items/inbox/count',
		getInboxCount
	);

	app.get('/api/items/:type',
		middleware.paging(),
		getItemsByType
	);

	app.del('/api/items/:id',
		middleware.validate.id('id'),
		hideItem
	);

	app.put('/api/items/:id/read',
		middleware.validate.id('id'),
		readItem
	);

	app.post('/api/items/:id/flag',
		middleware.validate.id('id'),
		flagItem
	);

	app.get('/api/items/id/:id',
		middleware.validate.id('id'),
		getItemById
	);

	app.post('/api/items/:id/comment',
		middleware.validate.id('id'),
		postComment);

	function getItems (req, res, next) {
		items.getAllItems(req.user, req.paging, function (err, results) {
			if (err) {
				return next({message: 'failed to get items', user: req.user, err: err, status: err.status || 500});
			}

			if (results.data) {
				results.data = results.data.map(items.transform);
			}

			res.json(results);
		});
	}

	function getUserItems (req, res, next) {
		users.findById(req.params.id, function (err, user) {
			if (err) {
				return next({message: 'failed to get user by id', user: req.params.id, err: err, status: err.status || 500});
			}

			if (!user) {
				return next({message: 'user not found', user: req.params.id, err: err, status: 404});
			}

			items.getAllItems(user, req.paging, function (err, results) {
				if (err) {
					return next({message: 'failed to get items for user', byUser: req.user, forUser: req.params.id, err: err, status: err.status || 500});
				}

				if (results.data) {
					results.data = results.data.map(items.transform);
				}

				res.json(results);
			});
		});
	}

	function getItemById(req, res, next) {
		items.getById(req.user, req.params.id, function (err, item) {
			if (err) {
				return next(err);
			}

			if (!item) {
				return next({message: 'item not found', item: req.params.id, status: 404});
			}

			item = items.transform(item);

			res.json(item);
		});
	}

	function getItemsCount(req, res, next) {
		items.getItemsCount(function (err, count) {
			if (err) {
				return next({message: 'failed to get items count', err: err, status: err.status || 500});
			}

			res.json(count);
		});
	}

	function getItemsByType (req, res, next) {
		var type = req.params.type;
		items.getItemsByType(req.user, type, req.paging, function (err, results) {
			if (err) {
				return next({message: 'failed to get items for user by type', user: req.user, type: type, error: err, status: err.status || 500});
			}

			if (results.data) {
				results.data = results.data.map(items.transform);
			}

			res.json(results);
		});
	}

	function getInbox(req, res, next) {
		var user = req.user;
		items.getInbox(user, req.paging, function (err, results) {
			if (err) {
				return next({message: 'failed to get items inbox', user: req.user, err: err, status: err.status || 500});
			}

			if (results.data) {
				results.data = results.data.map(items.transform);
			}

			res.json(results);
		});
	}

	function getInboxCount(req, res, next) {
		var user = req.user;
		items.getInboxCount(user, function (err, result) {
			if (err) {
				return next({message: 'failed to get items inbox', user: req.user, err: err, status: err.status || 500});
			}

			res.json(result);
		});
	}

	function hideItem(req, res, next) {
		items.hideItem(req.user, req.params.id, function (err) {
			if (err) {
				return next(err);
			}

			res.json(200, {});
		});
	}

	function flagItem(req, res, next) {
		var reason = req.body.reason || 'No reason';
		items.flagItem(req.user, req.params.id, reason, function (err) {
			if (err) {
				return next(err);
			}

			res.json(200, {});
		});
	}

	function readItem(req, res, next) {
		items.readItem(req.user, req.params.id, function (err) {
			if (err) {
				return next(err);
			}

			res.send(200);
		});
	}

	function postComment(req, res, next) {
		items.postComment(req.user, req.params.id, req.body, function (err, comment) {
			if (err) {
				return next(err);
			}

			res.json(201, comment);
		});
	}
}

module.exports = itemsService;

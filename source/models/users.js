var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var request = require('request');

var config = require('../../config');
var db = require('../db')(config);
var notifier = require('./notifier');

var userPickFields = [
	'_id',
	'avatar',
	'bio',
	'displayName',
	'email',
	'location',
	'name',
	'username',
	'registered',
	'website',
	'followCollections',
	'followed',
	'follows',
	'blockNetworks',
	'warning',
	'watchedPreview',
	'watchedOnlyExtension'
];

var followOmitFields = [
	'email'
];

var ObjectId = require('mongojs').ObjectId;

var maxUsersMatches = 16;

function transform(user) {
	user = _.pick(user, userPickFields);

	if (user.followed) {
		user.followed = user.followed.map(function (f) {
			return _.omit(f, followOmitFields);
		});
	}

	if (user.follows) {
		user.follows = user.follows.map(function (f) {
			return _.omit(f, followOmitFields);
		});
	}

	return user;
}

function findById (id, callback) {
	if (typeof id === 'string') {
		id = new ObjectId(id);
	}

	db.users.findOne({ _id: id }, function (err, user) {
		if (err) {
			return callback(err);
		}

		callback(null, user);
	});
}

function findByEmail (email, callback) {
	db.users.findOne({ email: email }, function (err, user) {
		if (err) {
			return callback(err);
		}

		if (!user) {
			return callback({message: 'User not found', status: 404});
		}

		callback(null, user);
	});
}

function findByName(name, callback) {
	db.users.findOne({name: name}, function (err, user) {
		if (err) {
			return callback(err);
		}

		if (!user) {
			return callback({message: 'User not found', status: 404});
		}

		callback(null, user);
	});
}

function findByAny(query, callback) {
	if (query.length < 3) {
		return callback({message: 'query string is shorter than 3 chars', status: 412});
	}

	var regex = {$regex: new RegExp('^' + query, 'i')};

	db.users.find({$or: [{name: regex}, {username: regex}, {displayName: regex}, {email: regex}]}).limit(maxUsersMatches, function (err, users) {
		if (err) {
			return callback(err);
		}

		callback(null, users);
	});
}

function findByRequestToken (tokenName, tokenValue, callback) {
	var query = {};
	query[tokenName] = tokenValue;

	db.users.findOne(query, function (err, user) {
		if (err) {
			return callback(err);
		}

		if (!user) {
			return callback({message: 'User not found', status: 404});
		}

		callback(null, user);
	});
}

function updateUser(user, attributes, callback) {
	db.users.findAndModify({
		query: { email: user.email },
		update: { $set: attributes },
		'new': true
	}, callback);
}

function deactivate(user, callback) {
	var deleteTasks = [
		deleteNetworks,
		deleteItems,
		deleteCollections,
		deleteUser,
		deleteFollowed
	];

	async.series(deleteTasks, callback);

	function deleteNetworks(next) {
		db.networks.remove({ user: user.email }, next);
	}

	function deleteItems(next) {
		db.items.remove({ user: user.email }, next);
	}

	function deleteCollections(next) {
		db.collections.remove({ user: user.email }, next);
	}

	function deleteUser(next) {
		db.users.remove({ email: user.email }, next);
	}

	function deleteFollowed(next) {
		db.users.findAndModify({
			query: {followed: {$elemMatch: {email: user.email}}},
			update: {$pull: {followed: {email: user.email}}}
		}, next);
	}
}

function follow(user, followId, callback) {
	if (!followId || typeof followId !== 'string') {
		return callback({message: 'bad follow user id', status: 412});
	}

	if (user.follows && user.follows.some(following)) {
		return callback({message: 'user already followed', status: 403});
	}

	db.users.findOne({_id: new ObjectId(followId), firstTimeUser: {$exists: false}}, function (err, followUser) {
		if (err) {
			return callback(err);
		}

		if (!followUser) {
			return callback({message: 'follow user not found', id: followId, status: 404});
		}

		var follows = {id: followUser._id, email: followUser.email, date: moment().toDate() };
		var followed = {id: user._id, email: user.email, date: moment().toDate() };

		var updateFollowing =  update({email: user.email}, {follows: follows});
		var updateFollowers = update({email: followUser.email}, {followed: followed});

		async.parallel([updateFollowing, updateFollowers], function (err) {
			callback(err, followUser);
		});
	});

	function update(query, push) {
		return function (callback) {
			db.users.findAndModify({
				query: query,
				update: {$push: push}
			}, callback);
		};
	}

	function following(f) {
		return f.id.toString() === followId;
	}
}

function unfollow(user, followId, callback) {
	if (!followId || typeof followId !== 'string') {
		return callback({message: 'bad follow user id', status: 412});
	}

	if (user.follows && !user.follows.some(following)) {
		return callback({message: 'user already unfollowed', status: 403});
	}

	db.users.findOne({_id: new ObjectId(followId), firstTimeUser: {$exists: false}}, function (err, followUser) {
		if (err) {
			return callback(err);
		}

		if (!followUser) {
			return callback({message: 'follow user not found', id: followId, status: 404});
		}

		var updateFollowing =  update({email: user.email}, {follows: { id: followUser._id }});
		var updateFollowers = update({email: followUser.email}, {followed: {id: user._id }});

		async.parallel([updateFollowing, updateFollowers], callback);

	});

	function update(query, pull) {
		return function (callback) {
			db.users.findAndModify({
				query: query,
				update: {$pull: pull}
			}, callback);
		};
	}

	function following(f) {
		return f.id.toString() === followId;
	}
}

function suggestPeople(user, callback) {
	findFriendsFromConnectedNetworks(function (err, usernames) {
		if (err) {
			return callback(err);
		}

		findLikeastoreUsers(usernames, function (err, users) {
			if (err) {
				return callback(err);
			}

			addDefaultUsers(users, function (err, users) {
				if (err) {
					return callback(err);
				}

				skipIfAlreadyFollows(users, function (err, users) {
					if (err) {
						return callback(err);
					}

					callback(null, users);
				});
			});
		});
	});

	function findFriendsFromConnectedNetworks(callback) {
		userNetworks(function (err, networks) {
			if (err) {
				return callback(err);
			}

			networks = networks.filter(function (c) {
				return _.contains(['github', 'twitter', 'facebook'], c.service);
			});

			async.map(networks, requestFriends, function (err, results) {
				if (err) {
					return callback(err);
				}

				var usernames =  _.uniq(_.flatten(results));

				callback(null, usernames);
			});
		});

		function userNetworks(callback) {
			db.networks.find({user: user.email}, callback);
		}

		function requestFriends(network, callback) {
			var headers = { 'Content-Type': 'application/json', 'User-Agent': 'likeastore/app'};

			var requests = {
				twitter: function (callback) {
					var oauth = {
						consumer_key: config.services.twitter.consumerKey,
						consumer_secret: config.services.twitter.consumerSecret,
						token: network.accessToken,
						token_secret: network.accessTokenSecret
					};

					var uri = 'https://api.twitter.com/1.1/friends/list.json?count=200&include_entities=false';

					request({uri: uri, headers: headers, oauth: oauth, timeout: 5000, json: true}, function (err, response, body) {
						if (err) {
							return callback(err);
						}

						if (!body.users) {
							return callback(null, []);
						}

						var usernames = body.users.map(function (user) {
							return user.screen_name;
						}).filter(function (user) {
							return user !== undefined;
						});

						callback(null, usernames);
					});
				},
				facebook: function (callback) {
					var uri = 'https://graph.facebook.com/me/friends?fields=username&access_token=' + network.accessToken;

					request({uri: uri, headers: headers, timeout: 5000, json: true}, function (err, response, body) {
						if (err) {
							return callback(err);
						}

						if (!body.data) {
							return callback(null, []);
						}

						var usernames = body.data.map(function (user) {
							return user.username;
						}).filter(function (user) {
							return user !== undefined;
						});

						callback(null, usernames);
					});
				},
				github: function (callback) {
					var uri = 'https://api.github.com/user/following?per_page=100&access_token=' + network.accessToken;

					request({uri: uri, headers: headers, timeout: 5000, json: true}, function (err, response, body) {
						if (err) {
							return callback(err);
						}

						if (!body) {
							return callback(null, []);
						}

						var usernames = body.map(function (user) {
							return user.login;
						}).filter(function (user) {
							return user !== undefined;
						});

						callback(null, usernames);
					});
				}
			};

			requests[network.service](function (err, usernames) {
				if (err) {
					return callback (err);
				}

				callback(null, usernames);
			});
		}
	}

	function findLikeastoreUsers(usernames, callback) {
		db.users.find({username: {$in: usernames}, firstTimeUser: {$exists: false}}, callback);
	}

	function skipIfAlreadyFollows(users, callback) {
		users = users.filter(function (u) {
			return u.email !== user.email;
		}).filter(function (u) {
			return _.find(user.follows, function (f) { return f.email === u.email; }) === undefined;
		});

		callback(null, users);
	}

	function addDefaultUsers(users, callback) {
		if (users.length > 0) {
			return callback(null, users);
		}

		var defaultUsers =  ['alexander.beletsky@gmail.com', 'dmitri.voronianski@gmail.com'];
		db.users.find({email: {$in: defaultUsers}}, function (err, defaultUsers) {
			if (err) {
				return callback(err);
			}

			users = users.concat(defaultUsers);

			callback(null, users);
		});
	}
}

function follows(user, callback) {
	findFollowers(user, 'follows', callback);
}

function followed(user, callback) {
	findFollowers(user, 'followed', callback);
}

function findFollowers(user, prop, callback) {
	findById(user._id, function (err, user) {
		if (err) {
			return callback(err);
		}

		if (!user) {
			return callback({message: 'User not found', status: 404});
		}

		if (!user[prop]) {
			return callback(null, []);
		}

		async.map(user[prop], requestFollower, function (err, follows) {
			if (err) {
				return callback(err);
			}

			callback(null, follows);
		});
	});

	function requestFollower(f, callback) {
		findById(f.id, callback);
	}
}

function feedback(user, message, callback) {
	notifier('user feedback', user, {message: message}, callback);
}

module.exports = {
	findById: findById,
	findByEmail: findByEmail,
	findByName: findByName,
	findByAny: findByAny,
	findByRequestToken: findByRequestToken,

	update: updateUser,
	deactivate: deactivate,

	follow: follow,
	unfollow: unfollow,
	suggestPeople: suggestPeople,

	follows: follows,
	followed: followed,
	feedback: feedback,

	transform: transform
};

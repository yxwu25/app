var OAuth = require('oauth').OAuth;
var OAuth2 = require('oauth').OAuth2;
var config = require('../../config');
var users = require('../db/users');
var zlib = require('zlib');

function twitter() {
	return function (req, res, next) {
		var callbackUrl = config.applicationUrl + '/api/networks/twitter/callback';
		var oauth = new OAuth('https://api.twitter.com/oauth/request_token',
							'https://api.twitter.com/oauth/access_token',
							config.services.twitter.consumerKey,
							config.services.twitter.consumerSecret,
							'1.0',
							callbackUrl,
							'HMAC-SHA1');

		oauth.getOAuthRequestToken(function (err, requestToken, requestTokenSecret) {
			if (err) {
				return next({message: 'failed to get request token from twitter', error: err, status: 500});
			}

			users.update(req.user, {twitterRequestToken: requestToken, twitterRequestTokenSecret: requestTokenSecret}, function (err) {
				if (err) {
					return next({message: 'failed to update user', error: err, status: 500});
				}

				req.authUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token=' + requestToken;
				next();
			});
		});
	};
}

function twitterCallback () {
	return function (req, res, next) {
		var oauth = new OAuth('https://api.twitter.com/oauth/request_token',
							'https://api.twitter.com/oauth/access_token',
							config.services.twitter.consumerKey,
							config.services.twitter.consumerSecret,
							'1.0',
							null,
							'HMAC-SHA1');

		var requestToken = req.query.oauth_token;
		var verifier = req.query.oauth_verifier;

		users.findByRequestToken(requestToken, userFound);

		function userFound (err, user) {
			if (err) {
				return next(err);
			}

			oauth.getOAuthAccessToken(requestToken, user.twitterRequestTokenSecret, verifier, gotAccessToken);

			function gotAccessToken (err, accessToken, accessTokenSecret, params) {
				if (err) {
					return next({message: 'failed to get accessToken from twitter', error: err, status: 500});
				}

				req.network = {
					accessToken: accessToken,
					accessTokenSecret: accessTokenSecret,
					user: user.email,
					service: 'twitter'
				};

				next();
			}
		}
	};
}

function github() {
	return function (req, res, next) {
		var callbackUrl = config.applicationUrl + '/api/networks/github/callback';
		var oauth = new OAuth2(config.services.github.appId,
							config.services.github.appSecret,
							'https://github.com/login');

		var authorizeUrl = oauth.getAuthorizeUrl({redirect_uri: callbackUrl, state: req.user });
		req.authUrl = authorizeUrl;
		next();
	};
}

function githubCallback() {
	return function (req, res, next) {
		var oauth = new OAuth2(config.services.github.appId,
							config.services.github.appSecret,
							'https://github.com/login');

		var code = req.query.code;
		var user = req.query.state;

		oauth.getOAuthAccessToken(code, {grant_type: 'authorization_code'}, gotAccessToken);

		function gotAccessToken(err, accessToken) {
			if (err) {
				return next({message: 'failed to get accessToken from github', error: err, status: 500});
			}

			req.network = {
				accessToken: accessToken,
				accessTokenSecret: null,
				user: user,
				service: 'github'
			};

			next();
		}
	};
}

function stackoverflow() {
	return function (req, res, next) {
		var callbackUrl = config.applicationUrl + '/api/networks/stackoverflow/callback';
		var oauth = new OAuth2(config.services.stackoverflow.clientId,
							config.services.stackoverflow.clientSecret,
							'https://stackexchange.com',
							'/oauth');

		var authorizeUrl = oauth.getAuthorizeUrl({redirect_uri: callbackUrl, state: req.user });
		req.authUrl = authorizeUrl;
		next();
	};
}

function stackoverflowCallback() {
	return function (req, res, next) {
		var callbackUrl = config.applicationUrl + '/api/networks/stackoverflow/callback';
		var oauth = new OAuth2(config.services.stackoverflow.clientId,
							config.services.stackoverflow.clientSecret,
							'https://stackexchange.com',
							'/oauth');

		var code = req.query.code;
		var user = req.query.state;

		oauth.getOAuthAccessToken(code, {grant_type: 'authorization_code', redirect_uri: callbackUrl}, gotAccessToken);

		function gotAccessToken(err, accessToken) {
			if (err) {
				return next({message: 'failed to get accessToken from stackoverflow', error: err, status: 500});
			}

			req.network = {
				accessToken: accessToken,
				accessTokenSecret: null,
				user: user,
				service: 'stackoverflow'
			};

			next();
		}
	};
}

module.exports = {
	twitter: twitter,
	twitterCallback: twitterCallback,
	github: github,
	githubCallback: githubCallback,
	stackoverflow: stackoverflow,
	stackoverflowCallback: stackoverflowCallback
};
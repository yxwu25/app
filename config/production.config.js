var config = {
	connection: process.env.MONGO_CONNECTION,
	options: { auto_reconnect: true },

	applicationUrl: 'https://app.likeastore.com',
	siteUrl: 'https://likeastore.com',
	domain: '.likeastore.com',

	app: {
		pageSize: 32
	},

	elastic: {
		host: {
			protocol: 'https',
			host: 'search.likeastore.com',
			port: 443,
			query: {
				access_token: process.env.ELASTIC_ACCESS_TOKEN
			}
		},

		requestTimeout: 5000
	},

	auth: {
		cookieName: 'auth_token',
		signKey: 'c88afe1f6aa4b3c7982695ddd1cdd200bcd96662',
		tokenTtl: 525600, // minutes, 365 days
		secure: true
	},

	hashids: {
		salt: '0b208b34946d64c41a11bab4eb34a7c6515ac2e9'
	},

	tracker: {
		url: 'http://tracker.likeastore.com'
	},

	tracking: {
		enabled: true
	},

	nodalytics: {
		ua: 'UA-49743199-1'
	},

	notifier: {
		url: 'http://notifier.likeastore.com',
		accessToken: process.env.NOTIFIER_ACCESS_TOKEN
	},

	// api keys
	services: {
		github: {
			appId: process.env.GITHUB_APP_ID,
			appSecret: process.env.GITHUB_APP_SECRET
		},

		twitter: {
			consumerKey: process.env.TWITTER_CONSUMER_KEY,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET
		},

		facebook: {
			appId: process.env.FACEBOOK_APP_ID,
			appSecret: process.env.FACEBOOK_APP_SECRET
		},

		stackoverflow: {
			clientId: process.env.STACKOVERFLOW_CLIENT_ID,
			clientKey: process.env.STACKOVERFLOW_CLIENT_KEY,
			clientSecret: process.env.STACKOVERFLOW_CLIENT_SECRET
		},

		vimeo: {
			clientId: process.env.VIMEO_CLIENT_ID,
			clientSecret: process.env.VIMEO_CLIENT_SECRET
		},

		youtube: {
			clientId: process.env.YOUTUBE_CLIENT_ID,
			clientSecret: process.env.YOUTUBE_CLIENT_SECRET
		},

		behance: {
			clientId: process.env.BEHANCE_CLIENT_ID,
			clientSecret: process.env.BEHANCE_CLIENT_SECRET
		},

		vk: {
			clientId: process.env.VK_CLIENT_ID,
			clientSecret: process.env.VK_CLIENT_SECRET
		},

		pocket: {
			consumerKey: process.env.POCKET_CONSUMER_KEY
		},

		tumblr: {
			consumerKey: process.env.TUMBLR_CONSUMER_KEY,
			consumerSecret: process.env.TUMBLR_CONSUMER_SECRET,
		},

		instagram: {
			clientId: process.env.INSTAGRAM_CLIENT_ID,
			clientSecret: process.env.INSTAGRAM_CLIENT_SECRET
		},

		flickr: {
			consumerKey: process.env.FLICKR_CONSUMER_KEY,
			consumerSecret: process.env.FLICKR_CONSUMER_SECRET
		}
	},

	mandrill: {
		token: process.env.MANDRILL_TOKEN
	},

	logentries: {
		token: process.env.LOGENTRIES_TOKEN
	},

	analytics: {
		url: 'https://analytics.likeastore.com',
		application: 'likeastore-production',
		username: 'likeastore',
		password: 'likeadmin7analitics'
	},

	ga: {
		id: 'UA-41034999-1',
		domain: 'likeastore.com'
	},

	newrelic: {
		application: 'likeastore-app',
		licenseKey: 'e5862474ee62b99898c861dddfbfa8a89ac54f49'
	}
};

module.exports = config;

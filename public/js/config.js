/**
 * Client-side config
 */

define(function () {
	'use strict';

	return {
		dashboard: {
			limit: 30
		},

		extension: {
			chrome: {
				url: 'https://chrome.google.com/webstore/detail/likeastore/einhadilfmpdfmmjnnppomcccmlohjad'
			},

			firefox: {
				url: 'https://addons.mozilla.org/en-US/firefox/addon/likeastore-social-bookmarking-'
			},

			safari: {
				url: 'http://addons.likeastore.com/files/safari/likeastore.safariextz'
			}
		},

		colors: [
			{ name: 'red', hex: '#e74c3c' },
			{ name: 'orange', hex: '#f39c12' },
			{ name: 'yellow', hex: '#feee43' },
			{ name: 'green', hex: '#56c7aa' },
			{ name: 'blue', hex: '#3498db' },
			{ name: 'violet', hex: '#eab6fd' },
			{ name: 'grey', hex: '#c8c8c8' }
		],

		featuredCollections: [
			{
				id: '5399482ee45b300f0000002c',
				title: 'Architecture',
				color: '#56c7aa',
				thumbnail: 'http://24.media.tumblr.com/6d451afa78d9852912c3d3f0fdd2dfab/tumblr_mp8fdizKVY1qeqiguo1_1280.jpg'
			},
			{
				id: '533e78ce84bb1c0c0000000a',
				title: 'Surfing Sports',
				color: '#56c7aa',
				thumbnail: 'http://i.vimeocdn.com/video/473226319_640.jpg'
			},
			{
				id: '536a4a1defffce0c00000009',
				title: 'Inspiration',
				color: '#feee43',
				thumbnail: 'http://i.vimeocdn.com/video/470446544_640.jpg'
			},
			{
				id: '5352d07d7fa1b91100000003',
				title: 'Science',
				color: '#3498db',
				thumbnail: 'http://lamcdn.net/hopesandfears.com/post-cover/Qj-tkMB57ctiuEnauZh62A.jpg'
			},
			{
				id: '53369933d195760e00000016',
				title: 'Art & Design',
				color: '#eab6fd',
				thumbnail: 'http://b.vimeocdn.com/ts/454/498/454498578_640.jpg'
			}
		],

		featuredNetworks: [
			{
				service: 'Instagram'
			},
			{
				service: 'Flickr'
			},
			{
				service: 'Vimeo'
			},
			{
				service: 'Youtube'
			},
			{
				service: 'Pocket'
			},
			{
				service: 'Stackoverflow'
			},
			{
				service: 'Tumblr'
			}
		]
	};
});

'use strict';

require.config({
	baseUrl: './',
	paths: {
		jquery: '../shared/jquery/jquery',
		es5shim: '../shared/es5-shim/es5-shim',
		es5sham: '../shared/es5-shim/es5-sham',
		text: '../shared/requirejs/plugins/text'
	},
	map: {
		'*': {
			'flight/component': '../shared/flight/lib/component',
			'depot': '../shared/depot/depot'
		}
	},
	shim: {
		'../shared/flight/lib/index': {
			deps: ['jquery', 'es5shim', 'es5sham']
		},
		'app/js/app': {
			deps: ['../shared/flight/lib/index']
		}
	}
});

require(['app/js/app'], function (App) {
	App.initialize();
});

/* 
* Базовый паттерн Seed Framework
* pluginName 
* ver. 1.1
* Kirill Ivanov
* create: 2015.06.12
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedNAME';

	$.seed[name] = {};
	$.seed[name].VERSION  = '1.0';
	$.seed[name]._inited = [];


	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented': false,

			'module' : {
				'main' : null,
				'function': false
			},

			'selector': {
				'auto' : null
			},
			'event' : {
				'__on' : null,
				'__off' : null
			},
			'url': {
				'current' : window.location.href
			},
			'func' : {
				'callback_open' : null
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title'
				}
			}
		},

		build: function() {
			var self = this;
			this.bind();
		},

// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
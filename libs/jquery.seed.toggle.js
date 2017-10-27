/* 
* Seed Framework
* seedToggle 
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
	var name = 'seedToggle';

	$.seed[name] = {};
	$.seed[name].VERSION  = '1.0';

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented': true,

			'module' : {
				'main' : null,
				'function': false
			},

			'selector': {
				'auto' : '[data-seed="buttons"] input[type="radio"], [data-seed="buttons"] input[type="checkbox"]'
			},
			'event' : {
				'__on' : 'click.seed.toggle',
				'__off' : 'click.seed.toggle'
			},
			'url': {
				'current' : window.location.href
			},
			'module': {
				'main' : null,
				'function' : null
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


/*
			this.radio.on('blur click', function() {
				var input = $(this);
				var parent = input.parent();

				buttons.removeClass('active '+settings.active_class);
				parent.addClass('active '+settings.active_class)
			});

			checkbox.on('blur', function(e) {
				var input = $(this);
				var parent = input.parent();

				if( input.is(':checked') ) {
					parent.addClass('active '+settings.active_class);
				}
				else {
					parent.removeClass('active '+settings.active_class);
				}
			});

			checkbox.on('click', function(e) {
				var input = $(this);
				var parent = input.parent();

				if( parent.hasClass('active '+settings.active_class) ) {
					parent.removeClass('active '+settings.active_class);
					input.removeAttr('checked');
				}
				else {
					parent.addClass('active '+settings.active_class);
					input.attr('checked', true)
				}
			});

			if( !radio.length && !checkbox.length ) {
				buttons.on('click', function() {
					buttons.removeClass('active '+settings.active_class);
					$(this).addClass('active '+settings.active_class);
				});
			}
*/
		},

// создаем бинды для элементов библиотеки
		bind: function() {
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
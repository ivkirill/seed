/* 
 * Seed Lib Core
 * @version 2.0.29
 * @author Kirill Ivanov
 */

// предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты».
;(function ($, window, document, undefined) {
	'use strict';

	// поддержка 'selector' для jQuery 3+
	var oldInit = jQuery.fn.init;
	jQuery.fn.init = function(selector) {
		var ret = oldInit.apply( this, arguments );
		ret.selector = ( selector && selector.selector !== undefined ) ? selector.selector : ((typeof selector === "string") ? selector : '');
		return ret;
	};
	jQuery.fn.init.prototype = jQuery.fn;

	// создаем объект seed, если он не существует
	if (!window.seed) {
		window.seed = {};
		window.seed.config = {};
		window.seed.config.locale = {};
	}


	// ядро seed lib
	function core(name, library) {
		
		// дефолтные настройки библиотек
		this._defaults = {
			'debug': false,
			'lazy' : ( typeof seed.config.lazy != "undefined") ? seed.config.lazy : false,
			'evented' : false,
			'fullscreen' : false,
			'cssclass': {
			},
			'selector': {
				'auto' : '',
				'evented' : ''
			},
			'event' : {
				'__on' : '',
				'__off' : '',
				'on' : '',
				'off' : ''
			},
			'url' : {
				'current': '',
				'ajax':''
			},
			'func' : {
				'ready' : null
			},
			'module' : {
				'main' : '',
				'func' : ''
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title'
				}
			},
			'touch' : 'ontouchstart' in document.documentElement
		};
		
		this._name = name;
		this._label = name.replace('seed','seed.').toLowerCase();
		this._method = library;
		this._seedCount = 0;
		this._init();
	}

	// прототип ядра seed lib
	core.fn = core.prototype = {
		_name: 'seedCore',
		
		// логирование клиентских ошибок в JS
		_log: function(msg, url, line) {
			msg = 'seed: '+ msg;
			new Image().src = "/cgi-bin/log.cgi?message=" + decodeURIComponent(msg) + "&url="+ decodeURIComponent(url) + "&line=" + decodeURIComponent(line);
		},

		// перезапустим библиотеку еще раз, заставим обновлить список this._$list
		_reinit: function() {
			console.log('_reinit', arguments);
			return false;
		},
		
		// функционал Fullscreen API 
		_fullscreen: function() {
			// если уже есть созданный метод в глобальном пространстве, то ничего не делаем
			if( window.fullScreenApi ) { return window.fullScreenApi; }

			// если нет, то создаем его
			var fullScreenApi = {
				supportsFullScreen: false,
				isFullScreen: function() { return false; },
				requestFullScreen: function() {},
				cancelFullScreen: function() {},
				fullScreenEventName: '',
				prefix: ''
		        };
			var browserPrefixes = 'webkit moz o ms khtml'.split(' ');
 
			// проверяем поддерживает ли браузер Fullscreen API
			if (typeof document.cancelFullScreen != 'undefined') {
				fullScreenApi.supportsFullScreen = true;
			}
			// проверяем поддерживает ли браузер Fullscreen API через префикс
			else {
				for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
					fullScreenApi.prefix = browserPrefixes[i];
					if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
						fullScreenApi.supportsFullScreen = true;
						break;
					}
				}
			}
 
			// обновляем метод, добавляя функционал
			if (fullScreenApi.supportsFullScreen) {
				fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
				fullScreenApi.isFullScreen = function() {
					switch (this.prefix) {
						case '': return document.fullScreen;
						case 'webkit': return document.webkitIsFullScreen;
						default: return document[this.prefix + 'FullScreen'];
					}
				}
				fullScreenApi.requestFullScreen = function(el) {
					return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
				}
				fullScreenApi.cancelFullScreen = function(el) {
					return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
				}
			}

			// добавляем метод к методам jQuery 
			$.fn.requestFullScreen = function() {
				return this.each(function() {
					if (fullScreenApi.supportsFullScreen) fullScreenApi.requestFullScreen(this);
				});
			};
			$.fn.cancelFullScreen = function() {
				return this.each(function() {
					if (fullScreenApi.supportsFullScreen) fullScreenApi.cancelFullScreen(this);
				});
			};
 
			// экспортируем метод в глобальное пространство
			window.fullScreenApi = fullScreenApi;
			return fullScreenApi;
		},

		// парсинг data-config- атрибутов в объект
		_dataset: function(el) {
			var config = {};
			if(!el || el.nodeType != 1) return config;
			
			var attributes = el.attributes;
			if( attributes ) {
				[].forEach.call(attributes, function(attr) {
					if (/^data-config-/.test(attr.name)) {
						var key = attr.name.replace('data-config-','');
						var value = (/^[0-9]+$/.test(attr.value)) ? parseInt(attr.value) : attr.value;
						if( value === 'false' ) value = false;
						if( value === 'true' ) value = true;
						
						if (/-/.test(key)) {
							var keys = key.split('-')
							if( !config[keys[0]] ) config[keys[0]] = {};
							config[keys[0]][keys[1]] = value;
						}
						else {
							config[key] = value;
						}
					}
				});
			}
			return config;
		},
		
		_init: function() {
			var core = this;
			
			// конструктор плагина
			function Seed(element, data) {
				if( !element ) return false;
				
				var self = this;
				this.el = element;
				this.$el = $(element);

				this._core = core;
				this._name = core._name;
				this._label = core._label;
				this._$list = data.list;
				this._list = data.list.get(0);
				this._index = this._$list.index(this.$el)+1;
				
				// если е - обьект события, сохраним его
				if( typeof data.e == 'object') this._event = data.e;
				this._time = new Date().getTime();
				
				this.init(data);
				
				return this;
			}

			// прототипируем конструктор
			Seed.fn = Seed.prototype = $.extend(true, {
				defaults: core._defaults,
				
				// инициализация библиотеки
				init: function(data) {
					var self = this;

					// обновим кофниг из переданных параметров
					this._config(data.options);

					// построим библиотеку
					this.build();

					// если элемент был последний в списке, вызовем callback-функцию инициализации библиотеки, если она определена
					if( this._$list.length == this._index && $.isFunction(this.config.func.ready) ) {
						(self.config.func.ready)(self);
					}
					
					// создаем обсервер для ленивого запуска библиотеки при необходимости
					if( this.config.lazy && this._$list.length == this._index ) {
						this._$list.seedLazy(function(nodes) {
							$(nodes)[core._name]();
						});
					}

					return this;
				},
				
				// создает объект конфига
				_config: function(options) {
					/*
						1. читаем объект конфига, который определен в ядре - core._defaults
						2. читаем конфиг конкретной библиотеки - this.defaults
						3. читаем определенные глобальные опции для всех библиотек - seed.config.defaults
						4. читаем определенные глобальные локализации для всех библиотек - seed.config.locale
						5. читаем локальные опции вызова библиотеки
						6. читаем data-config конкретного элемента
					*/
					
					/*
						console.log('CORE DEFAULTS', core._defaults);
						console.log('LIB DEFAULTS', this.defaults);
						console.log('GLOBAL LIB OPTIONS', seed.config.libs);
						console.log('LIB OPTIONS', options);
					*/
					
					// создает объект конфига, объединяе в него конфиг ядра и конфиг библиотеки
					this.config = $.extend(true, {}, core._defaults, this.defaults);

					// добавляем глобальные опции для библиотек
					this.config = $.extend(true, this.config, seed.config.defaults);					

					 // добавляем в конфиг глобально определенную локализацию
					if( seed.config.locale[self._name] ) {
						this.config.locale = $.extend(true, this.config.locale, seed.config.locale[self._name]);
					}
					
					// добавляем локальные опции вызова
					this.config = $.extend(true, {}, this.config, options);

					// добавляем data-config элемента
					this.config = $.extend(true, {}, this.config, this._core._dataset( this.el ));
					
					this.config.selector.current = this._$list.selector;

					// проверяем поддержку сторонних API
					this.config.fullscreen = this.$el.attr('data-fullscreen') || this.config.fullscreen;
					
					// запустим API Fullscreen описанне в ядре
					if( this.config.fullscreen ) {
						core._fullscreen();
						// если браузер не поддерживает API отключим эту настройку
						if( !window.fullScreenApi.supportsFullScreen ) this.config.fullscreen = false;
					}
					
					return this;
				},
				
				// метод получения значения атрибута
				_getAttr: function(attr) {
					try {
						var value = this.$el.attr(attr) || this.$el.attr('data-'+attr) || this.config[attr];
						if( value === "true" ) value = true;
						if( value === "false" ) value = false;
						return value;
					}
					catch(e) {
						this._error(e, value);
					}
				},
				
				destroy: function() {
					this._destroy();
				},

				// метод отключения библиотеки
				_destroy: function() {
					try {
						this.$el.removeData(this._label);
						delete this;
					}
					catch(e) {
						this._error(e, value);
					}

					return false;
				},

				_error: function(e, value) {
					console.error(this._name+' error: '+this.config.locale.error[value], value);
				},

				reinit: function() {
					return this;
				},

				// функционал создания декоратора для метода
				hook: function() {
					seed.hook.apply(this, arguments);
				},

				// функционал удаления декоратора для метода
				unhook: function() {
					seed.unhook.apply(this, arguments);
				},

				build: function() {
					this.bind();
				},

				bind: function() {

				}
			}, core._method);

			// определения плагина
			function Plugin(setting, config) {
				var list = this;

				// получим дефолтные параметры и расширим их переданными при запуски библиотеки
				var defaults = Seed.fn.defaults;
				var evented = (typeof setting == 'object') ? ( (setting.evented === false || setting.evented === true) ? setting.evented : Seed.fn.defaults.evented) : Seed.fn.defaults.evented;
				var uniq = '.'+ core._seedCount*1 + 1;

				if( $.type(setting) === 'object' ) defaults = $.extend({}, defaults, setting);
				
				// инициализация плагина
				var init = function(e, dynamic) {
					// если инициализация вызвана через событие, то проверим, чтобы делегирующий и целевой элемент не совпадали
					if( e.currentTarget ) {
						if( e.currentTarget === e.delegateTarget ) return false;
					}

					var element = this;
					var $element = $(element);

					var option = setting || ((typeof e == 'object') ? e.data.option : false);
					var options = typeof setting == 'object' && setting;
					var data = $element.data(core._label);

					// если обьект библиотеки еще не создан, то нужно его инициализировать
					if( !data ) $element.data(core._label, (data = new Seed(element, {list:list, dynamic:dynamic, options:options, e:e} )));
					
					// если передан метод, обновим конфиг и вызовем этот метод
					if( typeof option == 'string' && $.type(data[option]) === 'function' ) {
						if(config) data['_config']($.extend(true, {}, config, data.config));
						data[option]();
					}

					if( e.originalEvent ) {
						try {
							e.stopPropagation();
							e.preventDefault();
						} catch(error) {
//							//core._log(error);
						}
					}

					return (typeof e == 'number') ? data : false;
				}

				// если включена опция обработки динамечески созданных элементов
				if( evented && typeof setting != 'string' ) {
 					// создадим дополнительный индефикатор для namepace события, чтобы при вывозе одной и тоже библиотеки несколько раз, не было накладки одинаковых событий друг на друга
					$('body').off(defaults.event.on+uniq +' '+ defaults.event.__on+uniq, this.selector).on(defaults.event.on+uniq, this.selector, { option:setting }, init);
				}

				// если библиотека только динамическая, то проверим если ли функция ready - определенная по умолчанияю
				// если библиотека не только динамическая, то обработаем каждый элемент списка с помощью нее сразу
				return (evented) ? false : list.each(init);
			}

			var noConflict = $.fn[core._name];

			$.fn[core._name] = Plugin;
			$.fn[core._name].Constructor = Seed;
			
			seed[core._name] = Plugin;

			// noConflict для библиотеки
			$.fn[core._name].noConflict = function() {
				$.fn[core._name] = noConflict;
				return this;
			}
			
			// автозапуск библиотеки для элементов определенных по умолчанию
			$(function() {
				// автозапуск элементов обработки по DOM ready
				if(Seed.fn.defaults.selector.auto) {
					$(Seed.fn.defaults.selector.auto)[core._name]({'evented':false});

					// автозапуск ленивой инициализации
					if(Seed.fn.defaults.lazy) {
						seed.config.selector.lazy[Seed.fn.defaults.selector.auto] = function(nodes) {
							$(nodes)[core._name]();
						};
					}
				}

				// автозапуск элементов обработки по евентами определнных в библиотеки по умолчанию
				if(Seed.fn.defaults.selector.evented) $(Seed.fn.defaults.selector.evented)[core._name]({'evented':true});
			});
		}
	}

	seed.core = $.fn.seedCore = core;

	// экспортируем метод в jQuery
	$.fn.seedLazy = seed.lazy;
	
	return $;
})(jQuery, window, document);
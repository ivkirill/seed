/* 
* Seed Core
* @version 1.1.7
* @author Kirill Ivanov
* create: 2015.06.12
* update: 2015.06.14
*/

// предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты».
;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};

// создаем пустой обьект для глоабльны данных проекта
		$.seed.globals = {};
	};

// добавим обработку консоли, если ее нет
	if (typeof console == "undefined") {
		window.console = {
			log: function() {},
			error: function() {},
			info: function() {}
		};
	}


// список библиотек AMD ядра и зависимостей
	var plugins = {
// Общие библиотеки
		"common.cookie" : {
			"path" : "/js/jquery/jquery.cookie.js"
		},
		"common.easing" : {
			"path" : "/js/jquery/jquery.easing.1.3.js"
		},
		"common.mousewheel" : {
			"path" : "/js/jquery/jquery.mousewheel.js"
		},
		"common.map" : {
			"path" : "/js/jquery/jquery.map.js"
		},
		"common.meta" : {
			"path" : "/js/jquery/jquery.metadata.js"
		},
		"common.tablesorter" : {
			"path" : "/js/jquery/jquery.tablesorter.2.10.js"
		},
		"common.tablednd-2.10" : {
			"path" : "/js/jquery/jquery.tablednd.js"
		},
		"common.synctranslit" : {
			"path" : "/js/jquery/jquery.synctranslit.min-utf8.js"
		},
		"common.base64" : {
			"path" : "/js/base64/base64.js"
		},
		"common.json" : {
			"path" : "/js/jquery/jquery.json.js"
		},

// библиотеки jQuery UI
		"ui.dialog" : {
			"path" : "/js/jquery/ui/jquery.ui.dialog.js"
		},
		"ui.datepicker" : {
			"path" : "/js/jquery/ui/jquery.ui.datepicker.1.11.4.js.js"
		},
		"ui.datepicker-ru" : {
			"path" : "/js/jquery/ui/jquery.ui.datepicker-ru-utf.js"
		},
		"ui.datepicker-extension" : {
			"path" : "/js/jquery/ui/jquery.ui.datepicker-extension.js"
		},
		"ui.timepicker" : {
			"path" : "/js/jquery/ui/jquery.ui.timepicker.js"
		},
		"ui.timepicker-ru" : {
			"path" : "/js/jquery/ui/jquery.ui.timepicker-ru.js"
		},
		"ui.mouse" : {
			"path" : "/js/jquery/ui/jquery.ui.mouse.js"
		},
		"ui.draggable" : {
			"path" : "/js/jquery/ui/jquery.ui.draggable.1.11.4.min.js"
		},
		"ui.slider" : {
			"path" : "/js/jquery/ui/jquery.ui.slider.1.11.4.js.js"
		},
		"ui.touch" : {
			"path" : "/js/jquery/jquery.ui.touch.js"
		},

// библиотеки html5
		"html5.jQueryPlugin" : {
			"path" : "/js/html5/jQueryPlugin.js"
		},
		"html5.HTML5Loader" : {
			"path" : "/js/html5/HTML5Loader.js"
		},
		"html5.HTML5Viewer" : {
			"path" : "/js/html5/HTML5Viewer.js"
		},

// библиотеки High Slide
		"high.slide" : {
			"path" : "/js/slide/highslide.4.1.13.packed.js"
		},
// библиотеки High Charts
		"high.charts" : {
			"path" : "/js/highstock/highcharts.4.1.9.js"
		},

// библиотеки High Stock 
// highcharts по умолчанию включён в highstock! Не грузить одновременно highstock и highcharts
		"high.stock" : {
			"path" : "/js/highstock/highstock.4.2.3.js"
		},

// библиотеки Seed
		"seed.buy" : {
			"path" : "/js/seed/libs/jquery.seed.buy.js"
		},
		"seed.basket" : {
			"path" : "/js/seed/libs/jquery.seed.basket.js",
			"depents": ['seed.gform', 'common.json']
		},
		"seed.carousel" : {
			"path" : "/js/seed/libs/jquery.seed.carousel.js",
			"depents": ['common.easing']
		},
		"seed.compare" : {
//			"path" : "/js/seed/libs/jquery.seed.compare.js"
		},
		"seed.dropdown" : {
			"path" : "/js/seed/libs/jquery.seed.dropdown.js"
		},
		"seed.filter" : {
			"path" : "/js/seed/libs/jquery.seed.filter.js",
			"depents": ['common.cookie']
		},
		"seed.gallery" : {
			"path" : "/js/seed/libs/jquery.seed.gallery.js"
		},
		"seed.gform" : {
			"path" : "/js/seed/libs/jquery.seed.gform.js",
			"depents" : ['seed.tooltip']
		},
		"seed.modal" : {
			"path" : "/js/seed/libs/jquery.seed.modal.js",
			"depents" : ['ui.draggable']
		},
		"seed.page" : {
			"path" : "/js/seed/libs/jquery.seed.page.js",
			"depents": ['common.cookie']
		},
		"seed.tab" : {
			"path" : "/js/seed/libs/jquery.seed.tab.js"
		},
		"seed.tooltip" : {
			"path" : "/js/seed/libs/jquery.seed.tooltip.js"
		},
		"seed.select" : {
			"path" : "/js/seed/libs/jquery.seed.select.js",
			"depents": ['seed.dropdown']
		},
		"seed.ui" : {
			"path" : "/js/seed/libs/jquery.seed.ui.js",
			"depents": ['seed.modal', 'seed.gform']
		},
		"seed.zoom" : {
			"path" : "/js/seed/libs/jquery.seed.zoom.js"
		}
	};


// ядро 

	function core(name, module) {
		var base = this;

		this._name = name;
		this._data_seed = name.replace('seed','seed.').toLowerCase();
		this._method = module || $.seed[name];

		this._stack = 0;
		this._seedCount = 0;

		this.init();
		this.clear();
	}

// прототипируем ядро
	core.fn = core.prototype = {
		_name: 'seedCore',

		presettings: {
			'debug': false,
			'dynamic' : false,
			'evented' : false,
//			'dynamic_methods' : null,
			'fullscreen' : false,

			'selector': {
				'auto' : null
			},
			'class': {

			},
			'event' : {
				'__on' : null,
				'__off' : null
			},
			'url' : {
				'current': null,
				'ajax':null
			},
			'func' : {
				'ready' : null,
				'callback_item' : null
			},
			'module' : {
				'main' : null,
				'function' : null
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title'
				}
			},
			'touch' : 'ontouchstart' in document.documentElement
		},
		init: function() {
			var base = this;

//			this.defaults = $.extend({}, this.presettings, this._method.defaults);
			this.defaults = {};
//console.log( this._name, this._method.defaults, this._method.config )

//console.log(this);

// конструктор плагина
			function Seed(element, list, dynamic, options, e) {
				var self = this;
				this.el = element;

				if( this.el ) {
					this.$el = $(element);

					this._core = base;
					this._name = base._name;
					this._data_seed = base._data_seed;

					this._$list = list;

					this._index = this._$list.index(this.$el)+1;

// если е - обьект события, сохраним его
					if( typeof e == 'object') {
						this._event = e;
					}

					this.options = $.extend({}, options);

					this._time = new Date().getTime();
			
					this.init();
				}

				return false;
			}

// версия библиотеки
			Seed.VERSION  = '1.0';


// прототипируем конструктор !!!!!!!!!!!!
			Seed.fn = Seed.prototype = $.extend(true, {
				defaults: {}, // base.defaults,
// динамическая функция
//				dynamic: base.dynamic,

// инициализация библиотеки
				init: function() {
					var self = this;

// обновим кофниг из переданных параметров
					this._config(this.options);
					this.config.metadata = this.metadata;

// добавляем в конфиг глобально определенную локализацию
					if( $.seed.core.locale[self._name] ) {
						this.config.locale = $.extend(true, this.config.locale, $.seed.core.locale[self._name]);
					}


					this.config.fullscreen = this.$el.attr('data-fullscreen') || this.config.fullscreen;

// запустим API Fullscreen описанне в ядре
					if( this.config.fullscreen ) {
						base.fullscreen();
// если браузер не поддерживает API отключим эту настройку
						if( !window.fullScreenApi.supportsFullScreen ) { this.config.fullscreen = false; }
					}

// построим библиотеку
					this.build();

// если элемент был последний в списке, вызовем callback-функцию инициализации библиотеки, если она определена
					if( this._$list.length == this._index && $.isFunction(this.config.func.ready) ) {
						(self.config.func.ready)(self);
					}

					return this;
				},

				reinit: function() {
					base._reinit();
				},

				_config: function(options) {

// параметры по умолчанию, которые можно задать на старте или позже, через глобальный метод
					this.config = $.extend({}, this.defaults, options);
// расширим конфиг из dataset
//					this.config = $.extend({}, this.defaults, this.$el.data() );
				},

				_getAttr: function(attr) {
					try {
						var value = this.$el.attr(attr) || this.$el.attr('data-'+attr) || this.config[attr];
						if( value === "true" ) value = true;
						if( value === "false" ) value = false;
						return value;
					}
					catch(e) {
						this._error(e, value);
						//base._log(e);
					}
				},

				_destroy: function() {
					this.$el.removeData(this._data_seed);
					try {
						delete this;
					}
					catch(e) {
						//base._log(e);
					}

					return false;
				},

				_error: function(e, value) {
					console.error(this._name+' error: '+this.config.locale.error[value], value);
//					throw(e);
				},

// функционал создания декоратора для метода
				hook: function() {
					base.hook.apply(this, arguments);
				},

// функционал удаления декоратора для метода
				unhook: function() {
					base.unhook.apply(this, arguments);
				},

				build: function() {
					this.bind();
				},

				bind: function() {

				}
			}, base._method);

// определения плагина
			function Plugin(setting, config) {

				var list = this;

// получим дефолтные параметры и расширим их переданными при запуски библиотеки
				var defaults = Seed.fn.defaults;
				var evented = (typeof setting == 'object') ? ( (setting.evented === false || setting.evented === true) ? setting.evented : Seed.fn.defaults.evented) : Seed.fn.defaults.evented;
				var uniq = ('.'+base._seedCount++);
// console.log('Plugin', this.selector, evented);

				if( typeof setting == 'object') {
					defaults = $.extend({}, defaults, setting);
				}

// создаем записи для дефолтных селекторов библиотек. Нужно для _reinit()
				if( $(list).length == 0 && !evented ) {
					$.seed[base._name]._inited.push({
						'uniq' : uniq,
						'selector' : list.selector,
						'dynamic' : defaults.dynamic,
						'config' : typeof setting == 'object' && setting
					});
				}

// инициализация плагина
				var init = function(e, dynamic) {

// если инициализация вызвана через событие, то проверим, чтобы делегирующий и целевой элемент не совпадали
					if( e.currentTarget ) {
						if( e.currentTarget === e.delegateTarget ) {
							return false;
						}
					}

					var element = this;
					var $element = $(element);

					var option = setting || ((typeof e == 'object') ? e.data.option : false);
					var options = typeof setting == 'object' && setting;
					var data = $element.data(base._data_seed);


// если обьект бибилотеки еще не создан, то нужно его инициализировать
					if( !data ) {
						$element.data(base._data_seed, (data = new Seed(element, list, dynamic, options, e)));

// сохраним данные о том какие объекты были обработаны
						if(!$.seed[base._name]._inited[uniq] && !evented) {
							$.seed[base._name]._inited.push({
								'uniq' : uniq,
								'selector' : list.selector,
								'dynamic' : defaults.dynamic,
								'config' : options
							});
						}
					}
// обновим конфиг
					if( typeof option == 'string' ) {
						if(config) { data['_config'](config); }
						data[option]();
					}

					if( e.originalEvent ) {
						try {
							e.stopPropagation();
							e.preventDefault();
						} catch(error) {
//							//base._log(error);
						}
					}

					return (typeof e == 'number') ? data : false;
				}

// если включена опция обработки динамечески созданных элементов
				if( evented && typeof setting != 'string' ) {
// console.log(base._name, 'dynamic');
// создадим дополнительный индефикатор для namepace события, чтобы при вывозе одной и тоже библиотеки несколько раз, не было накладки одинаковых событий друг на друга
					$('body').off(defaults.event.on+uniq +' '+ defaults.event.__on+uniq, this.selector).on(defaults.event.on+uniq, this.selector, { option:setting }, init);
				}

// если библиотека только динамическая, то проверим если ли функция ready - определенная по умолчанияю
// если библиотека не только динамическая, то обработаем каждый элемент списка с помощью нее сразу
				return (evented) ? false : list.each(init);
			}

			var noConflict = $.fn[base._name];

			$.fn[base._name] = Plugin;
			$.fn[base._name].Constructor = Seed;

// noConflict для библиотеки
			$.fn[base._name].noConflict = function() {
				$.fn[base._name] = noConflict;
				return this;
			}

// автозапуск библиотеки для элементов определенных по умолчанию
			$(function() {
// автозапуск элементов обработки по DOM ready
				if(Seed.fn.defaults.selector.auto) { $(Seed.fn.defaults.selector.auto)[base._name]({'evented':false}); }

// автозапуск элементов обработки по евентами определнных в библиотеки по умолчанию
				if(Seed.fn.defaults.selector.evented) { $(Seed.fn.defaults.selector.evented)[base._name]({'evented':true}); }
			});
		},

// логирование клиентских ошибок в JS
		_log: function(msg, url, line) {
			msg = 'SEED: '+ msg;
			new Image().src = "/cgi-bin/log.cgi?message=" + decodeURIComponent(msg) + "&url="+ decodeURIComponent(url) + "&line=" + decodeURIComponent(line);
		},

// перезапустим библиотеку еще раз, заставим обновлить список this._$list
		_reinit: function() {

// $.seed.progress - булевое значение для определения запущена ли переинициализация, необходимо чтобы исключить зацикливание
			if( $.seed.progress ) { return false; }
			$.seed.progress = true;

        		$.each($.seed, function(name, lib) {
				var data_seed = name.replace('seed','seed.').toLowerCase();
				if( typeof lib == 'object' && !$.isFunction(lib) ) {
					if( !lib ) {
						return;
					}
					else if( lib._inited ) {
						$(lib._inited).each(function(i, list) {
							if( list.dynamic && !list.evented ) {
								var items = $(list.selector);
								items.each(function() {
									var obj = $(this);
									if( !obj.data(data_seed) ) {
										obj[name](list.config);
									}
								});
								$.seed.progress = false;
							}
						});
					}
				}
			});
		},

// раширение фунционала метода
		hook: function(name, func, obj) {
			var base = this;
			if( !obj ) { obj = this; }
//console.log(this, base, name);

			var title = ( func.event ) ? name+'_'+func.event : name;
// console.log('hook',$.fn[base._name], obj, name, func, title);
// сохраняем метод 
			$.fn[base._name][title] = obj[name] || function() { return this; };
// заменяем метод на новый

//console.log( $.fn[base._name][title], base._name, title );

			obj[name] = function() {
				var dynamic = true;
				try { dynamic = arguments[1].dynamic; }
				catch(e) {
					//base._log(e);
				}

				if( base._stack > 100 ) {
					console.error(this, base, name, func, obj);
					throw new Error("seedHook: Ошибка! Stack overflow: "+ base);
					return false;
				}
				base._stack++;
					
				if( $.isFunction(func.before) && dynamic ) {
					(func.before)(this);
				}
				var ret = $.fn[base._name][title].apply(this, arguments);
				if( $.isFunction(func.after) && dynamic ) {
					(func.after)(this);
				}
				return ret;
			};

			if( func.exec ) {
				obj[name]();
			}
		},

		unhook: function(name, event, obj){
			var base = this;
			var title = ( event ) ? name+'_'+event : name;
// восстанавливаем старый метод
			obj[name] = $.fn[base._name][title];
// удаляем старый метод
			delete $.fn[base._name][title];
		},

		clear: function() {
			var base = this;
			setInterval(function() {
				base._stack = 0;
			}, 1000);
		},

		fullscreen: function() {
// если уже есть созданный метод в глобальном пространстве, то ничего не делаем
			if( window.fullScreenApi ) { return false; }

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
			} else {
// проверяем поддерживает ли браузер Fullscreen API через префикс
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
			if (typeof jQuery != 'undefined') {
				jQuery.fn.requestFullScreen = function() {
					return this.each(function() {
						if (fullScreenApi.supportsFullScreen) {
							fullScreenApi.requestFullScreen(this);
						}
					});
				};
				jQuery.fn.cancelFullScreen = function() {
					return this.each(function() {
						if (fullScreenApi.supportsFullScreen) {
							fullScreenApi.cancelFullScreen(this);
						}
					});
				};
			}
 
// экспортируем метод в глобальное пространство
			window.fullScreenApi = fullScreenApi;
		}

	}

// dynamic функционал ядра
	core.dynamic = function() {
		var self = this;
		this.config = {
			'methods' : ['prependTo', 'insertBefore', 'insertAfter']
		};
		this.init();
	}

// dynamic прототип
	core.dynamic.fn = core.dynamic.prototype = {
		init : function(methods) {
			var self = this;

			$.each(this.config.methods, function(i, method) { 
				if( !$.fn[core.fn._name][method] ) {
					core.fn.hook(method, {
						after: function($el) {
//console.log('hooked', method, this, arguments);
							core.fn._reinit();
						}
					}, $.fn);
				}
			});

			return false;
		},

// фукнция отключения долнительной обоработки метода jQuery
		destroy : function() {
			var self = this;

			$.each(this.config.methods, function(i, method) { 
				if( $.fn[core.fn._name][method] && $.fn[core.fn._name] ) {
					core.fn.unhook(method, event, jQuery.fn);
				}
			});

			return false;
		}
	}

// amd функционал ядра
	core.amd = function() {
		var self = this;
		this.defined = {}; // модули, которые были определены
		this._options = {'plugins': plugins};
		this.config = {};
		this.init();
	};

// amd прототип
	core.amd.fn = core.amd.prototype = {
		init : function() {

			var self = this;

			this.config = $.extend({}, {
				'amd' : {
					'plugins' : plugins,
					'cache' : true,
					'repeat' : 5
				}
			});

			this._defineConfig(this.config.amd.plugins, false, null);


// загрузка библиотеке из GET переданного в файл
			$('script').each(function(i, el) {
				var src = $(el).attr('src');
				if( /seed\.js\?amd=true/.test( src ) ) {
					try {
						var query = src.replace('amd=true','').replace(/(&|)cache=\d+/,'').split('?')[1];
						$.each(query.split('&'), function(j, param) {
							try {
								var name = param.split('=')[0];
								var value = param.split('=')[1];

								if( value == 'all' ) {
									var re = new RegExp(name);

									$.each(self.config.amd.plugins, function(k, plugin) {
										if( re.test(k) ) {
											self.require(k);
										}
									});
								}

								else if( /,/.test(value) ) {
									$.each( value.split(','), function(k, plugin) {
										self.require(name+'.'+plugin);
									});
								}
								else if( value ) {
									self.require(name+'.'+value);
								}
								else {
									return;
								}
							}
							catch(e) {
								return;
							}
						});
					}
					catch(e) {
						//base._log(e);
					}
				}
			});

		},

//Определяем модуль, парсим все аргументы, при необходимости заполняем дефолтными значениями. Далее передаем в функцию обновления
		define : function(name, depents, callback, data) {
			var self = this;
//Если первый полученный аргумент Объект и второй функция или не передан, то значит мы получили конфиг и обработаем его через специальную функцию.
			if( typeof arguments[0] === "object" ) {
				this._defineConfig(arguments[0], arguments[1]);
				return false;
			}

//Если первый аргумент не является строкой, то сообщаем об ошибке и возвращаем false
			else if( typeof arguments[0] !== 'string' ) {
				console.error('Не задано имя для модуля!');
				return false;
			}

			else {
				var args = {};

				self.stack = [name];

				$.each(Array.prototype.slice.call(arguments), function(i, argument) {
					if( typeof argument === 'string') { args.name = argument; }
					else if( $.isArray(argument) ) { args.depents = argument; }
					else if( $.isFunction(argument) ) { args.callback = argument; }
					else if( typeof argument === 'object' && !$.isArray(argument) ) { args.data = argument; }
				});

				if( !args.depents ) { args.depents = false; }
				if( !args.callback ) { args.callback = false; }
				if( !args.data ) { args.data = false; }

				if( args.depents && args.data.require !== null ) {

//Если в зависимостях стоит проверка на boolean и она не прошла, значит модуль этот грузить мы не будем
					var check = true;
					$.each(args.depents, function(i, el) {
						if( !el ) { check = false; }
					});
					if(check === true) {
//Запустим обновление модулей рекурсивно проверяя зависимости
						var done = false;

						$.each(args.depents, function(depent) {
							if( typeof args.depents[depent] === 'string' ) {

//добавим зависимость в массив
								self.stack.push(args.depents[depent]);

//проверим массив на повторение, чтобы не было циклической зависимости при вызове модулей
								if( !self._check() ) { throw new Error("seed: Ошибка! Обнаружена циклическая зависимость: "+self.stack); return false; }

								var response = self.define(args.depents[depent], ( typeof self.defined[args.depents[depent]] === 'object' ) ? self.defined[args.depents[depent]].depents : false, false );
								if(response) {
									done = true;
								}
							}
							else {
								done = true;
							}
						});

						if( done ) {
							this._update(args.name, args.depents, args.callback, args.data);
							return true;
						}
					}
					else {
						$.extend(args.data, { require : null });
						return false;
					}
				}
				else {
					this._update(args.name, args.depents, args.callback, args.data);
					return true;
				}
			}
		},

//Определение конфига
		_defineConfig : function(config, callback, require) {
			var self = this;
			var done = false;
			var require = (require === null) ? null : true;
			$.each(config, function(name, data) {
				var response = self.define(name, data.depents, data.callback, $.extend(data, {require : require}) );
				if(response) {
					done = true;
				}
			});
			if( done ) {
				if(callback) { (callback)(); }
			}
		},

//Обновляем состояние определенных модулей, при необходмости создаем новый модуль
		_update : function(name, depents, callback, data) {

			var self = this;
			var options = {};

//находим модуль, если такого модуля нет - создаем новый пустой.
			var module = ( self.defined[name] ) ? (self.defined[name]) : (self.defined[name] = {});

//если переданы зависимости, до добавим их как новые, либо добавим их как дополнительные
			if(depents) {
				options.depents = depents;
				if(module.depents) {
					options.depents = $.unique( depents.concat(module.depents) );
				}
			}

//обновляем callback-функцию
			if(callback) { options.callback = callback; }

//обновляем общие даные
			if(data) {
				options.path = data.path;
				options.name = data.name;
//				options.stack = data.stack;
				options.storage = data.storage;
				options.require = ( data.require === null ) ? false : true;
			}
			else {
				options.require = true;
			}

//если в имени передан урл файла, сохраним урл
			if( /\.(css|js)$/.test(name) ) {
				if( !options.path ) { options.path = name; }
			}

			if( /\.(css)$/.test(options.path) ) { options.type = 'html'; }

//первоначальная инцииализация дефолтных значений
			if( !module.inited ) { options.inited = false; }

			$.extend(module, options);

//загружаем модуль если он  необходим и все еще не был загружен
			if( module.require === true && module.inited !== true ) { this._get(name); }
//загружаем модуль если он необходим и был уже загружен, но у него хранимые данные на возврат, но при этом грузить внешне его уже не нужно
			else if( module.require === true && module.inited === true && !$.isEmptyObject(module.storage) ) { this._get(name, true); }
		},

//запрашиваем определенные модули
		require : function(depents, callback) {
			var self = this;
			var done;

			if( typeof arguments[0] == 'string' || typeof arguments[0] == 'object' ) { depents = arguments[0]; }
			else if( arguments[0] === true || typeof arguments[0] === 'number' ) {
				return true;
			}
			else {
				console.error('Не могу определить имя модуля!', arguments[0]);
				return false;
			}

			if( typeof arguments[1] != 'function' ) { callback = undefined; }

			if( typeof depents == 'string') {
				var name = depents;
				var module = self.defined[name];
				if( !module ) {
					console.error('Модуль '+ name +' не определен в системе');
					return false;
				}
				else {
//если модуль уже был проиницилизирован, то выполняем нужную функцию
					if( module.inited ) {
						if( typeof arguments[1] === 'boolean' && arguments[1] === true ) { callback = module.callback; }

						if(callback) {
							var storage = self._storage(module, name);
							(callback)(storage);
						}
					}
					else {
						self.define(name, module.depents, callback, false);
					}
					return true;
				}
			}
			else if( Object.prototype.toString.call( depents ) === '[object Array]' ) {
				done = true;
				$.each(depents, function(i, name) {
// если зависимость является булевой, то пропускаем ее
//					if(!name || typeof name == 'boolen' || typeof name == 'number') { return; }

					var response = self.require(name);
					if(!response) { done = false; }
				});
				if( done ) {
					if(callback) {
						var storage = self._storage(module, name);
						(callback)(storage);
					}
				}
			}

			else if( typeof depents === 'object' ) {
				done = true;
				$.each(depents, function(name, data) {
// если зависимость является булевой, то пропускаем ее
//					if(!name || typeof name == 'boolen' || typeof name == 'number') { return; }

					var response = self.require(name, data.callback);
					if(!response) { done = false; }
				});
				if( done ) {
					if(callback) {
						var storage = self._storage(module, name);
						(callback)(storage);
					}
				}
			}
		},

		_get: function(name, skip) {
			var self = this;

			var module = self.defined[name];
			module.storage = self._storage(module, name);

			function callback() {
				if(self.config.debug) { console.info('callback-фунция: ', name); }

				module.returned = (module.callback)(module.storage);

				if( module.returned ) { module.storage[name] = module.returned; }

				module.callback = ( module.storage.length > 0 ) ? function() {} : false;

				if(self.config.debug) { console.info(name+' storage: ',module.storage); }

				return module.callback;
			}

			var url = module.path || false;

			if( url && !skip ) {
				$.ajax({
					url: url,
					async: false,
					cache: self.config.amd.cache,
					type: 'GET',
					dataType: (module.type == 'html') ? 'html' : 'script',
					success: function(data) {
						module.inited = true;

						if(module.type == 'html' && /\.css/.test(module.path) && data ) { $("head").append("<style>" + data + "</style>"); }
						if(self.config.debug) { console.info('Модуль '+ name+' загружен'); }

						if(module.callback)  {
							return callback();
						}

					},
					error: function(xhr, status, e) {
						module.inited = true;
						console.error('Ошибка при загрузке модуля '+ name, e);
					}
				});
			}
			else {
				if(module.callback)  {
					return callback();
				}
			}
		},

		_storage : function(module, name) {

			var self = this;
			if( !module ) { return {}; }

			var storage = module.storage || {};

			if( module.depents ) {
				$.each(module.depents, function(i, name) {
					try {
						$.extend(storage, self.defined[name].storage);
					}
					catch(e) {}
				});
			}

			return storage;
		},

		_check: function() {
			var self = this;
			var check = true;
			var temp = [];
			$.each(self.stack, function(i, el) {
				$.each(temp, function(j, obj) {
					if( el == obj ) { check = false; }
				});
				temp.push(el);
			});
			return check;
		},
/*
		_unique: function(array) {
			var o = {}, i, l = array.length, r = [];
			for(i=0; i<l;i+=1) o[this[i]] = this[i];
			for(i in o) r.push(o[i]);
			return r;
		},
*/
		settings: function(options) {
			$.extend({}, this.config, options);
			return this;
		}
	}

	$.seed.core = $.fn.seedCore = core;
	
	var seed = core;
	window.seed = seed;
	
// создаем пустой обьект для локализации
	$.seed.core.locale = {};

	$.fn.seedAMD = new core.amd();
	$.fn.seedDynamic = $.seed.core.dynamic = new core.dynamic();

//Shortcut
	window.define = $.define = function() {
		$.fn.seedAMD.define(arguments[0], arguments[1], arguments[2], arguments[3]);
	};

	window.require = $.require = function() {
		$.fn.seedAMD.require(arguments[0], arguments[1]);
	};

	return $;
})(jQuery, window, document);
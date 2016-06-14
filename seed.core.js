/* 
 * Berry Lib Core
 * @version 2.0.27
 * @author Kirill Ivanov
 */

 (function(berry, window, document, undefined) {
	'use strict';
	
	if( !berry ) {
		Error('Не найден объект Seed!');		
		return false;
	}

	// ядро 
	function core(name) {
		var base = this;

		this._name = name;
		this._data_seed = name.replace('seed','seed.').toLowerCase();
		this._method = $.seed[name];

		this._stack = 0;
		this._seedCount = 0;

		this.init();
		this.clear();
	}

	// прототипируем ядро
	core.prototype = {
		_name: 'seedCore',
		
		presettings: {
			'debug': false,
			'dynamic' : false,
			'evented' : false,
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

		// логирование клиентских ошибок в JS
		_log: function(msg, url, line) {
			msg = 'Seed: '+ msg;
			new Image().src = "/cgi-bin/log.cgi?message=" + decodeURIComponent(msg) + "&url="+ decodeURIComponent(url) + "&line=" + decodeURIComponent(line);
		},		
		
		init: function() {
			var base = this;

			this.defaults = {};

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

			// версия ядра
			Seed.VERSION  = '2.0.27';


			// прототипируем конструктор
			Seed.fn = Seed.prototype = $.extend(true, {
				defaults: {}, // base.defaults,


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
					if( this._$list.length == this._index && berry.isFunction(this.config.func.ready) ) {
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

				// автозапуск элементов обработки по эвентами определнных в библиотеки по умолчанию
				if(Seed.fn.defaults.selector.evented) { $(Seed.fn.defaults.selector.evented)[base._name]({'evented':true}); }
			});
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

		// функционал Fullscreen API
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


})(berry, window, document);
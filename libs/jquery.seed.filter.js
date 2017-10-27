/* 
* Seed Framework
* seedFilter
* ver. 1.1
* Kirill Ivanov
* create: 2015.07.01
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedFilter';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.1';
	$.seed[name]._inited = [];


	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'evented': false,

			'ajax' : false,
			'await' : 800,
			
			'history' : true,
			'paging' : false,

			'dependence' : false,
			'hide' : true,
			'overlay' : true,
			
			'convert' : false,
			
			'rules' : {
				separator: '/',
				join: true,
				repeater: ',',
				allow: '',
				deny: ''
			},
			
			'module' : {
				'main' : null, // модуль того что фильтруем!,
				'filter' : null,
				'func': null
			},

			'selector': {
				'auto' : '[data-seed="filter"]',
				'list' : '[role="filtering"]',
				'items' : '> *',
				'dependence' : '[role="toolbar"]',
				'external' : '', // внешние формы для обьединения запроса
				'pages' : '[role="pages"]',
				'total' : '[role="total"]:first'
			},
			'event' : {
				'__on' : 'dynamic.seed.filter',
				'__off' : 'dynamic.seed.filter'
			},
			'url': {
				'current' : window.location.href,
				'tial' : ''
			},

			'func' : {
				//callback-функция выполняющая после инициализации фильтра
				'ready' : null, 
				//callback-функция выполняющая после парсинга QS параметров
				'after_parse' : null,
				//callback-функция выполняющая перед сериализацей формы
				'preserialize' : null,
				//callback-функция выполняющая после сериализации формы и до оправки
				'before_send' : null,
				//callback-функция выполняющая после сериализации формы и оправки, ВМЕСТО стандартной функции информационных сообщений.
				'success' : null,
				//callback-функция выполняющая вместо сабмита фильтра
				'submit' : null,
				//callback-функция выполняющая после сериализации формы, оправки и при получение ответа об ошибке
				'error' : null,
				'slide' : null
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'module.main': 'не задан ID модуля фильтрации',
					'module.filter': 'не задан ID модуля фильтра',
					'module.func': 'не задана функция фильтра',
					'selector.list': 'Не задан список для фильтрации'

				},
				'interface' : {
					'processing' : 'Применяем фильтр...',
					'empty': 'К сожалению, по вашим параметрам ничего не найдено, попробуйте смягчить условия запроса или сформулировать его по-другому.'
				}
			}
		},


		build: function() {
			var self = this;

			this.config.module.main = this.config.module.main || this.$el.attr('data-module') || this.$el.attr('data-module-main') || this._error(this.config.module.main, 'module.main');

			this.config.module.filter = this.config.module.filter || this.$el.attr('data-module') || this.$el.attr('data-module-filter') || this._error(this.config.module.main, 'module.filter');
			this.config.module.func = this.config.module.func || this.$el.attr('data-function') || this.$el.attr('data-func') || this._error(this.config.module.main, 'module.func');

			this.config.ajax = this._getAttr('ajax') || this.config.ajax;
			this.config.hide = this._getAttr('hide');

			this.config.dependence = this.$el.attr('data-dependence') || this.config.dependence;

			if( !$(this.config.selector.list).length && this.config.ajax == true ) { this._error(this.config.selector.list, 'selector.list'); }

			if( this.$el.attr('data-filter-hide') == 'false' ) { this.config.hide = false; }

			this.config.url.current = this.$el.attr('action') || this.config.url.current;

			// найдем количество и выведем его
			this.total = this.$el.attr('data-total') || $(this.config.selector.list).attr('data-total');

			if( this.total ) {
				this.$el.find( self.config.selector.total ).text( this.total );
			}

			// если нет строки запроса и нет элементов, то отключаем фильтр
			if( !$(this.config.selector.list).find(this.config.selector.items).length && !window.location.search.length && this.config.hide && this.config.ajax != 'static' ) {
				this.$el.hide();
				return false;
			}
			else {
				this.$el.show();
			}

			this.cssclass = this.$el.attr('class');

			// массив тулбаров
			this.toolbars = [];
			this.$sliders = $('.range-slider, [role="range"]');

			if( this.$sliders.length ) {
				require('ui.slider', function() {
					self.toolbarsInit().uiSliderInit().bind().parseQS();
				})
			}
			else {
				this.toolbarsInit().bind().parseQS();
			}
		},

		// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			this.$el.on('click', 'input[type="checkbox"]:not(.independent, [readonly])', function() {
				var $input = $(this);
				( !$input.attr('checked') ) ? $input.attr('checked', 'checked') : $input.removeAttr('checked');
				self.update();
			});

			// обрабатываем элементы type="radio"
			this.$el.on('click', 'input[type="radio"]:not(.independent, [readonly])', function() {
				self.update();
			});

			this.$el.on('click', 'input[type="button"]', function() {
				self.update();
				return false;
			});

			this.$el.on('change', 'select[name]', function() {
				self.update();
			});

			this.$el.on('input', 'input:not(input[data-seed="select"])', function() {
				clearTimeout(self.timer);

				var $input = $(this);

				if( self.$el.find(self.$sliders.selector).length && /^(gt|min)/.test($input.attr('name')) ) {
					self.$el.find(self.$sliders.selector).filter('[name="'+$input.attr('for')+'"]').slider('values', 0, $input.val());
				}
				if( self.$el.find(self.$sliders.selector).length && /^(lt|max)/.test($input.attr('name')) ) {
					self.$el.find(self.$sliders.selector).filter('[name="'+$input.attr('for')+'"]').slider('values', 1, $input.val());
				}

				self.timer = setTimeout(function() {
					clearTimeout(self.timer);
					self.update();
				}, self.config.await);

				if( $(this).attr('type') != 'hidden' ) {
					$(this).parents('[role="toolbar"]:first').find('.caption').trigger('show');
				}
			})

			this.$el.on('keyup.seed.filter', 'input[data-seed="select"]', function(e) {
				if(e.keyCode == 13) {
					self.update();
				}
			});

			this.$el.on('submit', function() {
				if( self.config.func.submit ) {
					(self.config.func.submit)(self);
				}
				else {
					self.update();
				}
				return false;
			});

			$('body').on('click', '.button-minimize, .btn-minimize, [role="button-minimize"]', function(e) {
				var areas = self.$el.find('[aria-expanded]');

				if( areas.attr('aria-expanded') == 'true' ) {
					areas.slideUp(300, function() {
	                                	$(this).addClass('hide');
					});
					areas.attr('aria-expanded','false');
					$(this).addClass('closed').removeClass('active');
					
				}
				else {
					areas.removeClass('hide').slideDown(300);
					areas.attr('aria-expanded','true');
					$(this).removeClass('closed').addClass('active');
				}
			});

			$('body').on('click show', this.config.selector.dependence+' .caption', function(e) {
				var $caption = $(this);
				
				$.each(self.toolbars, function(i, toolbar) {
					if( $caption.get(0) == toolbar.$caption.get(0) ) {
						if( $caption.hasClass('closed') || e.type == 'show' ) {
							toolbar.$list.css({'height':'auto'});
							$caption.removeClass('closed');
						}
						else {
							toolbar.$list.css({'height': toolbar.height});
							$caption.addClass('closed');
						}
					}
				});
			});

			return this;
		},

		toolbarsInit: function() {
			var self = this;

			this.$el.find(this.config.selector.dependence).each(function() {
				var toolbar = {};

				toolbar.$caption = $(this).find('.caption');
				toolbar.$caret = toolbar.$caption.find('.caret');
				toolbar.$list = $(this).find('.items');
				toolbar.$items = toolbar.$list.find('> *');
				toolbar.height = toolbar.$items.filter(':first').height();

				if( toolbar.height < toolbar.$list.height() ) {
					toolbar.$list.css('height',toolbar.height);
					toolbar.$caption.addClass('action closed');
				}

				if( toolbar.$list.hasClass('open') ) {
					toolbar.$list.css('height', 'auto');
					toolbar.$caption.removeClass('closed');
				}

				self.toolbars.push( toolbar );
			});
			
			return this;
		},

		// инициализация UI слайдеров
		uiSliderInit: function() {
		    var self = this;
			
			this.$el.find(self.$sliders.selector).each(function() {
				var $slider = $(this);

				var label = $slider.attr('name');

				var values = {
					input_min: parseInt($slider.data('min')),
					input_max: parseInt($slider.data('max')),
					qs_min: parseInt($slider.data('qs-min')),
					qs_max: parseInt($slider.data('qs-max')),
					step: parseInt($slider.data('step')) || 1
				};

				values.min = (values.qs_min) ? values.qs_min : values.input_min;
				values.max = (values.qs_max) ? values.qs_max : values.input_max;

				try { $slider.slider('destroy') } catch(e) {}

				$slider.slider({
					range: true,
					values: [parseInt(values.min), parseInt(values.max)],
					min: parseInt(values.input_min),
					max: parseInt(values.input_max),
					step: parseInt(values.step),
					slide: function( event, ui ) {
						self.$el.find('input[name^=gt][for="'+label+'"], input[name^=min][for="'+label+'"]').val(ui.values[0]).attr('data-current', ui.values[0]);
						self.$el.find('input[name^=lt][for="'+label+'"], input[name^=max][for="'+label+'"]').val(ui.values[1]).attr('data-current', ui.values[1]);

						self.$el.find('.label[name^=gt][for="'+label+'"], .label[name^=min][for="'+label+'"]').text(ui.values[0]);
						self.$el.find('.label[name^=lt][for="'+label+'"], .label[name^=max][for="'+label+'"]').text(ui.values[1]);

						if( self.config.func.slide ) {
							(self.config.func.slide)(self, $slider, values, ui);
						}
					},
					stop : function() {
						self.update();
					},
					create: function( event, ui ) {
					}
				});
			});

			return self;
		},

		update: function() {
			var self = this;

			if(this.config.module.func == 'product') {
				if( this.$el.find('input[name="product_chr_string"]').length ) {
					this.$el.find('input[name="product_chr_string"]').val( this.$el.find('input[name="product_chr_string"]').val().replace(/\.$/,'').trim() );
				}
			}

			if( this.config.func.preserialize ) { (this.config.func.preserialize)(this); }

			this.$readonly = this.$el.add(this.config.selector.external).find(':input[readonly]').attr('disabled', 'disabled');
			this.query = this.$el.add(this.config.selector.external).serialize()
				.replace(/[a-z0-9\._]+=&/g,'')
				.replace(/[a-z0-9\._]+=$/,'')
				.replace(/(\&re.+?=)/g,'&$1')
				.replace(/\&\s/g,'&')
				.replace(/\s\&/g,'&')
				//.replace(/\+/g,' ')
				.replace(/&$/g,'');
			
			
			this.pagequery = '';
			// если мы разрешили передавать пагинацию
			if( this.config.paging === true ) {
				this.pagequery = this.config.url.current.replace(/\?.*/,'');
			}
			// если нет, то сбросим пагинацию на первую страницу
			else {
				this.pagequery = (/\?/.test(window.location.search) && /\/first/.test(window.location.search))
					? ( window.location.search.replace(/.*first([a-zA-Z]+).*/,'first$1'+'=0')) 
					: (this.config.url.current.replace(/\?.*/,'') + '?first'+this.config.module.func+'=0');
					
				this.query = this.query.replace(/&?first[a-zA-Z]+=[a-z0-9]+(?=&|$)/gi,'');
			}
			
			this.submitUrl = this.pagequery + (/\?/.test(this.pagequery) ? '&' : '?' ) + ((this.query.length) ? this.query : '');
			this.historyUrl = this.submitUrl;
			
			// кастомное преобразование QS запроса
			if( this.config.func.query ) {
				this.historyUrl = (this.config.func.query)(this);
			}
			
			if( this.config.convert === true ) {
				this.historyUrl = this.convert();				
			}
			
			if( this.config.ajax == 'custom' ) {
				if( this.config.func.custom ) {
					this.config.func.custom.call(self, this);
				}
			}
			else if( this.config.ajax === true ) {
				this.submit();
			}
			else if( this.config.ajax === 'static' ) {
				if( this.config.history === true ) window.history.pushState({}, 'page', this.historyUrl);

				if( self.config.func.success ) {
					(self.config.func.success)(self);
				}
			}
		},

		overlay: function(key) {
			if( !this.config.overlay ) return false;
			
			if( key === true || key === 'undefined' ) {
				this.$overlay = ( !$('#overlay-filter').length ) ? $('<div>',{'id':'overlay-filter', 'class':'seed-overlay'}).html('<div class="loader"></div><div class="loader-text">'+this.config.locale.interface.processing+'</div>').appendTo( $('body'), {'dymanic':false}) : $('#overlay-filter:first').show(); 
			}
			else if( key === false ) {
				try {
					this.$overlay.remove();
				}
				catch(e) {}
			}
		},

		submit: function() {
		    var self = this;
			// очищаем таймер, чтобы не вызывать обновление второй раз
			clearTimeout(self.timer);
		
			if (this.blocked) { return false; }
			
			//создаем оверлэй                                                                                                                          
			this.overlay(true);

			if(window.history.pushState && this.config.ajax === true) {
				
				if( this.config.history === true || this.config.convert === true ) window.history.pushState({}, 'page', this.historyUrl);

				var qs = {};
				qs['mime'] = 'txt';
				qs['show'] = this.config.module.main;
				
				qs = $.param(qs);
				
				// добавляем хвост URL
				qs = qs + this.config.url.tail;

				$.ajax({
					url: self.submitUrl,
					data: qs,
					cache: false,
					beforeSend: function() {
						self.blocked = true;
						if( self.config.func.before_send ) {
							(self.config.func.before_send)(self);
						}
					},
					statusCode : {
						404 : function() {
							console.error(self._name+': Нет такой страницы!');
							self.unblock();
						},
						503 : function() {
							console.error(self._name+': Страница недоступна!');
							self.unblock();
						}
					},
					success: function(data, textStatus, jqXHR) {
						// очищаем таймер, чтобы не вызывать обновление второй раз
						clearTimeout(self.timer);

						if( jqXHR.status == 200 ) {
							// проверим используется ли библиотека seedPage для фильтруемого списка
							// проверка для версии Seed 1
							try {
								self.seedPage1 = ( typeof $(self.config.selector.list).filter(':first').data('seed.page') == 'object' ) ? $(self.config.selector.list).filter(':first').data('seed.page').options : false;
							}
							catch(e) {}

							// убиваем seed.page
							if( $.type(seed) !== 'function' ) {
								if( seed.isFunction(seed.seedPage) ) {
									self.seedPage = $('[data-seed="page"]');
									var SP = self.seedPage.data('seed.page')
									if(SP) SP.destroy();
								}
							}


							self.$answer = $('<div>').html(data);

							var $block = self.$answer.find(self.config.selector.list);

							self.total = self.$answer.find(self.config.selector.list).attr('data-total') || self.$answer.find(self.config.selector.auto).attr('data-total') || self.total;
							
							if(self.seedPage1) $(self.config.selector.list).filter(':first').seedPage('destroy');

							$(self.config.selector.list).replaceWith($block);

							if(self.seedPage1) $(self.config.selector.list).seedPage( $.extend({}, self.seedPage, {url:{current:window.location.href}}) );

							// если не включен seed.lazy и включен seed.page
							if( $.type(seed) !== 'function' ) {
								if( seed.isFunction(seed.seedPage) && seed.config.lazy == false ) {
									self.seedPage = $('[data-seed="page"]').seedPage({
										'url' : {
											'current' : window.location.href
										}
									});
								}
							}

							// найдем список страниц, если он определен для выборки, заменим его на новый
							var $pages = self.$answer.find(self.config.selector.pages);
							if( $pages.length ) {
								$('body').find(self.config.selector.pages).each(function(i) {
									$(this).replaceWith($pages.get(i));
								})
							}
	        	
							if( self.config.dependence == 'true' || self.config.dependence === true) {
								self.dependence();
							}

							if( self.config.func.success ) {
								(self.config.func.success)(self, data);
							}

							self.reinit();

							$( self.config.selector.total ).text( self.total );

							self.emptyListing();
							self.unblock();
						}
					},
					error: function() {
						if( self.config.func.error ) {
							(self.config.func.error)(self);
						}

						console.error(self._name+': Произошла неизвестная ошибка!', jqXHR.status, textStatus);
						self.unblock();
					}
				});


			}
			else {
				window.location.href = this.submitUrl;
			}
		},

		// разблокировка функционала
		unblock: function() {
			if( this.$readonly.length ) this.$readonly.removeAttr('disabled');

			this.blocked = false;
			this.overlay(false);
		},

		// обрабатываем пустой ответ фильтра
		emptyListing: function() {
			if( this.$empty_title ) {
				if( this.$empty_title.length ) {
					this.$empty_title.remove();
					this.$empty_title = false;
				}
			}

			if( $(this.config.selector.list).find(this.config.selector.items).length === 0 ) {
				this.$empty_title = ( $(this.config.selector.list).find('.caption-empty-list').length )
					? $(this.config.selector.list).find('.caption-empty-list')
					: $('<h3>', {'class':'caption-empty-list none'}).text(this.config.locale.interface.empty).appendTo( $(this.config.selector.list) );
			}
		},

		// функционал зависимости блоков фильтра
		dependence: function() {
			var $dependences = this.$answer.find( this.config.selector.dependence );

			this.$el.parent().find(this.config.selector.dependence).each(function(i) {
				$(this).html( $($dependences[i]).html() );
			});

			this.toolbarsInit();
			this.uiSliderInit().parseQS();
		},

		//распарсим QS (realQuery)
		parseQS: function() {
			var self = this;

			var query = this.submitUrl || this.config.url.current || window.location.search;
			
			if (query.length) {
				query = decodeURIComponent(query);
				query = query.replace(/\+/gi,' ').replace(/%2F/gi,'/').replace(/%2C/gi,',').replace(/%2B/gi,' ').replace(/^(.*)\?/gi,'').replace(/^\?/gi,'')
				
				$.each(query.split('&'), function(i,data) {
					var $el;
					
					if(/=/.test(data)) {
						var name = data.split('=')[0].replace(/^r\d+/,'');
						var value = data.split('=')[1].replace(/^\^/,'');
						//данные для блока сортировки
						if(/sort/.test(name) ) {
							$el = self.findFilterElement(name, value);
							return;
						}
						if(/desc/.test(name)) {
							$el = self.findFilterElement(name, value);
							return;
						}
						if(/first/.test(name)) {
							return;
						}

						$el = self.findFilterElement(name, value);
					}

				});
				
				this.emptyListing();
			}

			if( self.config.func.after_parse ) {
				(self.config.func.after_parse)(self);
			}

			return this;
		},
		
		convert: function() {
			var self = this;
			var uri = this.historyUrl.replace(/\?(.*)/gi,'');
			var query = this.historyUrl.replace(/(.*)\?/gi,'');
			var allow = [];
			var deny = [];
			
			var rules = $.extend({}, self.config.rules, {
				allow: /,/.test(self.config.rules.allow) ? self.config.rules.allow.split(',') : false,
				deny: /,/.test(self.config.rules.deny) ? self.config.rules.deny.split(',') : false,
			}, true );
			
			// конвертация ключа
			function convertKey(key, value) {
				return key.replace( (
					( /^(sort|desc|first|quant)/.test(key) ) ? /^(sort|desc|first|quant).*/gi : /.*_(.*)$/gi
				),'$1') + '-' + value;
			}
				
			function sorter(a,b) {
				// ставим параметр фильтра всегда первым
				if( /^filter/.test(a) ) return -1;
				if( /^filter/.test(b) ) return 1;

				// ставим сортировку, направления сортировки, пагинацию и офсеты последними
				if(/^(sort|first|desc)/.test(a) ) return 1;
				if(/^(sort|first|desc)/.test(b) ) return -1;

				// сортируем остальные по алфавиту
				if( a > b ) return 1;
				if( a < b ) return -1;
				return 0;
			}
			
			// обрабатываем QS, раскидываем параметры по разрешенным и запрещенным
			query = query.replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
				key = decodeURIComponent(key).toLowerCase();
				value = decodeURIComponent(value).toLowerCase();
				
				// игнорим это
				if( $.type(rules.deny) === 'array' ) {
					var matched = '_';
					$.each(rules.deny, function(i, rule) {
						if( (new RegExp(rule)).test(key) ) matched = m;
					});
					
					if( matched != m ) allow.push(convertKey(key, value));
					return matched;
				}
				// обрабатываем это
				else if( $.type(rules.allow) === 'array' ) {
					var matched = m;
					$.each(rules.allow, function(i, rule) {
						if( (new RegExp(rule)).test(key) ) {
							allow.push(convertKey(key, value));
							matched = '_';
						}
					});
					return matched;
				}
				else {
					allow.push(convertKey(key, value));
					return '_';
				}
			}).replace(/(|\_)\&\_/gi,'').replace(/^(_|)&/,'');
			
			return uri.replace('.html','') + allow.sort(sorter).reduce(function(a,b) {
				var re = new RegExp("\\" + rules.separator + "?(.+?)\-(.+)");
				var str = a + ( ( a.replace(re, '$1') == b.replace(re, '$1') && rules.join ) ? (rules.repeater + b.replace(re, '$2') ) : (rules.separator + b ) );
				return str;
			}, '') + ((query.length) ? rules.separator + '?' + query : rules.separator);
		},

		findFilterElement: function(name, value) {
			var self = this;
			
			var $input = this.$el.add(this.config.selector.external).add(this.config.selector.dependence).find('[name="'+name+'"]');
			
			if( !$input.length ) { return false; }

			if( $input.get(0).tagName == 'SELECT' ) {
				$input.find('option[value="'+value+'"]').filter(function() {
					return $(this).attr('value').toLowerCase() == value.toLowerCase()
				}).attr('selected', true);
				$input.blur();
			}

			if( $input.get(0).tagName == 'INPUT' ) {
				if( $input.attr('type') == 'radio' ) {
					$input.filter(function() {
						return $(this).attr('value').toLowerCase() == value.toLowerCase()
					}).attr('checked', 'checked').blur();
				}
				else if( $input.attr('type') == 'checkbox' ) {
					$input.filter(function() {
						return $(this).attr('value').toLowerCase() == value.toLowerCase()
					}).attr('checked', 'checked').blur();
				}
				else { $input.val(value); }
			}
			
			$input.parents(self.config.selector.dependence+':first').find('.caption').removeClass('closed');

			return $input;

		}

	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
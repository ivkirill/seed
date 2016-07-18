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

			'dependence' : false,
			'hide' : true,

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
				'total' : '[role="total"]:first',
			},
			'event' : {
				'__on' : 'dynamic.seed.filter',
				'__off' : 'dynamic.seed.filter'
			},
			'url': {
				'current' : window.location.href
			},

			'func' : {
//callback-функция выполняющая после инициализации фильтра
				'ready' : null, 
//callback-функция выполняющая перед сериализацей формы
				'preserialize' : null,
//callback-функция выполняющая после сериализации формы и до оправки
				'before_send' : null,
//callback-функция выполняющая после сериализации формы и оправки, ВМЕСТО стандартной функции информационных сообщений.
				'success' : null,
//callback-функция выполняющая вместо сабмита фильтра
				'submit' : null,
//callback-функция выполняющая после сериализации формы, оправки и при получение ответа об ошибке
				'error':null
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
			if( !$(this.config.selector.list).find(this.config.selector.items).length && !window.location.search.length && this.config.hide ) {
				this.$el.hide();
				return false;
			}
			else {
				this.$el.show();
			}

			this.cssclass = this.$el.attr('class');


// проиницилизируем тулбары
			if( this.$el.find(this.config.selector.dependence).length ) {
				this.toolbars = [];
				self.toolbarsInit();
			}

			this.$sliders = $('.range-slider, [role="range"]');

			if( this.$sliders.length ) {
				$.require('ui.slider', function() {
					self.uiSliderInit().bind().parseQS();
				})
			}
			else {
				this.bind().parseQS();
			}
		},

// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			this.$el.on('click touchend', 'input[type="checkbox"]:not(.independent, [readonly])', function() {
				var $input = $(this);
				( !$input.attr('checked') ) ? $input.attr('checked', 'checked') : $input.removeAttr('checked');
				self.update();
//				return false;
			});

// обрабатываем элементы type="radio"
			this.$el.on('click touchend', 'input[type="radio"]:not(.independent, [readonly])', function() {
				self.update();
//				return false;
			});

			this.$el.on('click touchend', 'input[type="button"]', function() {
				self.update();
				return false;
			});

			this.$el.on('change', 'select[name]', function() {
				self.update();
			});

			this.$el.on('input', 'input:not(input[name="product_chr_string"])', function() {
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


			if(this.config.module.func == 'product') {
				this.$el.on('keyup.seed.filter', 'input[name="product_chr_string"]', function(e) {
					if(e.keyCode == 13) self.update();
				});

				this.$el.on('input', 'input[name="product_chr_string"]', function(e) {
					$(this).val( $(this).val().trim() );
				});

				this.$el.on('enter.seed.select', 'input[name="product_chr_string"]', function(e) {
					self.update();
				});
			}

			this.$el.on('submit', function() {
				if( self.config.func.submit ) {
					(self.config.func.submit)(self);
				}
				else {
					self.submit();
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

		},

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
						self.$el.find('input[name^=gt][for="'+label+'"], input[name^=min][for="'+label+'"]').val(ui.values[0]);
						self.$el.find('input[name^=lt][for="'+label+'"], input[name^=max][for="'+label+'"]').val(ui.values[1]);
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
			if( this.config.ajax == 'custom' ) {
				if( this.config.func.custom ) {
					(this.config.func.custom)(this);
				}
			}
			else if( this.config.ajax == true ) {
				this.submit();
			}
		},

		overlay: function(key) {
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
			if (this.blocked) { return false; }

			if(this.config.module.func == 'product') {
				if( this.$el.find('input[name="product_chr_string"]').length ) {
					this.$el.find('input[name="product_chr_string"]').val( this.$el.find('input[name="product_chr_string"]').val().replace(/\.$/,'').trim() );
				}
			}

			if( this.config.func.preserialize ) { (this.config.func.preserialize)(self); }

			this.readonly = this.$el.find(':input[readonly]').attr('disabled', 'disabled');

			this.query = this.$el.serialize().replace(/[a-z0-9\._]+=&/g,'').replace(/[a-z0-9\._]+=$/,'').replace(/&$/,'').replace(/(\&re.+?=)/g,'&$1').replace(/\&\s/g,'&').replace(/\s\&/g,'&');
//создаем оверлэй                                                                                                                          
			this.overlay(true);
			
			this.pagequery = (/\?/.test(window.location.search) && /\/first/.test(window.location.search) ) ? ( window.location.search.replace(/.*first([a-zA-Z]+).*/,'first$1'+'=0')) : (this.config.url.current.replace(/\?.*/,'') + '?first'+this.config.module.func+'=0');
			this.submitUrl = this.pagequery+'&'+this.query;

			if(window.history.pushState && this.config.ajax) {
				window.history.pushState({}, 'page', this.submitUrl);

				var qs = {};
				qs['mime'] = 'txt';
				qs['show'] = this.config.module.main;

				$.ajax({
					url: this.submitUrl,
					data: $.param(qs),
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
						if( jqXHR.status == 200 ) {
// проверим используется ли библиотека seedPage для фильтруемого списка
							try {
								self.seedPage = ( typeof $(self.config.selector.list).filter(':first').data('seed.page') == 'object' ) ? $(self.config.selector.list).filter(':first').data('seed.page').options : false;
							}
							catch(e) {

							}
	

							self.$answer = $('<div>').html(data);

							var $block = self.$answer.find(self.config.selector.list);
							self.total = self.$answer.find(self.config.selector.list).attr('data-total') || self.$answer.find(self.config.selector.auto).attr('data-total') || self.total;


							if(self.seedPage) { $(self.config.selector.list).filter(':first').seedPage('destroy'); }

							$(self.config.selector.list).replaceWith($block);

							if(self.seedPage) { $(self.config.selector.list).seedPage( $.extend({}, self.seedPage, {url:{current:window.location.href}}) ) }

	        	
							if( self.config.dependence == 'true' || self.config.dependence === true) { self.dependence(); }

							if( self.config.func.success ) {
								(self.config.func.success)(self);
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

// разброликровка функционала
		unblock: function() {
			this.readonly.removeAttr('disabled');

			this.blocked = false;
			this.overlay(false);
		},

// обрабатываем пустой ответ фильтра
		emptyListing: function() {
			if( !$(this.config.selector.list).find(this.config.selector.items).length ) {
				$('<h3>',{'class':'none'}).text(this.config.locale.interface.empty).appendTo( $(this.config.selector.list), {'dymanic':false});
			}
		},

// функционал зависимости блоков фильтра
		dependence: function() {
			var $dependences = this.$answer.find( this.config.selector.dependence );

			this.$el.parent().find(this.config.selector.dependence).each(function(i) {
				$(this).html( $($dependences[i]).html() );
			});

// хак для динамической обработки библиотекой select
/*
			this.$el.find('[data-seed="select"]').each(function() {
				$(this).insertBefore( $(this) );
			});
*/
			this.toolbarsInit();
			this.uiSliderInit().parseQS();
		},

//распарсим QS (realQuery)
		parseQS: function() {
			var self = this;

			var query = window.location.search;
			if (query) {
				query = decodeURIComponent(query);
				query = query.replace(/\+/gi,' ').replace(/%2F/gi,'/').replace(/%2C/gi,',').replace(/%2B/gi,'+').replace(/^\?/gi,'');

				$.each(query.split('&'), function(i,data) {
					if(/=/.test(data)) {
						var name = data.split('=')[0].replace(/^r\d+/,'');
						var value = data.split('=')[1].replace(/^\^/,'');
//данные для блока сортировки
						if(/sort/.test(name) ) {
							var el = self.findFilterElement(name, value);
							return;
						}
						if(/desc/.test(name)) {
							var el = self.findFilterElement(name, value);
							return;
						}
						if(/first/.test(name)) {
							return;
						}

						self.findFilterElement(name, value);
					}

				});
				this.emptyListing();
			}
			return this;
		},

		findFilterElement: function(name, value) {

			var self = this;

			var $input = this.$el.find('[name="'+name+'"]');
			if( !$input.length ) { return false; }

			if( $input.get(0).tagName == 'SELECT' ) {
				$input.find('option[value="'+value+'"]').attr('selected', true);
				$input.blur();
			}

			if( $input.get(0).tagName == 'INPUT' ) {
				if( $input.attr('type') == 'radio' ) {
//					self.$el.find('[name="'+name+'"]').removeAttr('checked');
					$input.filter('[value="'+value+'"]').attr('checked', 'checked').blur();
				}
				else if( $input.attr('type') == 'checkbox' ) {
					$input.filter('[value="'+value+'"]').attr('checked', 'checked').blur();
				}
				else { $input.val(value); }
			}

			return $input;

		}

	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
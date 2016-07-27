/* 
* Seed Framework
* seedSelect 
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
	var name = 'seedSelect';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.1';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,

			'evented': false,

			'type' : 'mixed',
//			'time_hide' : 10000,

			'ajax' : false,
			'side' : 'left',
			'height': '400',
			'search': false,

			'selector': {
				'auto' : '[data-seed="select"]'
			},

			'cssclass' : {
				'select' : '',
				'holder' : 'btn btn-default',
				'dropdown' : '',
				'item' : '',
				'uniq' : '',
				'loader' : 'fa fa-spinner fa-pulse' //'fa fa-spinner fa-pulse' дополнительный стилевой класс для иконки загрузки
			},

			'event' : {
				'on' : 'dynamic.seed.select',
				'__on' : 'dynamic.seed.select'
			},
			'url': {
				'ajax' : null
			},
			'module': {
				'main' : null,
				'func' : null
			},
			'func' : {
				'change' : null,
				'type' : null
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title',
					'module.main': 'не задан ID модуля',
					'url.ajax': 'не задан URL запроса'
				},
				'interface': {
				}
			}
		},

		build: function() {
			var self = this;

			if( this.$el.attr('data-select-ajax') || this.$el.attr('data-select-url') ) {
				this.config.ajax = true;
			}

// включаем поиск 
			if( this.$el.attr('data-select-search') == 'true' ) {
				this.config.search = true;
			}


// если данные подгружаются по ajax, значит определим модуль
			if( this.config.ajax ) {
				this.config.module.main = this.config.module.main || this.$el.attr('data-module') || this.$el.attr('data-module-main') || this._error(this.config.module.main, 'module.main');
				this.config.url.ajax =  this.config.url.ajax || this.$el.attr('data-select-url') || this._error(this.config.url.ajax, 'url.ajax');
			}

			this.$holder = $('<div>', {'class':'select'}).insertBefore( this.$el, {'dynamic':false});
			this.$el.appendTo( this.$holder, {'dynamic':false});

			this.config.side = this.$el.attr('data-select-side') || this.config.side;
			this.config.height = this.$el.attr('data-select-height') || this.config.height;
			if( this.config.height ) { this.config.height += 'px'; }

			//this.config.cssclass.dropdown = ' pull-'+this.config.side;

// выпадающее поле селекта
			this.$drop = $('<div>', { 'class': 'dropdown-menu ' + this.config.cssclass.dropdown }).appendTo( this.$holder, {'dynamic':false});
// меню списка вариантов
			this.$menu = $('<ul>', {'class': 'select-options'}).css('max-height',this.config.height).appendTo( this.$drop, {'dynamic':false});
// подвал поля
			this.$summary = $('<div>', { 'class': 'select-summary dropdown-footer'}).appendTo( this.$drop, {'dynamic':false});
// шапка поля
			this.$header = $('<div>', { 'class': 'select-header dropdown-header'}).prependTo( this.$drop, {'dynamic':false});
// жлемент статуса
			this.$status = $('<div>', {'class':'select-status'}).insertAfter( this.$el, {'dynamic':false});
			this.$loader = $('<i>', {'class': this.config.cssclass.loader }).prependTo( this.$status, {'dynamic':false});

			this._detect();
			this.$input.attr('autocomplete','off');

			if( this.element == 'select' ) {
				this.$holder.addClass( this.config.cssclass.holder );
				this.$wrap = $('<div>', { 'class': 'select-wrap ' + this.config.cssclass.select }).appendTo( this.$holder, {'dynamic':false});
				this.$caption = $('<span>', { 'class' : 'select-title' }).appendTo( this.$wrap, {'dynamic':false} );
				this.$caption.html( this.$el.find('option:first').html() );
				this.$caret = $('<i>').addClass('caret').appendTo( this.$wrap, {'dynamic':false} );
				this._options();

// если в селекте всего один элемент, то выберем его
				if( this.$el.find('option:not(:disabled)').length == 1 ) {
					this.$menu.find('li:first a').click();
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!					this.$menu.find('li:first a').click();
				}
			}

			this.bind();
		},

// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			if( this.element == 'select' ) {
				$('body').on('change blur', this._$list.selector, function(e) {

					var option = self.$input.find('option:selected');
					self.$holder.removeClass('btn-danger');
					self.$caption.html( option.html() );
					self.$menu.find('a[value="'+ option.val() +'"]');
				});

				$(this.$holder, this.$wrap, this.$caption, this.$caret).on('click touchend', function(e) {
					if (self.$holder.is(e.target) || self.$wrap.is(e.target) || self.$caption.is(e.target) || self.$caret.is(e.target) ) {
						var toggler = ( !self.$drop.is(':visible') ) ? true : false;
						if(toggler) {
							self.$active = self.$menu.find('.active');
							if( self.$active.length ) {
//								self.scroll();
							}
							else {
								self.$active = self.$menu.find('li[data-tie="'+ self.$input.find('option:selected').data('tie') +'"]').addClass('active');
							}
							self.show();
						}
						else {
							self.hide();
						}
						return false;
					}

				});
			}
			else {
				this.$holder.on('click touchend', function(e) {
					var toggler = ( !self.$drop.is(':visible') && self.$menu.is(':empty') ) ? false : true;
					(toggler) ? self.show() : self.hide();
					return false;
				});
			}

			this.$input.on({
				'keyup.seed.select' : function(e) {
					clearTimeout(self.timer);

					self.string = $(this).val();
//console.log(self.config.url)
//удаляем пробелы
					if( /^\s/g.test(self.string) ) {
						$(this).val( $(this).val().replace(/^\s/,'') );
						self.string = self.string.replace(/^\s/,'');
					}

//Биндим клавиши: вверх, вниз, enter 
					if(e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13) {

						var $active = self.$menu.find('>*.active:first');

						if( $active.length && e.keyCode == 13) {
							if( self.config.func.select ) {
								(self.config.func.select)(self);
							}
							else {
								self.$input.val( $active.attr('data-value').replace(/<(|\/)b>/gi,'') );
								self.$input.trigger('enter.seed.select');
							}
							self.hide();

							//return false;
						}
						else if( !$active.length) {
							$active = self.$menu.find('.hover:first');
							if( !$active.length ) $active = self.$menu.find('>*:first, >*:first a')
							$active.addClass('active')

							return false;
						}
						else {
							self.show();
							self.$menu.find('*').removeClass('active');//.off('mouseenter mouseleave');
        
							if(e.keyCode == 40) {
								$active = $active.next(':not(.divider)');
								if( !$active.length ) { $active = self.$menu.find('>*:first') }
								self.$active = $active;
								$active.addClass('active').find('> a').addClass('active');
								self.direction = 'bottom';
							}
							if(e.keyCode == 38) {
								$active = $active.prev(':not(.divider)');
								if( !$active.length ) { $active = self.$menu.find('>*:not(.divider):last') }
								self.$active = $active;
								$active.addClass('active').find('> a').addClass('active');
								self.direction = 'top';
							}

							self.scroll();
						}
						self.$input.val( $active.attr('data-value').replace(/<(|\/)b>/gi,'') ); 
					
						return false;
					}       	

					if( self.config.ajax && self.string.length > 1 ) {
// таймер, чтобы не вызывать функцию пока пользователь печатает запрос
						self.timer = setTimeout(function() {
//если есть кастомная функция определения типа подсказки, то запускаем её
							if( self.config.func.type ) {
								self.type = (self.config.func.type)(self);
							}
							else {
//если нет, то тип по умолчанию
								self.type = self.$input.attr('data-type') || self.config.type;
							}

							self._status('show');

							var qs_name = self.config.name || self.$input.attr('name');

//Отправляем ajax запрос на получение списка доступных значений
							var qs = {};
							qs['show'] = self.config.module.main;
							qs['items'] = self.config.module.main;
							qs[qs_name] = self.string;
							qs['mime'] = 'txt';
							qs['type'] = self.type;

							$.ajax({
								url: self.config.url.ajax,
								data: $.param(qs),
								cache: false,
								statusCode : {
									404 : function() {
										console.error(self._name+'error: '+'404 page not found!');
									},
									503 : function() {
										console.error(self._name+'error: '+'503 service unavailable!');
									}
								},
								success: function(data, textStatus, jqXHR) {
									if( jqXHR.status == 200 ) {
//Отправляем ответ на разметку
										self.markup(data);
									}
								},
								error: function() {
									console.error(self._name+'error: '+ 'Произошла неизвестная ошибка!');
								}
							});
						}, 300);
					}
					else {
						self.markup(false);
					}
				}
			});


			$('body *').on('click', function(e) {
				if (!self.$holder.is(e.target) && self.$holder.has(e.target).length === 0) {
					self.hide();
				}
			})

			this.$menu.on('click touchend', '> *', function() {
				self.$menu.find('*').removeClass('active');

				$(this).addClass('active')
				self.$input.val( $(this).attr('data-value').replace(/<(|\/)b>/gi,'') ).change();
				self.$input.trigger('enter.seed.select');
				self.hide();

				return false;
			});
		},

// переключение иконки статуса
		_status: function(toggle) {
			if(toggle == 'show') {
				this.$status.css('visibility','visible');
			}
			if(toggle == 'hide') {
				this.$status.css('visibility','hidden');
			}
		},

// определение элемента
		_detect: function() {
			if( this.el.tagName == 'SELECT' ) {
				if( this.config.search ) {
					this.$input = $('<input>', {'class': 'form-control'}).appendTo( this.$header, {'dynamic':false});
				}
				else {
					this.$input = this.$el;
				}

        			this.$input.attr('data-value', this.$el.val());
				this.element = 'select';
			}
			else if( this.el.tagName == 'INPUT' ) {
				this.$input = this.$el;
				this.$input.attr('data-value', this.$input.val());
				this.element = 'input';
			}
			else {
				this.$input = $('<input>', {'type' : 'hidden'}).appendTo( this.$holder, {'dynamic':false});
				this.$input.attr('data-value', this.$input.val());
				this.element = 'input';
			}
		},

// если элемент Select
		_options: function() {
			var self = this;

			this.$el.find('option').each(function(i, obj) {
				if( $(obj).attr('disabled') ) { return; }

				var elements = [];

				var $option = self.$el.find('option:eq('+i+')').attr('data-tie', i );

				var $li = $('<li>', {'data-value': $option.val(), 'data-tie': $option.data('tie'), 'data-string': $option.text(), 'data-type':'select'}).appendTo( self.$menu, {'dynamic':false});

// если у элемента есть данные об подсказке изображении, то сохраним эти данные
				if( $(obj).attr('data-tooltip-image') ) {
					$li.attr('data-tooltip-image', $(obj).attr('data-tooltip-image'));
				}

// если у элемента есть данные об подсказке 
				if( $(obj).attr('data-tooltip-side') ) {
					$li.attr('data-tooltip-side', $(obj).attr('data-tooltip-side'));
				}
				            
				var $a = $('<a>', {'data-value': $option.val(), 'data-tie': $option.data('tie') }).html( $option.text() ).appendTo( $li, {'dynamic':false});

				if( $(obj).attr('selected') ) {
					$li.addClass('active');
					self.$caption.text( $option.text() );
				}

				elements.push($option, $li, $a);

				$a.on('click', function(e) {
					self.$caption.html( this.innerHTML );
					self.hide();

					self.$el.find('option').prop('selected', false).removeAttr('selected');
					self.$el.find('option[data-tie="'+i+'"]').prop('selected', true);
					self.$el.change();
					self.$menu.find('.active').removeClass('active');
					$li.addClass('active');

					self.$input.val( $option.val() );

					if( self.config.func.change ) {
						(self.config.func.change)($option, self, obj);
					}

					return false;
				});
			});

			this.$source = this.$menu;
		},

// скроллинг меню
		scroll: function() {
			var scroll = this.$menu.scrollTop();
			var height1 = this.$menu.height()
				+ parseInt( this.$menu.css('padding-top'))
				+ parseInt( this.$menu.css('padding-bottom'))
				+ parseInt( this.$menu.css('border-top-width'))
				+ parseInt( this.$menu.css('border-bottom-width'));

			var height2 = this.$active.height()
				+ parseInt( this.$active.css('padding-top'))
				+ parseInt( this.$active.css('padding-bottom'))
				+ parseInt( this.$active.css('border-top-width'))
				+ parseInt( this.$active.css('border-bottom-width'));

			var top = this.$active.offset().top - this.$menu.offset().top + scroll;

			if( this.direction == 'bottom' ) {
				this.$menu.stop().animate({"scrollTop":top - height1 + height2}, 200);
			}
			else {
				if( scroll - height2 < height1 ) {}
				this.$menu.stop().animate({"scrollTop":top}, 200);
			}
		},

//Фунция разметки
		markup: function(data) {
			var self = this;

			if(data.length < 5 && data != null) {
				this._status('hide');
				this.hide();
				return false;
			}

			this.re = new RegExp(self.string,'ig');
			this.$help = $('<div>').html(data);

			this.$menu.find('.hidden').removeClass('hidden');

			this.words = [];
			this.articles = [];
			this.$suggestion = $('<div>');

// если мы ищем уникальные слова, то перебираем все значения найденные в БД, удаляем лишные слова и пробелы
			this.$help.find('> [data-type="text"]').each(function(i, el) {
				if( self.type == 'text' || ( self.type == 'mixed' && $(el).attr('data-type') == 'text' ) ) {
					var text = $(el).attr('data-value') || $(el).text();
              		                try {
						$.each(text.split(' '), function(i,word){
							if( self.re.test(word) ) {
				                                self.words.push(word.toLowerCase().replace(',',''));
								$(el).remove();
							}
						});
					}
					catch(e) {}
				}
			});

// если мы отфильтровываем данные селекта, то
			this.$menu.find('> [data-type="select"]').each(function(i, el) {
				if( !self.re.test($(el).attr('data-string')) && !self.re.test($(el).attr('data-value')) ) {
					$(el).addClass('hidden');
				}
			});

	
//выбираем только уникальные значения подсказки и составляем новый список
			if( this.words.length > 0 ) {
				$.each($.unique(this.words), function(i,j) {
					$('<li>',{'class':self.config.cssclass.uniq}).html('<a>'+j.replace(self.re,'<b>'+self.string+'</b>')+'</a>').attr('data-value', j).appendTo(self.$suggestion, {'dynamic':false});
				});
			}


			this.$summary.html( this.$help.find('[data-type="total"]').html() );
			this.$help.find('[data-type="total"]').remove();

			

//обноялем список подсказок
			if(data) { this.update(this.$help.html() + this.$suggestion.html()); }

			self._status('hide');
		},

//Функция обновления списка подсказок
		update: function(data) {
			this.$menu.html('');
			this.$menu.html( data );
			this.show();
		},

//Функция отображения списка подсказок
		show: function() {
			this.$drop.removeClass('off').addClass('on effect effect-drop').css('display','block');

			if( this.element == 'select' ) {
				this.$caret.removeClass('off').addClass('on effect effect-rotate effect-rotate-180');
			}
			if( this.config.search ) {
				this.$input.focus();
			}
//			self.timer = setTimeout(function() { self.hide() }, settings.time_hide);
		},
//Функция скрытия списка подсказок
		hide: function() {
			this.$drop.removeClass('on').css('display','none');

			if( this.element == 'select' ) {
				this.$caret.removeClass('on');
			}
			return false;
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
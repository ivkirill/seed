/* 
* Seed Framework
* User Interface
* ver. 1.0
* Kirill Ivanov
* create: 2015.08.17
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedUI';

	$.seed[name] = {};
	$.seed[name].VERSION  = '1.0';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'ajax' : true,

			'data' : null,

			'module' : {
				'main' : null,
				'function': false
			},

			'selector': {
				'auto' : '[data-seed="ui"]'
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
					'title': 'не задан title',
					'module.main': 'не задан ID модуля',
					'module.page': 'не задан ID PAGE модуля',
					'module.data': 'не задан индификатор для UI',
					'url.reload': 'не задан URL для обновление состояния контейнреа'
				}
			}
		},

		build: function() {
			var self = this;

			this.name = this.name || this.$el.attr('data-ui') || this._error(this.config.module.data, 'module.data');
// список
			this.$list = ( this.$el.attr('role') == 'list' ) ? this.$el : this.$el.find('[data-ui="'+ this.name +'"][role="list"]:first');
// кнопка добавить
			this.$button_add = $('[data-ui="'+ this.name +'"][role="button-add"]');
// кнопка редактировать
			this.$button_edit = $('[data-ui="'+ this.name +'"][role="button-edit"]');

// кнопка удалить
			this.$button_remove = $('[data-ui="'+ this.name +'"][role="button-remove"]');

// форма добавления
			this.$add = $('[data-ui="'+ this.name +'"][role="form-add"]');
			this.$wrap_add = $('<div>').attr('title', this.$add.attr('title')).append( this.$add );

			this.$container = $('[data-ui="'+ this.name +'"][role="container"]') || this.$el;

//			this.config.url.reload = self.$container.attr('data-url-reload') || this._error(this.config.url.reload, 'url.reload'); 

// определение нужных ID
			this.config.module = {}
			this.config.module.main = this.config.module.main
					|| this.$el.attr('data-module-main')
					|| this.$list.attr('data-module-main')
					|| this._error(this.config.module.main, 'module.page');

			this.config.module.page = this.config.module.page
					|| this.$el.attr('data-module-page')
					|| this.$list.attr('data-module-page')
					|| this._error(this.config.module.page, 'module.page');

// проверим является ли наш список таблицей и проинициализирует tablesorter
//			if( this.$list.get(0).tagName == 'TABLE' && !this.$list.hasClass('datatables-inited') ) { this.$list.DataTable().addClass('datatables-inited'); }
			Sortable.init();


			this.bind();
		},

		prepare: function() {
// TODO сделать проверку на существование DATAPICKER
//			$('.cms_datepicker', form).datepicker({dateFormat: 'yy-mm-dd', showOn: 'both'});
		},


// обрабатываем событие Edit, приватная функция 
		_add: function (obj) {
			return this.add(this._getReload(obj));
		},


// добавить новую строку
		add: function (reload) {
			var self = this;

			this.$modal_add = this.$wrap_add.seedModal({
				'dynamic': false,
				'buttons' : {
					'Сохранить': function() {
						$('form', this.$content).submit();
					},
					'Отмена': function() {
						this.close();
					}
				}
			});

			this.reinit();

			this.$form_add = this.$modal_add.data('seed.modal').$content.find('[data-ui="'+ self.name +'"][data-fields][role="form-add"]').seedGform('destroy').seedGform({
				'url' : {
					'current' : reload
				},
				'ajax': self.config.ajax,
				'func': {
					'ready' : function() {
// console.log('UI ADD', self.name, reload);
					},
					'ajax_success_callback' : function(gform, data) {
						if( self.config.debug ) {
							console.info(data);
						}
						self.config.url.add = gform.config.url.current;
						self.reload(reload);

						setTimeout(function () {
							self.$modal_add.seedModal('close');
						}, 500);
					}
				}
			});

			return false;
		},

// обрабатываем событие Remove, приватная функция
		_remove: function (obj) {
			var self = this;
			var $row = $(obj).parents('[role="item"]:first').addClass('warning');
			return this.remove(this._getHref(obj), this._getReload(obj), this._getTitle(obj));
		},

// удаляем строку, впоследствии эту функцию можно переопределить вне класса
		remove: function (href, reload, title) {
			var self = this;

			if (confirm('Удаляем навсегда?')) {	
				$.post(href, {
					show:self.config.module.main,
					update:self.config.module.main,
					action:'remove',
					mime: 'txt',
					from:window.location.href
				}, function(data) { 
					self.reload(reload);
				},"html");
			}
			else {
				self.$container.find('[role="item"]').removeClass('warning');
			}
			return false;
		},

// обрабатываем событие Edit, приватная функция 
		_edit: function (obj) {
			return this.edit(this._getHref(obj), this._getReload(obj), this._getTitle(obj));
		},

// редактируем строку, впоследствии эту функцию можно переопределить вне класса
		edit: function (href, reload, title) {
			var self = this;

			$.ajax({
				url: href,
				dataType: 'html',
				data: {'show': self.config.module.page, 'mime':'txt'},
				cache: false,
				success: function(data) {
					self.$wrap_edit = $('<div>').html(data);
					self.$wrap_edit.attr('title', self.$wrap_edit.find('> :first').attr('title'));


					self.$modal_edit = self.$wrap_edit.seedModal({
						'dynamic':false,
						'buttons' : {
							'Сохранить': function() {
								$('form', this.$content).submit();
							},
							'Удалить': function() {
								if( confirm('Удаляем \xab'+$('form', this.$content).get(0).Name.value+'\xbb навсегда?') ) {
									$('form', this.$content).get(0).action.value='remove'
									$('form', this.$content).trigger('submit', {'novalidate':true});
								}
							},
							'Отмена': function() {
								this.close();
							}
						}
					});

					self.reinit();

					self.$form_edit = self.$modal_edit.data('seed.modal').$content.find('[data-ui="'+ self.name +'"][data-fields][role="form-edit"]').seedGform('destroy').seedGform({
						'url' : {
							'current' : href
						},
						'ajax': self.config.ajax,
						'func': {
							'ready' : function() {
// console.log('UI _editForm INIT', self.name, reload);
							},
							'ajax_success_callback' : function(gform, data) {
								if( self.config.debug ) {
									console.info(data);
								}

								self.$modal_edit.seedModal('buttons', {
									'buttons' : {
										'Закрыть': function() {
											this.close();
										}
									}
								});

								self.config.url.edit = href;
								self.reload(reload);

								setTimeout(function () {
									self.$modal_edit.seedModal('close');
								}, 500);
							}
						}
					});

				}
		        });

	
			return false;
		},

// перегрузить список в основном окне 
		reload: function (href) {
			var self = this;
			if( this.$list.length ) {
				$.get(href, {'show': self.config.module.main, 'mime':'txt', 'cache': false}, function(data) {
					var ans = $('<div>').html(data);
					self.$container.html( ans.find(self.$container.selector).html() );
					Sortable.init();
					self.reinit();
				});
			}
		},

// получение урла для запроса
		_getHref: function(obj) {
			return $(obj).attr('href') || $(obj).data('seed.tooltip').title || $(obj).parents('[role="item"]:first').attr('href'); 
		},
// получение урла для обновления списка
		_getReload: function(obj) {
			return $(obj).attr('data-url-reload'); 
		},
// получение заголовка 
		_getTitle: function(obj) {
			return $(obj).attr('title') || $(obj).parents('[role="item"]:first').attr('title');
		},

// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			$('body').off('click touchend', this.$button_add.selector).on('click touchend', this.$button_add.selector, function() { self._add(this); return false; });
			$('body').off('click touchend', this.$button_edit.selector).on('click touchend', this.$button_edit.selector, function() { self._edit(this); return false; });
			$('body').off('click touchend', this.$button_remove.selector).on('click touchend', this.$button_remove.selector, function() { self._remove(this); return false; });

		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
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
			'ajax' : true,
			'selector': {
				'auto' : '[data-seed="ui"][data-ui]',
				'add' : '[role="button-add"][data-ui]',
				'edit' : '[role="button-edit"][data-ui]',
				'remove' : '[role="button-remove"][data-ui]',
				'list' : '[role="list"][data-ui]',
				'item' : '[role="item"][data-ui]',
				'container' : '[role="container"][data-ui]',
				'addform' : '[role="form-add"][data-ui]',
				'editform' : '[role="form-edit"][data-ui]'
			},
			'autoclose' : true,
			
			'event' : {
				'__on' : null,
				'__off' : null
			},
			'url': {
				'current' : window.location.href,
				'reload' : window.location.href,
				'add' : window.location.pathname
			},
			'func' : {
				'add' : null
			},
			'module' : {
				'main' : null,
				'page' : null
			},
			'modal' : {
				'overlay' : true,
				'draggable' : false
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

			// определим Name текущего обьекта UI
			this.name = this.name || this.$el.attr('data-ui') || this._error(this.config.module.data, 'module.data');
			
			// определяем глобальный конфиг UI если его нет
			if( seed.config.ui ) seed.config.ui = {};
			
			// обновляем селекторы конфига
			this.config.selector.add = '[data-ui="'+ this.name +'"]' + this.config.selector.add
			this.config.selector.edit = '[data-ui="'+ this.name +'"]' + this.config.selector.edit
			this.config.selector.remove = '[data-ui="'+ this.name +'"]' + this.config.selector.remove
			
			this.config.selector.addform = '[data-ui="'+ this.name +'"]' + this.config.selector.addform;
			this.config.selector.editform = '[data-ui="'+ this.name +'"]' + this.config.selector.editform;
			this.config.selector.container = '[data-ui="'+ this.name +'"]' + this.config.selector.container;
			
			// обновляем URL конфига
			this.config.url.add = this.config.url.add + '?add' + this.name + '=true';
			
			// список
			this.$list = $('[data-ui="'+ this.name +'"]' + this.config.selector.list);
			// булевой ключ проврки обновления списка
			this.updated = false;
			
			// кнопка добавить
			this.$button_add = $(this.config.selector.add);
			
			// кнопка редактировать
			this.$button_edit = $(this.config.selector.edit);
			
			// кнопка удалить
			this.$button_remove = $(this.config.selector.remove);

			// форма добавления
			this.$add = $('[data-ui="'+ this.name +'"]' + this.config.selector.addform);

			this.$wrap_add = $('<div>').attr('title', this.$add.attr('title')).append( this.$add );
			this.$container = $('[data-ui="'+ this.name +'"]' + this.config.selector.container) || this.$el;

			// определение нужных ID
			this.config.module.main = this.config.module.main
					|| this.$el.attr('data-module-main')
					|| this.$list.attr('data-module-main')
					|| this._error(this.config.module.main, 'module.page');

			this.config.module.page = this.config.module.page
					|| this.$el.attr('data-module-page')
					|| this.$list.attr('data-module-page')
					|| this._error(this.config.module.page, 'module.page');
					
			this.bind();
		},

		prepare: function() {
		},


		// обрабатываем событие add, приватная функция 
		_add: function (obj) {
			return this.add(obj, this._getTitle(obj));
		},

		// добавить новую запись
		add: function(obj, title) {
			var self = this;

			// кастомный конфиг кнопок для seed.modal
			var modal_buttons = $.extend({}, seed.config.ui[this.name+'_addbutton'] || {}, {
				'Сохранить': function() {
					$(self.config.selector.addform, this.$content).submit();
				},
				'Отмена': function() {
					this.close();
				}
			});
			
			// обновим конфиг seed.ui для текущего запуска от кнопки
			var config = $.extend(true, {}, this.config, seed.core.fn._dataset(obj));
			
			// создаем модальное окно по кнопке
			this.$modal_add = $(obj).seedModal({
				'lazy' : false,
				'title' : title,
				'overlay' : config.modal.overlay,
				'draggable' : config.modal.draggable,
				'ajax' : config.ajax,
				'url' : {
					'ajax' : config.url.add
				},
				'module' : {
					'main' : config.module.main					
				},
				'cssclass' : {
					'modal' : 'modal-add-'+self.name,
					'header' : 'modal-header-add-'+self.name
				},
				'buttons' : modal_buttons,
				'func' : {
					'open' : function(modal) {
						// определим форму для добавления
						// используем seedGform - сначала уничтожаем предыдущую созданную форму, после инициализируем её снова
						self.$form_add = modal.$content.find(self.config.selector.addform);
						if( self.$form_add.attr('data-seed') == 'gform' && self.config.lazy === true ) self.$form_add.seedGform('destroy');
						self.$form_add.seedGform({
							'url' : {
								'current' : config.url.current
							},
							'ajax': config.ajax,
							'dataType' : 'json',
							'func' : {
								'ajax_success_callback' : function(gform, data) {
									if( config.debug ) console.info(data);
									
									self.updated = true;
									
									// если нет опредленного контекста для обновления данных в форме, то считаем что мы не перезагружаем её
									// поэтому и не убираем кнопки модального окна и не закрываем его автоматически
									if( !gform.$context ) {
										modal.buttons({
											'Закрыть': function() {
												this.close();
											}
										});

										// если включена функция автозакрытия
										if( config.autoclose === true ) {
											setTimeout(function () {
												modal.close();
											}, 1000);
										}
									}
								}
							}
						});
					},
					'close' : function() {
						// после закрытия окна
						// обновляем список
						if( self.updated === true ) self.reload();
					}
				}
			});
			return false;
		},

		// обрабатываем событие Edit, приватная функция 
		_edit: function(obj) {
			return this.edit(obj, this._getTitle(obj), this._getHref(obj));
		},

		// редактируем строку, впоследствии эту функцию можно переопределить вне класса
		edit: function (obj, title, href) {
			var self = this;

			// кастомный конфиг кнопок для seed.modal			
			var modal_buttons = $.extend({}, seed.config.ui[this.name+'_editbutton'], {
				'Сохранить': function() {
					$(self.config.selector.editform, this.$content).submit();
				},
				'Удалить': function() {
					if( confirm('Удаляем \xab'+$('form', this.$content).get(0).Name.value+'\xbb навсегда?') ) {
						$('form', this.$content).get(0).action.value='remove';
						$('form', this.$content).trigger('submit', {'novalidate':true});
					}
				},
				'Отмена': function() {
					this.close();
				}						
			});
			
			// обновим конфиг seed.ui для текущего запуска от кнопки
			var config = $.extend(true, {}, this.config, seed.core.fn._dataset(obj));
			
			// создаем модальное окно по кнопке
			this.$modal_edit = $(obj).seedModal({
				'lazy' : false,
				'title' : title,
				'overlay' : config.modal.overlay,
				'draggable' : config.modal.draggable,
				'ajax' : config.ajax,
				'url' : {
					'ajax' : href
				},
				'module' : {
					'main' : config.module.main					
				},
				'cssclass' : {
					'modal' : 'modal-edit-'+self.name,
					'header' : 'modal-header-edit-'+self.name
				},
				'buttons' : modal_buttons,
				'func' : {
					'open' : function(modal) {
						self.$modal_edit = modal.$el;
						
						// определим форму редактирования
						// используем seedGform - сначала уничтожаем предыдущую созданную форму, после инициализируем её снова
						self.$form_edit = modal.$content.find(self.config.selector.editform)
						if( self.$form_edit.attr('data-seed') == 'gform' && self.config.lazy === true ) self.$form_edit.seedGform('destroy');
						self.$form_edit.seedGform({
							'lazy' : false,
							'url' : {
								'current' : href
							},
							'ajax': config.ajax,
							'dataType' : 'json',
							'func': {
								'ajax_success_callback' : function(gform, data) {
									if( self.config.debug ) console.info(data);
									
									self.updated = true;

									// если нет опредленного контекста для обновления данных в форме, то считаем что мы не перезагружаем её
									// поэтому и не убираем кнопки модального окна и не закрываем его автоматически
									
									console.log(gform);
									if( !gform.$context ) {
										modal.buttons({
											'Закрыть': function() {
												this.close();
											}
										});
										
										// если включена функция автозакрытия
										if( config.autoclose === true ) {
											setTimeout(function () {
												modal.close();
											}, 1500);
										}
									}
								}
							}
						});
					},
					'close' : function() {
						// после закрытия окна, обновляем список
						// обновляем список
						if( self.updated === true ) self.reload();
					}
				}				
			});
			return false;
		},
		
		// обрабатываем событие Remove, приватная функция
		_remove: function(obj) {
			var self = this;
			var $row = $(obj).parents(this.config.selector.item + ':first').addClass('warning');
			return this.remove(this._getHref(obj), this._getReload(obj), this._getTitle(obj));
		},

		// удаляем строку, впоследствии эту функцию можно переопределить вне класса
		remove: function (href, url, title) {
			var self = this;

			if (confirm('Удаляем навсегда?')) {
				$.post(href, {
					show: self.config.module.main,
					update: self.config.module.main,
					action:'remove',
					mime: 'txt',
					from:window.location.href
				}, function(data) { 
					self.reload(url);
				},"html");
			}
			else {
				self.$container.find(this.config.selector.item).removeClass('warning');
			}
			return false;
		},

		// перегрузить список в основном окне
		reload: function (url) {
			var self = this;
			if( this.$list.length ) {
				$.get( self.config.url.current, {'show': self.config.module.main, 'mime':'txt', 'cache': false}, function(data) {
					var ans = $('<div>').html(data);
					self.$container.html( ans.find(self.$container.selector).html() );
					$('.tooltip').remove();
					self.updated = false;
				});
			}
		},

		// получение урла для запроса
		_getHref: function(obj) {
			return $(obj).attr('href') || $(obj).parents(this.config.selector.item + ':first').attr('data-href'); 
		},
		
		// получение урла для обновления списка
		_getReload: function(obj) {
			return this.config.url.reload || $(obj).attr('data-config-url-reload'); 
		},
		
		// получение заголовка 
		_getTitle: function(obj) {
			return $(obj).attr('title') || $(obj).attr('data-title') || $(obj).parents(this.config.selector.item+':first').attr('data-title');
		},

		// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;
			$('body')
				.off('click touchend', this.config.selector.add)
				.on('click touchend', this.config.selector.add, function(e) {
					self._add(this); e.preventDefault();
				});

			$('body')
				.off('click touchend', this.config.selector.edit)
				.on('click touchend', this.config.selector.edit, function(e) {
					self._edit(this); e.preventDefault();
				});

			$('body')
				.off('click touchend', this.config.selector.remove)
				.on('click touchend', this.config.selector.remove, function(e) {
					self._remove(this); e.preventDefault();
				});				
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
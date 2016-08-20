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
				'item' : '[role="item"][data-ui], .item[data-ui]',
				'container' : '[role="container"][data-ui]',
				'addform' : '[role="form-add"][data-ui]',
				'editform' : '[role="form-edit"][data-ui]'
			},
			'autoclose' : true,
			'nested' : '',
			'remove_nested' : true,			
			'event' : {
				'__on' : null,
				'__off' : null
			},
			'url': {
				'current' : window.location.href,
				'add' : null,
				'post' : null,
				'reload' : window.location.href
			},
			'func' : {
				'open_add' : null,
				'open_edit' : null,
				'reload' : null
			},
			'module' : {
				'main' : null,
				'page' : null
			},
			'modal' : {
				'overlay' : true,
				'draggable' : false
			},
			'buttons' : {
				'add' : {
					'Сохранить': function() {
						$(this.ui.config.selector.addform, this.$content).submit();
					},
					'Отмена': function() {
						this.close();
					}
				},
				'edit' : {
					'Сохранить': function() {
						$(this.ui.config.selector.editform, this.$content).submit();
					},
					'Отмена': function() {
						this.close();
					}
				},
				'remove' : {
					'Удалить' : function() {
						var modal = this;
						$.post({
								url: modal.ui.options.url.post,
								data: modal.ui.formData,
								dataType: 'html',
								processData: false,
								contentType: false
							},
							function(data) { 
								$('.tooltip').remove();
								modal.ui.updated = false;
								modal.ui.reload(modal.ui.options);
								$(modal.ui.options.selector.item).removeClass('bg-warning warning');
								modal.close();
							}
						);
					},
					'Отмена' : function() {
						this.close();
					}
				}				
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
			this.fullname = this.name;
			if( this.config.uid ) this.fullname = this.name + this.config.uid;

			// обновляем селекторы конфига
			$.each(this.config.selector, function(name, selector) {
				if( selector ) self.config.selector[name] = selector.replace(/\[data-ui\]/g, '[data-ui="'+self.fullname+'"]');
			});
			
			// список
			this.$list = $(this.config.selector.list);
			
			// основной контейнер
			this.$container = $(this.config.selector.container);
			
			// булевой ключ проверки обновления списка
			this.updated = false;

			// проверяем есть ли нужные ID
			if(!this.config.module.main) this._error(this.config.module.main, 'module.main');
			if(!this.config.module.page) this._error(this.config.module.page, 'module.page');
	
			// проинициализируем форму добавления если она сейчас на странице
			if( $(this.config.selector.addform).length ) {
				$(this.config.selector.addform).each(function() {
					self.gform( $(this) );	
				});
			}

			// проинициализируем форму редактирования если она сейчас на странице
			if( $(this.config.selector.editform).length ) {
				$(this.config.selector.editform).each(function() {
					self.gform( $(this) );	
				});
			}
			
			this.bind();
		},

		// создание элемента
		add: function(obj) {
			var self = this;
			
			// обновим конфиг seed.ui для текущего запуска от кнопки
			var options = $.extend(true, {}, this.config, seed.core.fn._dataset(obj));
			if(!options.title) options.title = $(obj).attr('data-title') || $(obj).attr('title');
			
			// создаем модальное окно по кнопке
			this.$modal_add = $(obj).seedModal({
				'lazy' : false,
				'title' : options.title,
				'overlay' : options.modal.overlay,
				'draggable' : options.modal.draggable,
				'ajax' : options.ajax,
				'name' : 'add-'+self.name,
				'url' : {
					'ajax' : options.url.add
				},
				'module' : {
					'main' : options.module.main					
				},
				'cssclass' : {
					'dialog' : 'modal-add-'+self.name,
					'header' : 'modal-header-add-'+self.name
				},
				'buttons' : options.buttons.add,
				'func' : {
					'open' : function(modal) {
						modal.ui = self;
						self.modal = modal;

						// определим форму для добавления
						// используем seedGform - сначала уничтожаем предыдущую созданную форму, после инициализируем её снова
						self.$form_add = modal.$content.find(self.config.selector.addform);
						if( self.$form_add.attr('data-seed') == 'gform' && self.config.lazy === true ) self.$form_add.seedGform('destroy');
						self.gform(self.$form_add, options, modal);

						if( $.isFunction(options.func.open_add) ) config.func.open_add.call(self, options);
					},
					'close' : function() {
						// после закрытия окна
						// обновляем список
						if( self.updated === true ) self.reload(options);
					}
				}
			});
			return false;
		},

		// редактирование элемента
		edit: function (obj) {
			var self = this;

			var $item = $(obj).parents(this.config.selector.item + ':first');
			
			// обновим конфиг seed.ui для текущего запуска от кнопки
			var options = $.extend(true, {}, this.config, seed.core.fn._dataset(obj));
			if(!options.title) options.title = $item.attr('title') || $item.attr('data-title');
			
			// создаем модальное окно по кнопке
			this.$modal_edit = $(obj).seedModal({
				'lazy' : false,
				'title' : options.title,
				'overlay' : options.modal.overlay,
				'draggable' : options.modal.draggable,
				'ajax' : true,
				'url' : {
					'ajax' : options.url.post
				},
				'name' : 'edit-'+self.name,
				'module' : {
					'main' : options.module.main					
				},
				'cssclass' : {
					'dialog' : 'modal-edit-'+self.name,
					'header' : 'modal-header-edit-'+self.name
				},
				'buttons' : options.buttons.edit,
				'func' : {
					'open' : function(modal) {
						modal.ui = self;
						self.modal = modal;

						// определим форму редактирования
						// используем seedGform - сначала уничтожаем предыдущую созданную форму, после инициализируем её снова
						self.$form_edit = modal.$content.find(self.config.selector.editform)
						if( self.$form_edit.attr('data-seed') == 'gform' && self.config.lazy === true ) self.$form_edit.seedGform('destroy');
						self.gform(self.$form_edit, options, modal);
						
						if( $.isFunction(options.func.open_edit) ) config.func.open_edit.call(self, options);
					},
					'close' : function() {
						// после закрытия окна, обновляем список
						// обновляем список
						if( self.updated === true ) self.reload(options);
					}
				}				
			});
			
			return false;
		},
		
		// создаем форму для отправки
		gform: function(obj, options, modal) {
			var self = this;
		
			// обновим конфиг seed.ui для текущего запуска от формы
			var options = $.extend(true, {}, options, $.extend(true, {}, this.config, seed.core.fn._dataset(obj.get(0))));
			
			obj.seedGform({
				'lazy' : true,
				'url' : {
					'current' : options.url.current,
					'post' : options.url.post
				},
				'ajax': true,
				'dataType' : 'json',
				'func': {
					'ajax_success_callback' : function(gform, data) {
						if( self.config.debug ) console.info(data);
						
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
							if( options.autoclose === true ) {
								setTimeout(function () {
									modal.close();
								}, 1000);
							}
						}
						
//						console.log( self.name, config.url, self.config.url, seed.core.fn._dataset(obj) );
											
						if( $.isFunction(options.func.reload) ) options.func.reload.call(self, options);
					}
				}
			});		
		},
		
		// удаление элемента
		remove: function (obj) {
			var self = this;
			var $item = $(obj).parents(this.config.selector.item + ':first').addClass('bg-warning warning');
			
			// обновим конфиг seed.ui для текущего запуска от кнопки
			var options = $.extend(true, {}, this.config, seed.core.fn._dataset(obj));
			if(!options.title) options.title = $item.attr('title') || $item.attr('data-title');
			
			$(obj).seedModal({
				'lazy' : false,
				'title' : 'Подтверждение удаления',
				'overlay' : options.modal.overlay,
				'draggable' : options.modal.draggable,
				'name' : 'remove-'+self.name,
				'cssclass' : {
					'dialog' : 'modal-remove-'+self.name,
					'header' : 'modal-header-remove-'+self.name,
					'body': 'bg-error'
				},
				'html' : 'Вы действительно хотите удалить ' + options.title + '?',
				'buttons' : options.buttons.remove,
				'func' : {
					'open' : function(modal) {
						modal.ui = self;
						modal.ui.options = options;
						modal.ui.formData = new FormData();
						modal.ui.formData.append('from', window.location.href);
						modal.ui.formData.append('mime', 'txt');
						modal.ui.formData.append('show', self.config.module.main);
						modal.ui.formData.append('update', self.config.module.main);
						modal.ui.formData.append('action', 'remove');
					
						// если есть вложенные данные и разрешено их удаление
						if( options.nested.length && options.remove_nested == true) {
							if( /,/.test(options.nested) ) {
								$(options.nested.split(',')).each(function(i, j) {
									modal.ui.formData.append('allow_remove', j.trim() );
								});
							}
							else {
								modal.ui.formData.append('allow_remove', options.nested);
							}
						}
						
						$('.tooltip').remove();
					},
					'close' : function() {
						$item.removeClass('bg-warning warning');
					}
				}	
			})
			
			return false;
		},

		// перегрузить список в основном контейнере
		reload: function (options) {
			var self = this;

			// обновим конфиг seed.ui для текущего элемента
			//var options = $.extend(true, {}, this.config, seed.core.fn._dataset(obj));
			var url = options.url.reload || options.url.post;
			
			if( this.$list.length ) {
				$.get(url, {'show': options.module.main, 'mime':'txt', 'cache': false}, function(data) {
					var ans = $('<div>').html(data);
					self.$container.html( ans.find(self.$container.selector).html() );
					if( $.isFunction(options.func.reload) ) options.func.reload.call(self, options);
				});
			}
			else {
				if( $.isFunction(options.func.reload) ) options.func.reload.call(self, options);
			}
		},

		// получение урла для запроса
		_getHref: function(obj) {
			return $(obj).attr('href') || $(obj).parents(this.config.selector.item + ':first').attr('data-href'); 
		},
		
		// получение урла для обновления списка
		_getReload: function(obj) {
			return $(obj).attr('data-config-url-post') || $(obj).attr('data-config-url-reload') || this.config.url.reload; 
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
					self.add(this); e.preventDefault();
				});

			$('body')
				.off('click touchend', this.config.selector.edit)
				.on('click touchend', this.config.selector.edit, function(e) {
					self.edit(this); e.preventDefault();
				});

			$('body')
				.off('click touchend', this.config.selector.remove)
				.on('click touchend', this.config.selector.remove, function(e) {
					self.remove(this); e.preventDefault();
				});				
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
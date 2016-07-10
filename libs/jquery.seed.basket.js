/* 
* Seed Framework
* SeedBasket 
* ver. 1.1
* Kirill Ivanov
* create: 2015.06.26
*/

// предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты».
;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedBasket';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.1';
	$.seed[name]._inited = [];
	

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : false,
			'evented': false,

			'selector': {
				'auto': '[data-seed="basket"]',
				'status' : '[role="basket-status"]:first',  // селектор статус корзины
				'items' : '[role="basket-items"]',
				'clear' : '[role="basket-clear"]',
				'info' : '[role="basket-info"]' // селектор статуса заказа
			},
			'url': {
				'current' : window.location.href,
				'basket' : '/basket.html',
				'complete' : '/basket/event-submit.html',
				'status' : '/page_prototype.html'
			},
			'module': {
				'basket' : null,
				'status': null,
				'items': null
			},
			'func' : {
				'bind' : null, // функция дополнительных биндов для корзины
				'items' : null,
				'status': null,
				'info': null
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title',
					'module.basket': 'не задан ID модуля корзины подтверждения товаров',
					'module.items': 'не задан ID модуля для обновления товаров',
					'module.status': 'не задан ID модуля статуса корзины',
					'selector.items': 'не задан селектор для элемента списка добавленных элементов'

				},
				'interface' : {
					'basket_empty' : 'Для оформления заказа, добавьте товары в корзину',
					'confirm_clear' : 'Вы действительно хотите удалить все из корзины?',
					'confirm_remove' : 'Вы действительно хотите удалить товар?'
				}
			}
		},

		build: function() {
			var self = this;

			this.config.module.basket = this.$el.attr('data-module-basket') || this.config.module.basket || this._error(this.config.module.basket, 'module.basket');
			this.config.module.status = this.config.module.status || $(this.config.selector.status).attr('data-module-status')*1 || this._error(this.config.module.status, 'module.status');
			this.config.module.items = this.config.module.items || $(this.config.selector.items).attr('data-module-items')*1 || this._error(this.config.module.items, 'module.items');

			this.config.url.basket = this.$el.attr('data-basket-url') || this.config.url.basket || this.config.url.current;

			this.$form = this.$el.find('form:first');

			this.$items = this.$el.find(this.config.selector.items).find('> *');

			this.status();

			this.bind();

/*
			if( !this.$items.length ) {
				this.$form.html('');
				$('<div>', {'class':'alert alert-warning'}).text(this.config.locale.interface.basket_empty).appendTo( this.$form );
			}
			else {
			}
*/
		},

// функция биндов элементов
		bind: function() {
			var self = this;

// биндим кнопки удаления
			this.$button_remove = this.$el.on('click touchend', '[name="remove"]', function(e) {
				if (confirm(self.config.locale.interface.confirm_remove)) {
					self.remove = $(this).val() || $(this).parents('[data-item]:first').attr('data-item');
					self.update('remove');
				}					
				return false;
			});

// если определена общая кнопка удаления, биндим ее
			if( this.config.selector.clear ) {
				this.$el.on('click touchend', this.config.selector.clear, function() {
					if (confirm(self.config.locale.interface.confirm_clear)) {
						self.update('clear');
					}					
					return false;
				});
			}


// биндим инпуты количества
			this.$input_amount = this.$el.on('change', 'input[name^="basket_int_amount"]', function(e) {
				var button = $(this);
				clearTimeout(self.timer);
				self.timer = setTimeout(function() {
					clearTimeout(self.timer);
					if( button.val()=='' ) { button.val('1'); }
					self.update('amount');
				}, 500);
			});

			this.$el.on('input', 'input[name^="basket_int_amount"]', function(e) {
				clearTimeout(self.timer);
				if( /[^0-9]/.test($(this).val()) ) {
					$(this).val( $(this).val().replace(/([^0-9])/g,'') );
				}
				if( $(this).val()=='' ) {
					$(this).val('1');
				}
			});


// биндим элементы формы для сохранениея изменения при вводе любых данных
			this.$inputs_form = this.$el.on('change keyup', ':input:not(:submit,:file,[name^="basket_int_amount"])', function() {
				clearTimeout(self.timer);
				self.timer = setTimeout(function() {
					clearTimeout(self.timer);
					self.update('text');
				}, 500);
			});



// запускаем кастомную функцию биндов если она определена
			if( $.isFunction(this.config.func.bind) ) { (this.config.func.bind)(self); }
		},

// обновление элементов
		update: function(type) {
			var self = this;

			self.formdata = null;
			self.formdata = new FormData( this.$form.get(0) );
			self.formdata.append('encoding', 'utf-8');		// FormData работает только в utf-8, сервер может не знать 
			self.formdata.append('from', window.location.href);
			self.formdata.append('mime', 'txt');
			self.formdata.append('rand', Math.random());

			self.json = [];

			if( self.remove && type == 'remove' ) {
				self.formdata.append('action', 'remove');
				self.json = [{basket_uid_id: self.remove}];
			}
/*
			if( self.remove == 'all' ) {
				self.formdata.append('action', 'remove');
				self.$el.find('[data-item]').each(function(i) {
					var row = {};
      					row.basket_uid_id = $(this).attr('data-item');
					self.json.push(row);
				});
			}
*/
			else {
				self.$el.find('[data-item]').each(function(i) {
					var row = {};
      					row.basket_uid_id = $(this).attr('data-item');
				       	row.basket_int_amount1 = ( type == 'clear' ) ? 0 : $('[name="basket_int_amount1"]', this).val();
			       		row.basket_int_amount2 = ( type == 'clear' ) ? 0 : $('[name="basket_int_amount2"]', this).val();
				       	row.basket_int_amount3 = ( type == 'clear' ) ? 0 : $('[name="basket_int_amount3"]', this).val();
				       	row.basket_chr_name = $('[name="basket_chr_name"]', this).val();
					self.json.push(row);
				});
			}

			if( self.json.length > 0 ) {
				var json_data = JSON.stringify(self.json);
				self.formdata.append('json_data', json_data);
				self.formdata.append('update', self.config.module.items);
				self.formdata.append('show', self.config.module.items);

				$.ajax({
					url: this.config.url.current,
					type: "POST",
					data: self.formdata,
					processData: false,
					contentType: false,
					dataType: 'html',
					beforeSend: function() {
//создаем оверлэй, блокируем функционал
//						self.$overlay = $('<div>',{'id':'basket-overlay','class':'seed-overlay'}).prependTo( $('body') );
//						self.$loader = $('<div>',{'class':'loader'}).prependTo( self.$overlay );
//						self.blocked = true;
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
// если обновляем количество товаров или удаляем товары, то обновляем список элементов
							if( json_data && ( type == 'amount' || type == 'remove' )) {
								self.items();
// выполним кастомную функцию обновления
								if( self.config.func.update ) { (self.config.func.update)(); }
// обновляем информацию о заказе
								self.info();
								self.unblock();
							}
							else if ( type == 'clear' ) {
								window.location.reload(true);
							}
						}
					},
					error: function() {
						console.error(self._name+': Произошла неизвестная ошибка!');
						self.unblock();
					}
				});
			}

			self.remove = false;
			return false;
		},

// разблокируем функционал, удалим оверлей
		unblock: function() {
			self.remove = false;
			$('[role="tooltip"]').remove();
//			this.$overlay.remove();
			$('#basket-overlay').remove();
			this.blocked = false;
		},

// обновление списка товаров
		items: function() {
		        var self = this;

			var qs = {}
			qs['mime'] = 'txt';
			qs['show'] = this.config.module.items;

			$.ajax({
				url: self.config.url.basket,
				cache: false,
				data: $.param(qs),
				dataType: 'html',
				success: function(data) {
					$(self.config.selector.items).replaceWith(data);
					if( self.config.func.items ) { (self.config.func.items)(); }
				}
			});
		},

// обновление статуса корзины
		info: function() {
		        var self = this;

			var qs = {}
			qs['mime'] = 'txt';
			qs['event'] = 'info';
			qs['show'] = this.config.module.basket;

			$.ajax({
				url: self.config.url.basket,
				cache: false,
				data: $.param(qs),
				dataType: 'html',
				success: function(data) {
					$(self.config.selector.info).replaceWith(data);
// обновим статус корзины
					self.status();
					if( self.config.func.info ) { (self.config.func.info)(); }
				}
			});
		},

// обновление статуса корзины
		status: function() {
		        var self = this;

			var qs = {}
			qs['mime'] = 'txt';
			qs['show'] = this.config.module.status;

			$.ajax({
				url: self.config.url.status,
				cache: false,
				data: $.param(qs),
				dataType: 'html',
				success: function(data) {
					$(self.config.selector.status).replaceWith(data);
					if( self.config.func.status ) { (self.config.func.status)(); }
				}
			});
		}
	});

	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
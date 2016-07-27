/* 
* Seed Framework
* SeedBuy
* ver. 1.3
* Kirill Ivanov
* create: 2015.06.22
*/

// предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты».
;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedBuy';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.4';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'evented': true,

			'modal' : null,
			'trigger' : false,
			'overlay' : false,

			'module' : {
				'button' : null,
				'status' : null,
				'page' : null
			},

			'data' : {
				'amount1' : null,
				'amount2' : null,
				'price1' : null,
				'price2' : null,
				'image' : null,
				'synopsis' : null,
				'name' : null,
				'text' : null,
				'flag' : null
			},
			
			'url': {
				'basket' : '/basket.html',
				'button' : '/page_prototype.html',
				'status' : '/page_prototype.html'
			},

			'selector': {
				'auto' : '[role="button-buy-ajax"], [role="basket-button"]',
				'evented': '[role="button-buy"], [data-seed="buy"]',
				'status' : '[role="basket-status"]',  // селектор статус корзины
				'button' : '[role="button-buy-ajax"], [role="basket-button"]',
				'page' : null, // селектор кнопки на конечной странице
				'item' : null  // селектор элемента списка
			},

			'event' : {
				'__on' : 'click.seed.buy touchend.seed.buy',
				'on' : 'click.seed.buy touchend.seed.buy'
			},

			'func' : {
				'ready' : null,
				'update_status' : null,
				'success_add' : null,
				'success_remove' : null,
				'modal' : null
			},
			'locale' : {
				'error' : {
					'data-module': 'не задано имя',
					'data-member': 'не указан ID элемента для покупки',
					'title': 'не задан title',
					'href': 'не указана ссылка на страницу конечного товара в кнопке добавления',
					'module.status': 'не задан ID модуля статуса корзины',
					'module.page': 'не задан ID модуля конечной страницы элемента покупки (например: product.page)',
					'selector.status': 'не задан селектор для статуса корзины',
					'selector.item': 'не задан селектор для элемента списка покупаемых данных'
				},
				'interface' : {
					'buy_added' : 'Оформить',
					'buy_removed' : 'Добавить'
				}
			}
		},

		build: function() {
			var self = this;
			
			if( this.$el.hasClass('disabled') ) { return false; }

			this.config.selector.button = this.config.selector.button || null;
			this.config.selector.status = this.config.selector.status || this._error(this.config.selector.status, 'selector.status'); 

			this.config.module.status = this.config.module.status ||  $(this.config.selector.status).attr('data-module-status')*1 || this._error(this.config.module.status, 'module.status');
			this.config.module.button = this.config.module.button  || $(this.config.selector.button).attr('data-module-button')*1 || this._getAttr('data-module-button');

			this.config.module.page = this.config.module.page || $(this.config.selector.button).attr('data-module-page')*1 || this._error(this.config.module.page, 'module.page'); 
			
			if( this.$el.attr('data-buy-modal') == 'true' ) { this.config.modal = true; }
			if( this.$el.attr('data-buy-trigger') == 'true' ) { this.config.trigger = true; }
		
			if( this.config.modal ) {
				this.config.url.buy = this.$el.attr('href') || this.$el.attr('data-buy-url') || this._error(this.config.url.buy, 'href');
			}

			this.$title = this.$el.find('.title:first');

			this.event = 'buy';
			this._checking();

			if( this.config.modal && !this.$el.hasClass('active') ) {
				require('seed.modal', function() {
					self.addModal();
				});
			}
			else if( this._event ) {
				this.add();
			}
			
			return this;
		},

		bind: function(method) {
			var self = this;
			if( method == 'off' ) {
				this.$el.off( this.config.event.on +' '+ this.config.event._on).on(this.config.event.on, function(e) {
					self.$el.data(self._label)['add']();
					return false;
				});
			}
		},

		add: function() {
			var self = this;
			console.log('add');

			// если у нас параметр trigger false, то перекидываем юзера на страницу
			if( this.$el.hasClass('active') ) {
				if( !this.config.trigger ) {
					window.location.href = this.config.url.basket;
					return false;
				}
				else {
					this.event = 'remove';
				}
			}
			
			this.buyQS = {};
			this.buyQS['event'] = this.event;
			this.buyQS['mime'] = 'txt';
			this.buyQS['show'] = this.config.module.button;
			this.buyQS['module_parent'] = this.config.module.page;
			this.buyQS['member'] = this.$el.attr('data-buy') || this._getAttr('data-buy');

			this.params = {
				'price1' : this.config.data.price1 || this.$el.attr('data-price'),
				'price2' : this.config.data.price2 || this.$el.attr('data-price2'),
				'amount1' : this.config.data.amount1 || this.$el.parent().parent().find('input[name="amount"]:first, input[name="number"]:first').val() || this.$el.attr('data-amount') || 1,
				'amount2' : this.config.data.amount2 || this.$el.attr('data-amount2'),
				'synopsis' : this.config.data.synopsis || this.$el.attr('data-synopsis'),
				'image' : this.config.data.image || this.$el.attr('data-image'),
				'name' : this.config.data.name || this.$el.attr('data-name'),
				'text' : this.config.data.text || this.$el.attr('data-text'),
				'flag' : this.config.data.flag || this.$el.attr('data-flag') || 0
			};

			if( this._getData() ) {

				$.ajax({
					url: self.config.url.button,
					data: $.param(self.buyQS),
					cache: false,
					beforeSend: function() {
						self.blocked = true;
						self.$el.addClass('disabled');
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
							self.unblock();

							if( self.modalObj ) { self.close(); }
							else if( self.event == 'buy' ) { self.$el.addClass('active'); self.$title.text(self.config.locale.interface.buy_added); }
							else if( self.event == 'remove' ) { self.$el.removeClass('active'); self.$title.text(self.config.locale.interface.buy_removed); }

							if( self.event == 'buy' ) { self.event == 'remove'; }
							if( self.event == 'remove' ) { self.event == 'buy'; }

							self.bind('off');

							if( self.config.func.success_add ) { (self.config.func.success_add)(self, data); }

							self.status();
						}
					},
					error: function() {
						console.error(self._name+': Произошла неизвестная ошибка!');
						self.unblock();
					}
				});
			}
			else {
				self.bind('off');
			}
			return false;
		},

		addModal: function() {
		        var self = this;
			var qs = {};
			qs['mime'] = 'txt';
			qs['buy'] = 'modal';
			qs['show'] = this.config.module.page;

			$.ajax({
				url: this.config.url.buy,
				data: $.param(qs),
				cache: false,
				beforeSend: function() {
					self.blocked = true;
					self.$el.addClass('disabled');
				},
				success: function(data) {
					self.unblock();
					self.modal(data);
				}
			});
		},

		unblock: function() {
			this.blocked = false;
			this.$el.removeClass('disabled');
		},

		_getData: function() {
			var self = this;
			var valid = true;
			$.each(this.params, function(i, func) {

				if( $.isFunction(func) ) {
					var value = (func)(self);
					if( value !== false ) {
						self.buyQS[i+'_'+self.buyQS.member] = value;
					}
					else {
						valid = false;
						return false;
					}
				}
				else if( func ) { self.buyQS[i+'_'+self.buyQS.member] = func; }
			});
			return valid;
		},

		modal: function(data) {
			var self = this;
		
			var obj = {};

			this.modalObj = obj;
			obj.$holder = (this.config.selector.item) ? this.$el.parents(this.config.selector.item+':first') : null;
			obj.$data = $('<div>').html(data);

			obj.$data.seedModal({
				'dynamic' : false,
				'title' : self.$el.attr('title'),
				'func' : {
					'callback_close': function() {
						self.status();
						self._destroy();
					}
				},
				'selector': {
					'holder' : obj.$holder
				},
				'overlay' : self.config.overlay
			});

			if( $.isFunction(this.config.func.modal) ) { (this.config.func.modal)(self) }
		},

		close: function() {
			this.modalObj.loaded.remove();
			this.modalObj.modal.remove();
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
					self.check();
					if( self.config.func.update_status ) { (self.config.func.update_status)(); }
				}
			});
		},

		//проверим купленные товары и отметим их при загрузке страницы
		check: function() {
	        var self = this;

			$(this.config.selector.status).find('[data-uid]').each(function(i, el) {
				var button = self._$list.add(self.config.selector.evented).filter('[data-buy="'+$(el).data('uid')+'"]').not('.active');

				if( self.config.func.success_buy ) {
					(self.config.success_buy)(self, button);
				}
				else {
					button.addClass('active');
					button.find('.title:first').text(self.config.locale.interface.buy_added);
				}
			});
		},

		_checking: function() {
			var self = this;
			
			if( window.MutationObserver && seed.lazy ) {
				$(self.config.selector.evented).seedLazy(function() {
					self.check();
				});
			}
			else {
				setInterval(function() {
					self.check();
				}, 2000);
			}
		}
	});

	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
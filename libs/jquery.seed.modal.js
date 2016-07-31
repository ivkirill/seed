/* 
 * Seed Framework
 * seedModal 
 * ver. 1.2
 * Kirill Ivanov
 * create: 2015.07.13
 */

;(function($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	}

	// данные для конструктора
	var name = 'seedModal';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.2';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'evented': false,

			'title': null,
			'html': null,
			'width': null,
			'overlay': false,
			'ajax': false,
			'name': '',
			'draggable': true,

			'module': {
				'main': null,
				'func': false
			},
			'selector': {
				'auto': '[data-seed="modal"]',
				'evented': '[data-modal-html], [data-modal-url]',
				'holder': null
			},
			'event': {
				'__on': 'click.seed.modal touchend.seed.modal',
				'on': 'click.seed.modal touchend.seed.modal'
			},
			'url': {
				'current': window.location.href,
				'ajax': null
			},

			'func': {
				'open': null,
				'position': null,
				'close': null
			},

			'cssclass': {
				'modal': '',
				'dialog': '',
				'close': 'fa fa-close',
				'content': '',
				'header': '',
				'body': '',
				'button': 'btn btn-default',
				'group': 'btn-group'
			},
			'locale': {
				'error': {
					'data-name': 'не задано имя',
					'title': 'не задан title',
					'html': 'нет контента',
					'url.ajax': 'не задан URL запроса'
				},
				'interface': {
					'close': ''
				}
			}
		},

		build: function() {
			var self = this;

			this.type = 'html';
			this.config.overlay = this.$el.attr('data-modal-overlay') || this.config.overlay;

			if (this.config.overlay) {
				this.$overlay = (!$('#overlay-modal').length) ? $('<div>', {
					'id': 'overlay-modal',
					'class': 'seed-overlay'
				}).html('<div class="loader"></div>').prependTo($('body')) : $('#overlay-modal:first').show();
			}

			// определяем имя модального окна, если задано
			if (this.$el.attr('data-modal-name')) {
				this.config.name = this.$el.attr('data-modal-name') || '';
			}

			// если holder не задан
			if (!this.config.selector.holder) {
				this.$holder = $('body');
				$('body').addClass('modal-holder');
			} else {
				this.$holder = $(this.config.selector.holder);
			}

			this.$modal = $('<div>', {
				'id': 'modal-box',
				'class': 'modal ' + this.config.cssclass.modal
			}).hide().appendTo(this.$holder.addClass('modal-holder'));
			this.$dialog = $('<div>', {
				'class': 'modal-dialog effect-modal on ' + this.config.cssclass.dialog
			}).addClass('modal-' + this.config.name).appendTo(this.$modal);

			// применим ширину если она задана
			if (this.config.width) {
				this.$dialog.css('width', this.config.width);
			}

			// Обьект контента окна
			this.$content = $('<div>', {
				'class': 'modal-content'
			}).appendTo(this.$dialog);

			// Обьект хедера окна
			this.$header = $('<div>', {
				'class': 'modal-header ' + this.config.cssclass.header
			}).appendTo(this.$content);

			// Обьект заголовка
			this.$caption = $('<div>', {
				'class': 'modal-title'
			}).appendTo(this.$header);

			// Обьект статуса, используется в Seed UI
			this.$status = $('<div>', {
				'class': 'modal-status'
			}).insertAfter(this.$caption);

			// Кнопка закрытия
			this.$close = $('<button>', {
				'type': 'button',
				'data-dismiss': 'modal',
				'class': 'btn close modal-close'
			}).html('<span class="' + self.config.cssclass.close + '">' + self.config.locale.interface.close + '</span>').appendTo(this.$header);

			this.$body = $('<div>', {
				'class': 'modal-body ' + this.config.cssclass.body
			}).appendTo(this.$content);
			this.$footer = $('<div>', {
				'class': 'modal-footer'
			}).appendTo(this.$content);

			if (this.config.buttons) {
				this.$buttons = $('<div>', {
					'class': 'modal-buttons'
				}).appendTo(this.$footer);
				this.buttons();
			}

			this.$html = (this.config.html) ? this.config.html : this.$el.html();

			if (this.$el.attr('data-modal-html')) {
				this.$html = $('[name="' + this.$el.attr('data-modal-html') + '"]').clone().html();
			} else if (this.$el.attr('data-modal-ajax') || this.$el.attr('data-modal-url') || this.config.ajax === true || this.config.url.ajax) {
				this.type = 'ajax';
				this.config.ajax = true;
				this.config.url.ajax = this.config.url.ajax || this.$el.attr('data-modal-ajax') || this.$el.attr('data-modal-url') || this._error(this.config.url.ajax, 'url.ajax');
				this.config.module.main = this.config.module.main || this.$el.attr('data-module') || this.$el.attr('data-module-main') || false;
			}

			if (this.config.debug) console.log(this);

			this._getContent();

			this.bind();
		},

		// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			this.$close.on('click touchend', function() {
				self.close();
				return false;
			});

			// биндим функцию при ресайзе окна
			$(window).on('resize.seed.modal', function() {
				if (self) {
					self.setHeight();
				}
			});

			// биндим кнопки клавиатуры для перелистывания и закрытия
			$(document).off('keydown.seed.modal').on('keyup.seed.modal', function(e) {
				if (e.which == 27) {
					self.close();
				}
			});
		},

		// закрытие окна
		close: function() {
		    var self = this;
			if ($.isFunction(this.config.func.close)) {
				(this.config.func.close)(self);
			}

			if (this.config.overlay) this.$overlay.remove();

			this.$holder.removeClass('modal-holder');
			$('body').removeClass('modal-holder');

			$('.tooltip').remove();
			this.$modal.remove();
			this._destroy();
		},

		// установить высоту для контента окна
		setHeight: function() {
			var height = parseInt(this.$dialog.css('margin-bottom')) + parseInt(this.$dialog.css('margin-top')) + parseInt(this.$body.css('padding-bottom')) + parseInt(this.$body.css('padding-bottom')) + parseInt(this.$header.height()) + parseInt(this.$footer.height());

			this.$body.css('max-height', $('body').height() - height);
		},

		setContent: function(html) {
			var self = this;

			this.$html = $('<div>', {
				'class': 'modal-html ' + this.config.cssclass.content
			}).html(html);

			this.$html.appendTo(this.$body, {
				'dynamic': false
			});

			var $source = this.$body.find('.h1:first, h1:first');

			this.$caption.text(this.config.title || this.$el.attr('title') || $source.text());

			$source.remove();

			this.$modal.css('display', 'block');
			this.position();
			this.setHeight();

			if (this.config.draggable === true) {
				this.$dialog.draggable({
					handle: self.$header
				});
				this.$header.addClass('draggable');
			}

			$('.tooltip').remove();

			if ($.isFunction(this.config.func.open)) this.config.func.open.call(self, self);
		},

		_getContent: function() {
			var self = this;
			if (this.type == 'ajax' && this.config.url.ajax) {

				var qs = {};
				qs['mime'] = 'txt';
				if (this.config.module.main) qs['show'] = this.config.module.main;

				if (this.config.debug) {
					console.log(this.config.url.ajax, qs);
				}

				$.ajax({
					url: self.config.url.ajax,
					data: $.param(qs),
					type: 'GET',
					dataType: 'html',
					async: false,
					cache: false,
					statusCode: {
						404: function() {
							console.error(self._name + 'error: ' + '404 page not found!');
						},
						503: function() {
							console.error(self._name + 'error: ' + '503 service unavailable!');
						}
					},
					success: function(data, textStatus, jqXHR) {
						if (jqXHR.status == 200) {
							self.setContent(data);
						}
					},
					error: function() {
						console.error(self._name + 'error: ' + 'unknown error!');
					}
				});
			} else {
				this.setContent(this.$html);
			}
		},

		position: function() {
			var self = this;
			if ($.isFunction(this.config.func.position)) {
				(this.config.func.position)(self);
			}
		},

		buttons: function(buttons) {
			var self = this;
			this.$buttons.html('');

			$.each(buttons || this.config.buttons, function(title, obj) {
				if ($.type(obj) === 'function') {
					self._createButton(title, obj);
				} else if ($.type(obj) === 'object') {
					var cell = self._createButton(title, obj);

					if ($.type(obj.items) === 'object') {
						cell.$button.attr({
							'data-seed': 'dropdown',
							'data-dropdown-area': self.config.name
						});

						var $dropdown = $('<ul>', {
							'class': 'dropdown dropdown-menu dropup',
							'role': 'drop',
							'area-labelledby': self.config.name
						}).appendTo(cell.$group);

						$.each(obj.items, function(title) {
							self._createButton(title, this, $dropdown);
						});
					}
				}
			});
		},

		_createButton: function(title, obj, $parent) {
			var self = this;

			// определяем надпись кнопки
			var caption = obj.caption || title;

			// создаем кнопку
			var $group = $(($parent) ? '<li>' : '<label>').addClass(self.config.cssclass.group);
			var $button = $(($parent) ? '<a>' : '<button>').html(caption).addClass(self.config.cssclass.button).appendTo($group);

			var cell = {
				$group: $group,
				$button: $button
			};

			// добавляем класс
			if ($.type(obj) === 'object' && obj.cssclass) $group.addClass(obj.cssclass);

			// вставляем кнопку в DOM
			($parent) ? $group.appendTo($parent): $group.appendTo(self.$buttons);

			// биндим функции
			if ($.type(obj) === 'function') this._bindButton($button, 'click touchend', obj);
			else if ($.type(obj.func) === 'object') {
				$.each(obj.func, function(type, func) {
					self._bindButton($button, type, func);
				});
			}

			// выполняем callback-функцию
			if ($.isFunction(obj.callback)) obj.callback.call(obj, self);

			return cell;
		},

		_bindButton: function($button, type, func) {
			var self = this;
			$button.on(type, function() {
				func.apply(self, self.$modal);
			});
		}

	});
	new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
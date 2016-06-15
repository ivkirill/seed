/* 
* Seed Framework
* seedModal 
* ver. 1.2
* Kirill Ivanov
* create: 2015.07.13
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedModal';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.2';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented': false,

			'title' : null,

			'html' : null,

			'width': null,

			'overlay' : false,

			'ajax' : false,

			'name' : '',

			'module' : {
				'main' : null,
				'func': false
			},

			'selector': {
				'auto' : '[data-seed="modal"]',
				'evented' : '[data-modal-html], [data-modal-url]',
				'holder' : null
			},
			'event' : {
				'__on' : 'click.seed.modal touchend.seed.modal',
				'on' : 'click.seed.modal touchend.seed.modal'
			},
			'url': {
				'current' : window.location.href,
				'ajax' : null
			},

			'func' : {
				'open' : null,
				'position' : null,
				'close' : null
			},
			'cssclass' : {
				'modal' : '',
				'close' : 'fa fa-close',
				'content' : '',
				'button' : 'btn btn-default'
			},
			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title',
					'html' : 'нет контента',
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

			if( this.config.overlay ) {
				this.$overlay = ( !$('#overlay-modal').length ) ? $('<div>', {'id':'overlay-modal', 'class':'seed-overlay'}).html('<div class="loader"></div>').prependTo( $('body'), {'dymanic':false}) : $('#overlay-modal:first').show();
			}

// определяем имя модального окна, если задано
			if( this.$el.attr('data-modal-name') ) {
				this.config.name = this.$el.attr('data-modal-name') || '';
			}


// если holder не задан
			if( !this.config.selector.holder ) {
				this.$holder = $('body');
				$('body').addClass('modal-holder');
			}
			else {
				this.$holder = $(this.config.selector.holder);
			}

			this.$modal = $('<div>',{'id':'modal-box', 'class': 'modal '+ this.config.cssclass.modal }).hide().appendTo( this.$holder.addClass('modal-holder'), {'dymanic':false});
			this.$dialog = $('<div>',{'class':'modal-dialog effect-modal on'}).addClass('modal-'+this.config.name).appendTo( this.$modal, {'dymanic':false});

// применим ширину если она задана
			if( this.config.width) {
				this.$dialog.css('width',this.config.width);
			}

			this.$content = $('<div>',{'class':'modal-content'}).appendTo( this.$dialog, {'dymanic':false});
			this.$header = $('<div>',{'class':'modal-header'}).appendTo( this.$content, {'dymanic':false});
			this.$caption = $('<div>',{'class':'modal-title'}).appendTo( this.$header, {'dymanic':false});

			this.$close = $('<button>',{'type':'button', 'data-dismiss':'modal', 'class':'btn close modal-close'}).html('<span class="'+ self.config.cssclass.close +'">'+ self.config.locale.interface.close +'</span>').appendTo( this.$header, {'dymanic':false});
		
			this.$body = $('<div>',{'class':'modal-body'}).appendTo(this.$content, {'dymanic':false});
			this.$footer = $('<div>',{'class':'modal-footer'}).appendTo(this.$content, {'dymanic':false});

			if( this.config.buttons ) {
				this.$buttons = $('<div>',{'class':'modal-buttons'}).appendTo(this.$footer, {'dymanic':false});
				this.buttons();
			}

			this.$html = this.$el.html();

			if( this.$el.attr('data-modal-html') ) {
				this.$html = $('[name="'+ this.$el.attr('data-modal-html') +'"]').clone().html();
			}
			else if( this.$el.attr('data-modal-ajax') || this.$el.attr('data-modal-url') || this.config.ajax == true || this.config.url.ajax ) {
				this.type = 'ajax';
				this.config.ajax = true;
				this.config.url.ajax =  this.$el.attr('data-modal-ajax') || this.$el.attr('data-modal-url') || this.config.url.ajax || this._error(this.config.url.ajax, 'url.ajax');
				this.config.module.main =  this.$el.attr('data-module') || this.$el.attr('data-module-main') || this.config.module.main || false;
			}

			if( this.config.debug ) {
				console.log( this );
			}

			this._getContent();


			this.bind();

//			this.reinit();
		},

// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			this.$close.on('click touchend', function() { self.close(); return false; });

// биндим функцию при ресайзе окна
			$(window).on('resize.seed.modal', function() {
				if(self) {
					self.setHeight();
				}
			});

// биндим кнопки клавиатуры для перелистывания и закрытия
			$(document).off('keydown.seed.modal').on('keyup.seed.modal', function(e) {
				if ( e.which == 27 ) {
					self.close();
				} 
			});                                                         
		},

// закрытие окна
		close: function() {
			if( this.config.overlay ) { this.$overlay.remove(); }

//			$('body').removeClass('modal-open');

			this.$holder.removeClass('modal-holder');
			$('body').removeClass('modal-holder');

			if( $.isFunction(this.config.func.close) ) {
				(this.config.func.close)(self);
			}

			this.$modal.remove();
			this._destroy();
		},

// установить высоту для контента окна
		setHeight: function() {
		      var height = parseInt(this.$dialog.css('margin-bottom'))
		                 + parseInt(this.$dialog.css('margin-top')) 
	                	 + parseInt(this.$body.css('padding-bottom')) 
        		         + parseInt(this.$body.css('padding-bottom')) 
		                 + parseInt(this.$header.height()) 
                		 + parseInt(this.$footer.height());

			this.$body.css('max-height', $('body').height() - height );
		},

		setContent: function(html) {
			var self = this;

//			this.$html = $(html)
			this.$html = $('<div>', {'class':'modal-html '+ this.config.cssclass.content}).html(html);

			this.$html.appendTo( this.$body, { 'dynamic':false });

			var $source = this.$body.find('.h1:first, h1:first'); 

			this.$caption.text( this.config.title || this.$el.attr('title') || $source.text() );

			$source.remove();

			this.$modal.css('display','block');
			this.position();
			this.setHeight();

			this.$dialog.draggable({handle:self.$header});
			this.$header.addClass('draggable');

			if( this.config.func.open ) {
				(this.config.func.open)(self);
			}

//			$('body').addClass('modal-open');
		},

		_getContent: function( callback ) {
			var self = this;
			if( this.type == 'ajax' && this.config.url.ajax ) {

				var qs = {};
				qs['mime'] = 'txt';
				qs['show'] = this.config.module.main;

				if( this.config.debug ) { console.log(this.config.url.ajax, qs); }

				$.ajax({
					url: self.config.url.ajax,
					data: $.param(qs),
					type: 'GET',
					dataType: 'html',
					async: false,
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
							self.setContent( data );
						}
					},
					error: function() {
						console.error(self._name+'error: '+'unknown error!');
					}
				});
			}
			else {
       				this.setContent( this.$html );
			}
		},

		position: function() {
			var self = this;
			if( $.isFunction(this.config.func.position) ) {
				(this.config.func.position)(self);
			}
//				this.win.css('top', ( (self.box.height() - self.win.height())/2 > 40 ) ? ( (self.box.height() - self.win.height())/2 ) : 40);
		},

		buttons : function() {
			var self = this;
			this.$buttons.html('');
			$.each( this.config.buttons, function(title, func) {
				var $button = $('<button>').text(title).addClass( self.config.cssclass.button ).appendTo( self.$buttons, {'dymanic':false});
				$button.on('click touchend', function() {
					func.apply(self);
					return false;
				});
			});
		}

	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
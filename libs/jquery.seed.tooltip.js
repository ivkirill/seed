/* 
* Seed Framework
* seedTooltip
* ver. 1.3
* Kirill Ivanov
* create: 2015.05.27
* update: 2015.06.15
* TODO: учесть горизонтальный скроллинг для отображения подсказки
*/

;(function ($, seed, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedTooltip';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.3';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'evented': true,

			'attribute' : 'title',
			'side' : 'bottom',

			'type' : 'text',

			'cssclass' : {
				'tooltip' : ''
			},

			'offset' : 0,

			'selector': {
				'auto' : null,
				'evented' : '[data-error], [data-seed="tooltip"]'
			},
			'event' : {
				/* 				
				'__on' : ('ontouchstart' in document.documentElement) ? 'touchstart.seed.tooltip focus.seed.tooltip' : 'mouseenter.seed.tooltip focus.seed.tooltip',
				'__off': ('ontouchstart' in document.documentElement) ? 'touchend.seed.tooltip blur.seed.tooltip' : 'mouseleave.seed.tooltip blur.seed.tooltip',
				'on' : ('ontouchstart' in document.documentElement) ? 'touchstart.seed.tooltip focus.seed.tooltip' : 'mouseenter.seed.tooltip focus.seed.tooltip',
				'off' : ('ontouchstart' in document.documentElement) ? 'touchend.seed.tooltip blur.seed.tooltip' : 'mouseleave.seed.tooltip blur.seed.tooltip'
				*/
				'__on' : 'mouseenter.seed.tooltip focus.seed.tooltip',
				'__off': 'mouseleave.seed.tooltip blur.seed.tooltip',
				'on' : 'mouseenter.seed.tooltip focus.seed.tooltip',
				'off' : 'mouseleave.seed.tooltip blur.seed.tooltip'
			},
			'func' : {
				'ready' : null,
				'show' : null,
				'hide' : null
			},
			'locale' : {
				'error' : {
					'no_content' : 'нет нужного контента для подсказки'
				}
			}
		},

		build: function() {
			var self = this;

			if( this.id ) { return false; }

			this.css = {
				top: 0,
				left: 0,
				visibility: 'hidden',
				display: 'block'
			};

			this.id = 'tooltip-' + Date.now();

			this.$tip = $('<div>',{'class':'tooltip '+this.config.cssclass.tooltip, 'role':'tooltip'}).css(this.css).appendTo( $('body') );
			this.$arrow = $('<div>',{'class':'tooltip-arrow'}).prependTo( this.$tip);
			this.$inner = $('<div>',{'class':'tooltip-inner'}).appendTo( this.$tip);

			this.$tip.attr('id', this.id);
			this.$el.attr('data-tooltip-id', this.id);

			this.title = this.$el.attr(this.config.attribute) || '';
			this.error = this.$el.attr('data-error') || '';

			this.type = this.config.type;

			if( this.$el.attr('data-tooltip-image') || this.type == 'image' ) { this.type = 'image'; this.image = this.$el.attr('data-tooltip-image') || this.type;  }
			if( this.$el.attr('data-tooltip-html') || this.type == 'html' ) { this.type = 'html'; this.html = $('[name="'+ this.$el.attr('data-tooltip-html') +'"]').clone().html() || this.type; }
			if( this.$el.attr('data-tooltip-ajax') || this.type == 'ajax' ) { this.type= 'ajax'; this.url = this.$el.attr('data-tooltip-ajax') || this.type; }

			this.side = this.$el.attr('data-tooltip-side') || this.config.side;

			this.$el.removeAttr('title');
			
			this._getContent( function() { self.complete() } );

			this.bind();
		},


		bind: function() {
			var self = this;
			this.$el.off(this.config.event.off).off(this.config.event.__off).on(this.config.event.off, function(e) {
				self.destroy();
				return false;
			});
		},

		complete: function(html) {
			this._try = 0;
			if( this._setContent() ) {
				this._getPosition()._setPosition();
				this.$tip.css(this.css).css({visibility: 'visible'}).addClass('fade in');
				this.$el.data['tooltip-inited'] = true;

				if( this.config.func.show ) {
					(this.config.func.show)(this);
				}

			}
		},

		_getContent: function( callback ) {
			var self = this;
			if( this.type == 'image') {
				this.$img = $('<img>',{'src': this.image}).on('load', function() {
					self.$img.attr({'width':parseInt(this.naturalWidth), 'height':parseInt(this.naturalHeight)});
					self.$tip.addClass('image');
					self.$inner.attr({'width':parseInt(this.naturalWidth), 'height':parseInt(this.naturalHeight)});
					(callback)();
				});
			}
			else if( this.type == 'ajax' && this.url ) {
				$.ajax({
					url: self.url,
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
							self.$inner.html(data);
							(callback)();
						}
					},
					error: function() {
						console.error(self._name+'error: '+'unknown error!');
					}
				});
			}
			else {
				(callback)();
			}
		},

		_setContent: function() {
			var self = this;
			if( this.type == 'text' && ( this.title || this.error )) {
				if(this.error.length) { this.$inner.html('<span class="text-danger">'+this.error+'</span><br>'+ this.title); }
				else { this.$inner.html(this.title); }
			}
			else if( this.type == 'image' && this.image ) {
				this.$inner.html( self.$img );
			}
			else if( this.type == 'html' && this.html ) {
				this.$inner.html( this.html );
			}
			else if( this.type == 'ajax' && this.url ) {
			
			}                                 
			else {
//				console.error( this.config.locale.error.no_content, this.$el, this);
				return false;
			}
			
			return this;
		},

		_setPosition: function() {
			this.$tip.removeClass('left right top bottom').addClass( this.side );

			if( this.side == 'right' ) {
				this.css.top = this.pos.top - this.pos.$tip.height/2 + this.pos.$el.height/2;
				this.css.left = this.pos.left + this.pos.$el.width + this.pos.$arrow.width + this.config.offset;
			}

			else if( this.side == 'left' ) {
				this.css.top = this.pos.top - this.pos.$tip.height/2 + this.pos.$el.height/2;
				this.css.left = this.pos.left - this.pos.$arrow.width*2 - this.pos.$tip.width + this.config.offset;
			}
			else if( this.side == 'top' ) {
				this.css.top = this.pos.top - this.pos.$tip.height - this.pos.$arrow.height*2 + this.config.offset;
				this.css.left = this.pos.left - this.pos.$tip.width/2 + this.pos.$el.width/2;
			}
			else if( this.side == 'bottom' ) {
				this.css.top = this.pos.top + this.pos.$el.height + this.pos.$arrow.height + this.config.offset;
				this.css.left = this.pos.left - this.pos.$tip.width/2 + this.pos.$el.width/2;
			}

			return this._checkPosition();
		},

		_checkPosition: function() {
			if( this._try <= 4 ) {
				if ( this.css.top < this.config.offset  + $(document).scrollTop()  ) {
//					console.log('верхние углы подсказки выше допусков');
					this._try++;

					this.side = 'right';
					return this._setPosition();
				}
				else if ( this.css.left < this.config.offset + $(document).scrollLeft() ) {
//					console.log('левые углы подсказки левее допусков', this.css.left, this.config.offset);
					this._try++;

					this.side = 'top';
					return this._setPosition();
				}
				else if ( this.css.left > $(document).width() - this.config.offset - this.pos.$tip.width ) {
//					console.log('правые углы подсказки правее допусков');
					this._try++;

					this.side = 'bottom';
					return this._setPosition();
				}
				else if ( this.css.top > $(document).height() + $(document).scrollTop() - this.config.offset - this.pos.$tip.height) {
//					console.log('нижные углы подсказки ниже допусков');
					this._try++;

					this.side = 'left';
					return this._setPosition();
				}
				else {
					return this;
				}
			}
			else {
				return this;
			}
		},

		_getPosition: function() {
			var self = this;
			this.pos = $.extend({}, self.$el.offset(), {
				$el: {
					width : self.$el.width() + parseInt( self.$el.css('padding-left') ) + parseInt( self.$el.css('padding-right') ) + parseInt( self.$el.css('border-left-width') ) + parseInt( self.$el.css('border-right-width') ),
					height : self.$el.height() + parseInt( self.$el.css('padding-top') ) + parseInt( self.$el.css('padding-bottom') ) + parseInt( self.$el.css('border-top-width') ) + parseInt( self.$el.css('border-bottom-width') )
				},
				$tip : {
					width: self.$tip.outerWidth() + parseInt( self.$tip.css('padding-left') ) + parseInt( self.$tip.css('padding-right') ) + parseInt( self.$tip.css('border-left-width') ) + parseInt( self.$tip.css('border-right-width') ), 
					height: self.$tip[0].offsetHeight + parseInt( self.$tip.css('padding-top') ) + parseInt( self.$tip.css('padding-bottom') ) + parseInt( self.$tip.css('border-top-width') ) + parseInt( self.$tip.css('border-bottom-width') )
				},                                                    	
				$arrow : {
					width: self.$arrow.width() + parseInt( self.$arrow.css('padding-left') ) + parseInt( self.$arrow.css('padding-right') ) + parseInt( self.$arrow.css('border-left-width') ) + parseInt( self.$arrow.css('border-right-width') ),
					height: self.$arrow.height() + parseInt( self.$arrow.css('padding-top') ) + parseInt( self.$arrow.css('padding-bottom') ) + parseInt( self.$arrow.css('border-top-width') ) + parseInt( self.$arrow.css('border-bottom-width') )
				},
				offset : this.config.offset,
				boxing : {}
			});
			return this;
		},
		
		destroy: function() {
			if( this.config.func.hide ) {
				(this.config.func.hide)(this);
			}

			this.$el.off(this.config.event.off).off(this.config.event.__off);

			$('#'+this.id).remove();
			this.$el.attr({'title': this.title });
			this._destroy();
		}
	});

	
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, seed, window, document);
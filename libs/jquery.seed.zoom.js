/* 
* Seed Framework
* seedZoomer
* ver. 1.0
* Kirill Ivanov
* create: 2015.10.08
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedZoom';

	$.seed[name] = {};
	$.seed[name].VERSION  = '1.0';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented' : true,

			'width' : 300,
			'height' : 300,

			'tint' : false,

			'side' : 'right',

			'module' : {
				'main' : null,
				'function': false
			},

			'selector': {
				'auto' : null,
				'evented' : '[data-seed="zoom"]'
			},

			'cssclass' : {
				'wrapper' : '',
				'win' : '',
				'pointer' : ''
			},
			'event' : {
				'on' : 'mouseenter.seed.zoom touchstart.seed.zoom',
				'__on' : 'mouseenter.seed.zoom touchstart.seed.zoom'
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
					'title': 'не задан title'
				}
			}
		},

		build: function() {
			var self = this;
// определяем исходное изображение
			this.config.image = this.config.image || this.$el.attr('data-zoom-image') || this.$el.attr('src');

// определяем размеры окна зума
			this.config.imageWidth = this.config.imageWidth || this.$el.attr('data-zoom-image-width') || this.$el.width();
			this.config.imageHeight = this.config.imageHeight || this.$el.attr('data-zoom-image-height') || this.$el.height();

// определяем размеры элемента зумирования
			this.config.width = this.$el.attr('data-zoom-width') || this.config.width;
			this.config.height = this.$el.attr('data-zoom-height') || this.config.height;

// определим сторону отображения окна зума
			this.config.side = this.$el.attr('data-zoom-side') || this.config.side;

// определим использование затенения
			this.config.tint = this.$el.attr('data-zoom-tint') || this.config.tint;


// создаем общий контейнер обертку
			this.$wrapper = $('<div>', {'class':'zoom-wrapper '+ this.config.cssclass.wrapper}).css({
				'position' : 'relative'

			}).insertAfter( this.$el, {'dymanic':false});

// создаем контейнер для элемента зумирования
			this.$container = $('<div>', {'class':'zoom-container'}).css({
				'width' : this.config.imageWidth,
				'height' : this.config.imageHeight
			}).appendTo( this.$wrapper, {'dymanic':false});

// перемещаем элемент зумирования в контейнер
			this.$el.css({
				'position' : 'absolute',
				'z-index' : 0
			}).appendTo( this.$container, {'dymanic':false})

// создаем элемент указатель зума
			this.$pointer = $('<div>', {'class':'zoom-pointer ' + this.config.cssclass.pointer + ((this.config.tint) ? 'zoom-tint' : '') }).appendTo( this.$container, {'dymanic':false});

			if( this.config.debug ) {
				this.$pointer.css({'border-top-color' : 'rgba(255,255,0,0.5)', 'border-bottom-color' : 'rgba(255,255,0,0.5)', 'border-left-color' : 'rgba(255,0,0,0.5)', 'border-right-color' : 'rgba(255,0,0,0.5)'});
			}
// создаем окно зума
			this.$win = $('<div>', {'class':'zoom-win '+ this.config.cssclass.win}).css({
				'width' : this.config.width + 'px',
				'height' : this.config.height + 'px'
//				'left' : this.config.imageWidth,
//				'top' : 0
			}).appendTo( this.$wrapper, {'dymanic':false});

//создаем оверлэй                                                                                                                          
			this.$overlay = $('<div>',{'id':'overlay-zoom','class':'seed-overlay'}).prependTo( self.$win, {'dymanic':false});
			this.$loader = $('<div>',{'class':'loader'}).prependTo( this.$overlay, {'dymanic':false});


			switch(this.config.side) {
				case 'inside': {
					this.$win.css({
						'left' : 0,
						'top' : 0
					});
					break;
				}
				case 'top': {
					this.$win.css({
						'left' : 0,
						'top' : -this.config.height + 'px'
					});
					break;
				}
				case 'bottom': {
					this.$win.css({
						'left' : 0,
						'top' : this.config.imageHeight + 'px'
					});
					break;
				}
				case 'left': {
					this.$win.css({
						'left' : -this.config.width + 'px',
						'top' : 0
					});
					break;
				}
				default : {
					this.$win.css({
						'left' : this.config.imageWidth + 'px',
						'top' : 0
					});
					break;
				}
			}

// создаем исходное изображение внутри окна зума
			this.$image = $('<img>', {'class':'zoom-image', 'src': this.config.image}).css('display','none').on('load', function() {
				self.config.naturalWidth = parseInt(this.naturalWidth);
				self.config.naturalHeight = parseInt(this.naturalHeight);
	
				self.$image.attr({
					'width' : self.config.naturalWidth,
					'height' : self.config.naturalHeight
				});
				self.$overlay.css('display','none');

				self.ratio();
			}).prependTo( this.$win, {'dymanic':false});


// если дебаг включен, то создаем элемент логирования координат
			if( this.config.debug ) {
				this.$logger = $('<div>', {'class':'zoom-logger'}).css({'position' : 'fixed', 'top' : '0', 'left' : '0', 'right' : '0', 'padding' : '10px', 'height' : '50px', 'color' : '#fff', 'background-color' : '#000'}).appendTo( $('body'), {'dymanic':false});
			}

//			this.hide();
			this.bind();
		},

// создаем бинды для элементов библиотеки
		bind: function() {
			var self = this;

			this.$pointer.on({
				'mousemove': function(e) {
					if( self.pos ) { self.move(e); }
				}
			});

			this.$container.on({
				'mouseenter' : function(e) {
					self.show();
					return false;
				},
				'mouseleave touchend' : function(e) {
					self.hide();
					return false;
				},
				'touchstart' : function(e) {
					self.show();
					if( self.pos ) { self.move(e); }
					return false;
				},
				'touchmove': function(e) {
					if( self.pos ) { self.move(e); }
				}
			});
		},

		show: function(e) {
			this.$win.css('display','block');
			this.$pointer.css('display','block');
		},

		hide: function() {
			this.$win.css('display','none');
			this.$pointer.css('display','none');
		},

		move: function(e) {
			var self = this;
// отступ элемента зуммирования относительно страницы
			var offset = this.$pointer.offset();

// получим координаты курсора мыши или touch евента
			this.pos.left = ( e.pageX || e.originalEvent.touches[0].pageX || e.originalEvent.changedTouches[0].pageX );
			this.pos.top = ( e.pageY || e.originalEvent.touches[0].pageY || e.originalEvent.changedTouches[0].pageY );

// console.log(this.pos.left, this.pos.top);

// текущие положения мыши относительно элемента зуммирования, e.offset не корректно работает с Firefox
			this.pos.x = this.pos.left - offset.left;
			this.pos.y = this.pos.top - offset.top;

			this.pos.px = Math.max(Math.min(this.pos.x, this.pos.xmax), 0);
			this.pos.py = Math.max(Math.min(this.pos.y, this.pos.ymax), 0);

			this.$pointer.css({
				'border-top-width' : Math.max(this.pos.py - this.pos.ymin, 0) + 'px',
				'border-right-width' : this.pos.xmax - this.pos.xmin + 'px',
				'border-bottom-width' : this.pos.ymax - this.pos.ymin + 'px',
				'border-left-width' : Math.max(this.pos.px - this.pos.xmin, 0) + 'px',
				'display' : 'block'
			});

			this.pos.ix = Math.max(Math.min(this.pos.x-this.pos.xmin, this.pos.xmax-this.pos.xmin), 0) / this.ratioX;
			this.pos.iy = Math.max(Math.min(this.pos.y-this.pos.ymin, this.pos.ymax-this.pos.ymin*this.ratio), 0) / this.ratioY;

			this.$image.css({
				left: -Math.min(this.pos.ix, this.pos.xNmax),
				top: -Math.min(this.pos.iy, this.pos.yNmax)
			});

// окно следует за курсором. если отображение внутри
			if( this.config.side == 'inside' ) {
				this.$win.css({
					left: self.pos.x - Math.round(self.config.width/2),
					top: self.pos.y - Math.round(self.config.height/2)
				});
			}

			if( this.config.debug ) {
				this.$logger.text( this.pos.ix + ', '+ this.pos.iy + ', ' + this.ratioX + ', ' + this.ratioY )
			}
		},
	
// определим отношение видимой части к общему размеру фотографии
		ratio: function() {
			var self = this;

// найдем отношения длин сторон элемента зуммирования и исходного изображения
			this.ratioX = this.config.imageWidth / this.config.naturalWidth;
			this.ratioY = this.config.imageHeight / this.config.naturalHeight;

// найдем наименьший размер
			this.ratio = Math.min( this.ratioX, this.ratioY );

// определем размеры для элемента указателя
			this.config.pointerWidth = this.config.width * this.ratio;
			this.config.pointerHeight = this.config.height * this.ratio;

// создадим обьект с координатами
			this.pos = {
				xmin: Math.round(self.config.pointerWidth/2),
				xmax: Math.round(self.config.imageWidth - self.config.pointerWidth/2),
				xNmax: Math.round(self.config.naturalWidth - self.config.width),

				ymin: Math.round(self.config.pointerHeight/2),
				ymax: Math.round(self.config.imageHeight - self.config.pointerHeight/2),
				yNmax: Math.round(self.config.naturalHeight - self.config.height)
			}

// отобразим изображение
			this.$image.css({
				'display' : 'block'
			});

// установим размеры элемента указателя и отобразим его
			this.$pointer.css({
				'width' : self.config.pointerWidth + 'px',
				'height' : self.config.pointerHeight + 'px',
				'display' : 'block'
			});

// если у стартого евента существуют координаты, то запустим метод move
			this.move( this._event );
		}		
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
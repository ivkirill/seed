/* 
* Seed Framework
* Gallery 
* ver. 1.3
* Kirill Ivanov
* create: 2015.06.18
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

	// данные для конструктора
	var name = 'seedGallery';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.3';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'evented': true,

			'thumbs': false,
			'carousel' : false,

			'thumb_width' : 48,
			'thumb_height' : 48,
			'thumb_group' : 1,

			'zoom': true,
			'mesh': 250,
			'group' : 'default',

			'interface_in' : {
				'close' : false,
				'areas' : false,
				'arrow' : false,
				'slideshow' : false,
				'carousel' : false,
				'text' : false,
				'title' : false
			},

			'fullscreen' : false,
			'slideshow' : false,
			'time' : 5000,

			'offset' : {
				'top' : 260,
				'left' : 200
			},
			
			'refresh' : true, // обнуляем элемент this.gallery, чтобы пересобрать все элементы со страницы с нуля

			'video_icon': false,
			'video_width' : 560,
			'video_height' : 360,

			'animation': false,
			'animation_time' : 300,
			'selector': {
				'auto' : null,
				'evented' : '[data-seed="gallery"]'
			},
			'event' : {
				'__on' : 'click.seed.gallery',
				'on' : 'click.seed.gallery'
			},
			'func' : {
				'ready' : null,
				'create' : null,
				'close' : null,
				'obj3d' : null,
				'next' : null,
				'prev' : null
			},
			'cssclass' : {
				'close' : 'fa fa-close'
			},
			'locale' : {
				'error' : {
				},
				'interface' : {
					'next': '›',
					'prev': '‹',
					'close': '', //&#10005;
					'play': '',
					'pause': '',
					'zoom': 'Клик левой кнопкой мыши для увеличения изображения',
					'zoomed': 'Клик левой кнопкой мыши для уменьшения изображения',
					'slideshowstart': 'Начать слайдшоу',
					'slideshowstop': 'Остановить слайдшоу'
				}
			}
		},

		build: function() {
			var self = this;
			this.loaded = false;

			this.zoom = false;
			this.zoomed = false;
			this.name = '';
			this.text = '';
			this.ready = true;
			this.timer;


			if( this.config.fullscreen ) {
				this.$fullscreen = ( $('.fullscreen').length ) ? $('.fullscreen:first') : $('<div>',{'class':'fullscreen'}).prependTo( $('body'));
				this.$fullscreen.requestFullScreen();
				this.fullscreen = true;
			}

			if( this.config.carousel && typeof $.seed.seedCarousel != 'object' ) { this.config.carousel = false; }
			this.config.slideshow = this.$el.attr('data-slideshow') || this.config.slideshow;

			if( this._$list.length == 0 ) {
				this._$list = $(this._$list.selector);
			}

			if( this.config.refresh === true ) {
		        	this.gallery = null;
				this._$list = $(this._$list.selector);
			}

			if( !this.gallery ) {
				this.gallery = {};
				this.group = this.$el.attr('data-group') || this.$el.attr('data-config-group') || self.config.group;

				this._$temp = (this.group === 'default') ? this._$list : this._$list.filter('[data-group="'+this.group+'"], [data-config-group="'+this.group+'"]');
				
				// сортировка для элементов, с принудительной индексацией
				if( this._$temp.filter('[data-config-index]').length ) {
					this._$temp = this._$temp.filter('[data-config-index]').sort(function(a, b) {
						return $(a).attr('data-config-index') - $(b).attr('data-config-index');
					});
				}
				
				this._$temp.each(function(i, img) {
				    var $el = $(img);
					self.group = $el.attr('data-group') || self.$el.attr('data-config-group') || self.config.group;

					if( !self.gallery[self.group] ) { self.gallery[self.group] = []; }
					var index = self.gallery[self.group].length;

					//console.log(index, i, $el.attr('data-config-index'));
					
					self.gallery[self.group][index] = {};
					self.gallery[self.group][index].el = $el;
					self.gallery[self.group][index].src = $el.attr('href') || $el.attr('data-src') || '';

					self.gallery[self.group][index].video = $el.attr('data-video') || false;

					if( self.gallery[self.group][index].video && !/^http/.test(self.gallery[self.group][index].video) ) {
						self.gallery[self.group][index].video = 'https://' + self.gallery[self.group][index].video.trim();
					}

					self.gallery[self.group][index].mp4 = $el.attr('data-mp4');
					self.gallery[self.group][index].webm = $el.attr('data-webm');
					self.gallery[self.group][index].ogv = $el.attr('data-ogv');

					self.gallery[self.group][index].height = $el.attr('data-height') || $el.attr('height');
					self.gallery[self.group][index].width = $el.attr('data-width') || $el.attr('width')

					self.gallery[self.group][index].name = $el.attr('data-name') || $el.attr('title');
					self.gallery[self.group][index].text = ( $('[name="'+$el.attr('data-text')+'"]').length ) ? $('[name="'+$el.attr('data-text')+'"]') : $el.attr('data-text') || '';
					self.gallery[self.group][index].type = 'img';

					if( $el.hasClass('obj3d') ) { self.gallery[self.group][index].type = 'obj3d'; }

					if( $el.hasClass('gallery-video') || $el.attr('data-video') ) { self.gallery[self.group][index].type = 'video'; }

					if(  self.gallery[self.group][index].type == 'video' && /youtu/.test(self.gallery[self.group][index].video) && self.gallery[self.group][index].src == '' ) {
						if( /embed/.test(self.gallery[self.group][index].video) ) {
							self.gallery[self.group][index].src = /(embed\/)([^?]+)/.exec(self.gallery[self.group][index].video)[2] +'/sddefault.jpg'; 
							self.gallery[self.group][index].src = 'https://i.ytimg.com/vi/'+ self.gallery[self.group][index].src;
						}
						else if( /v=/.test(self.gallery[self.group][index].video) ) {
							self.gallery[self.group][index].src = /(be\/|v=)([^?]+)/.exec(self.gallery[self.group][index].video)[2] +'/sddefault.jpg'; 
							self.gallery[self.group][index].src = 'https://i.ytimg.com/vi/'+ self.gallery[self.group][index].src;
						}
						
					}

					if( self.gallery[self.group][index].video && /youtu/.test(self.gallery[self.group][index].video) ) {
						var src = self.gallery[self.group][index].video.replace('watch?v=','embed/').replace('.be','be.com/embed');
						src = ( /\?/.test(src) ) ? src.replace(/$/,'&fs=0') : src.replace(/$/,'?fs=0');
						self.gallery[self.group][index].video = src;
					}

				});
			}

			this.group = this.$el.attr('data-group') || this.$el.attr('data-config-group') || self.config.group;

			//console.log(this);
			
			// находим текущий активный элемент
			$(this.gallery[this.group]).each(function(j,v) {
				if( v ) {
					if ( v.el[0] === self.el ) { self.current = j; }
				}
			});
			
			if( !this.current ) { this.current = 0; }
			this.type = this.gallery[this.group][this.current].type;

			this.typecur = this.type;
			this.typeprev = this.type;

			if( this.config.debug ) { console.log(this); }
			this._create();
		},

		//функция создания лайтбокса
		_create: function(self) {
			var self = self || this;
			var callback = function() {

				//записываем тип текущего элемента
				self.typecur = self.gallery[self.group][self.current].type;
				
				//проверяем создан ли лайтбокс, если нет, то создаем его
				if( !self.$holder || !$('.seed-overlay').length ) {

					//Скрываем обьекты которые могут мешать отображенияю
					$('embed, object').css({'visibility': 'hidden'});
					$('body').addClass('gallery-active');
					$('.tooltip').remove();

					//создаем оверлэй                                                                                                                          
					self.$overlay = $('<div>',{'id':'overlay-gallery','class':'seed-overlay'}).prependTo( (self.$fullscreen || $('body') ));
					self.$loader = $('<div>',{'class':'loader'}).prependTo( self.$overlay);

					//создаем лайтбокс
					self.$holder = $('<div>',{'id': 'modal-gallery'}).insertAfter( self.$overlay);
					self.$box = $('<div>',{'id':'gallery-box'}).appendTo( self.$holder);

					self.$area = $('<div>',{'id':'gallery-area'}).appendTo( self.$box);

					if( self.config.slideshow ) {
						self.$controls = $('<div>',{'id': 'gallery-controls'}).appendTo( (( self.config.interface_in.slideshow ) ? self.$area : self.$box));
						self.$play = $('<button>',{'id': 'gallery-play','class':'active'}).attr({'title': self.config.locale.interface.slideshowstart}).html('<span>'+ self.config.locale.interface.play +'</span>').appendTo( self.$controls);
						self.$pause = $('<button>',{'id': 'gallery-pause'}).attr({'title': self.config.locale.interface.slideshowstop}).html('<span>'+ self.config.locale.interface.pause +'</span>').appendTo( self.$controls);
					}
						
					self.$closeleft = $('<div>',{'id':'gallery-close-left','class':'gallery-close-area'}).appendTo( ( ( self.config.interface_in.areas ) ? self.$area : self.$box ));
					self.$closeright = $('<div>',{'id':'gallery-close-right','class':'gallery-close-area'}).appendTo( ( ( self.config.interface_in.areas ) ? self.$area : self.$box));
					self.$close = $('<button>',{'id':'gallery-close'}).html('<span class="'+ self.config.cssclass.close +'">'+ self.config.locale.interface.close +'</span>').appendTo( ( ( self.config.interface_in.close ) ? self.$area : self.$box));

					self.$next = $('<button>',{'id':'gallery-next','class':'gallery-arrow'}).html('<span>'+ self.config.locale.interface.next +'</span>').appendTo( ( ( self.config.interface_in.arrow ) ? self.$area : self.$box));
					self.$prev = $('<button>',{'id':'gallery-prev','class':'gallery-arrow'}).html('<span>'+ self.config.locale.interface.prev +'</span>').appendTo( ( ( self.config.interface_in.arrow ) ? self.$area : self.$box));

					if(!self.gallery[self.group].length > 1) {
						self.$next.hide();
						self.$prev.hide();
					}

					// генерация превью
					if(self.config.thumbs) { self._thumbs(); }

					self.$photo = $('<div>', {'id':'gallery-photo'}).appendTo( self.$area);

					// вставляем описание
					self.$title = $('<div>', {'id': 'gallery-title'}).html( self.name ).appendTo( ( ( self.config.interface_in.title ) ? self.$area : self.$holder));
					self.$text = $('<div>', {'id': 'gallery-text'}).html( self.text ).appendTo( ( ( self.config.interface_in.text ) ? self.$area : self.$holder));

					//сама фотография
					if( self.typecur == 'img' ) { 
						self.img = $('<img>',{'src': self.src})
						.css({'width':self.x,'height':self.y})
						.attr({'title': (self.config.zoom) ? self.config.locale.interface.zoom : ''})
						.appendTo( self.$photo );
					}

					// если текущий тип не img
					if( self.typecur == 'video' ) {
						self.img = self._videoBox();
						self._videoSource();
					}

					// запускаем функцию биндов
					self.bind();
					//анимированное показываем фотографию
					self._animate();

					//console.log(self);

					if( $.isFunction(self.config.func.create) ) {
						( self.config.func.create )(self);
					}
				}
				else {
					if(self.typeprev == 'video' ) { 
						self.img1 = self.$videobox;
					}
					else if (self.typeprev == 'obj3d') {
						self.config.func.obj3d(self);
					}
					else {
						self.img1 = self.$photo.find('img:first');
					}

					if(self.typecur == 'video') {
						self.img2 = self._videoBox('hide');
						self._videoSource();
					}
					else {
						self.img2 = $('<img>', {'src': self.src}).attr({'width':self.x,'height':self.y}).css({'opacity':0,'display':'none'}).appendTo( self.$photo);
					}

					if( self.config.animation ) {
						self.img1.animate({opacity: '0'}, self.config.animation_time, function() {
							if(self.$thumbs) {
								self.$thumbs.find('a').removeClass('active');
								self.scrollto = self.$thumbs.find('a[data-index="'+ self.current +'"]').addClass('active');
								self._scroll();
							}
	
							self._animate(function(){
								self.$overlay.addClass('animate');

								self.img1.remove();
								self.$photo.find('> *:not(:last)').remove();

								self.$title.html(self.name);
								self.$text.html( ( self.text.length ) ? self.text.html() : self.text );
								self.img2.show().stop().animate({opacity: '1'}, self.config.animation_time, function() {
									if(self.typeprev == 'video' && self.typecur == 'img') { self.$videobox.remove(); }
									self.typeprev = self.gallery[self.group][self.current].type;
									self.$overlay.removeClass('animate');
        								self.ready = true;
								});
							});
						});
					}
					else {
						self.img1.remove();
						self._animate(function(){
							self.$overlay.addClass('animate');

							self.$photo.find('> *:not(:last)').remove();

							self.$title.html(self.name);
							self.$text.html(self.text);

							self.img2.stop().show().css({'opacity':1}).show();

							if(self.typeprev == 'video' && self.typecur == 'img') { self.$videobox.remove(); }
							self.typeprev = self.gallery[self.group][self.current].type;
							self.$overlay.removeClass('animate');

							self.ready = true;
						});

						if(self.config.thumbs) {
							self.$thumbs.find('a').removeClass('active');
							self.scrollto = self.$thumbs.find('a[data-index="'+ self.current +'"]').addClass('active');
							self._scroll();
						}
					}
				}
			}

			//получим размеры, а после вызовем callback определенный выше
			this._getSizes(callback);
		},

		// бинды
		bind: function() {
			var self = this;

			// биндим кнопки закрытия
			this.$close.on('click', function() { self.close(); return false; });
			this.$closeleft.on('click', function() { self.close(); return false; });
			this.$closeright.on('click', function() { self.close(); return false; });

			// биндим кнопки следующих и предыдущих фотографий, а также области закрытия лайтбокса
			this.$next.on('click', function(e) {
				e.stopPropagation();
				self._findNext()._create();
				if( self.config.thumbs && self.config.carousel ) {
					self.carousel.data('seed.carousel').$next.click();
				}

				if( $.isFunction(self.config.func.next) ) {
					( self.config.func.next )(self);
				}
			});
			this.$prev.on('click', function(e) {
				e.stopPropagation();
				self._findPrev()._create();
				if( self.config.thumbs && self.config.carousel ) {
					self.carousel.data('seed.carousel').$next.click();
				}

				if( $.isFunction(self.config.func.prev) ) {
					( self.config.func.prev )(self);
				}
			});

			if( this.config.slideshow ) {
				this.$play.on('click', function() {
					self.$play.removeClass('active');
					self.$pause.addClass('active');
					self.autoplay = true;
					self.slideShow();
					return false;
				});

				this.$pause.on('click', function() {
					self.$play.addClass('active');
					self.$pause.removeClass('active');
					self.autoplay = false;
					self.slideShow();
					return false;
				});
			}

			// биндим функцию при ресайзе окна
			$(window).on('resize.seed.gallery', function() {
				if(self) {
					self._getSizes();
					self.win = true;
					self._animate();
				}
			});

			// биндим кнопки клавиатуры для перелистывания и закрытия
			$(document).off('keydown.seed.gallery').on('keyup.seed.gallery', function(e) {
				if ( e.which == 39 ) { self.$next.click(); }
				if ( e.which == 37 ) { self.$prev.click(); } 
				if ( e.which == 27 ) {
					if( self.config.fullscreen && self.fullscreen ) {
						self.$fullscreen.cancelFullScreen();
						self.fullscreen = false;
						return false;
					}
					else {
						(self.zoomed) ? self._zoom() : self.close();
					}
				} 
			});                                                         

			//биндим функцию зума
			if(this.config.zoom) {
				this.$box.on('click', function() {
					if( self.$box.hasClass('zoom') ) { self._setSizes(); self._zoom(); }
				});
			}
		},

		// определяем размеры изображения
		_getSizes: function(callback) {
			var self = this;
			var img = this.gallery[this.group][this.current];

			if( img.width && img.height ) {
				self._setSizes();
				if(callback) { (callback)() }
			}
			else if( img.type == 'img' ) {
				$('<img>').attr('src', self.gallery[self.group][self.current].src).on('load', function() {
					self.gallery[self.group][self.current].width = parseInt(this.naturalWidth);
					self.gallery[self.group][self.current].height = parseInt(this.naturalHeight);
					self._setSizes();
					if(callback) { (callback)() }
				});
			}
			else if( img.type == 'video' ) {
				if( this.config.debug ) { console.log(self.gallery[self.group][self.current]); }
				img.width = this.config.video_width;
				img.height = this.config.video_height;
				self._setSizes();
				if(callback) { (callback)() }
			}
		},

		// расчитываем и устанавливаем новые размеры для изображения
		_setSizes: function() {
			var xCont = Math.max(Math.max(document.documentElement.clientWidth, window.innerWidth || 500) - this.config.offset.left, 300);
			var yCont = Math.max(Math.max(document.documentElement.clientHeight, window.innerHeight || 480) - this.config.offset.top, 280);

			var img = this.gallery[this.group][this.current], xImg = img.width, yImg = img.height;

			var xNew = xImg, yNew = yImg;
			this.zx = xNew; this.zy = yNew;

			if (xImg > xCont || yImg > yCont) {
				if (xImg>yImg) {
					xNew = xCont; yNew = yImg*xNew/xImg;
					if (yNew > yCont) { yNew = yCont; xNew = xImg*yNew/yImg; }
				}
				else {  			
					yNew = yCont; xNew = xImg*yNew/yImg;
					if(xNew > xCont) { xNew = xCont; yNew = yImg*xNew/xImg;	}
				}       			
			}

			xNew = Math.round(xNew); yNew = Math.round(yNew);
			this.x = xNew; this.y = yNew;

			// расчет с привязкой к сетке
			this.ix = this.config.mesh + this.config.mesh * Math.round(xNew/this.config.mesh);
			this.iy = 0;

			this.zoom = (( xImg > this.x || yImg > this.y) && this.config.zoom ) ? true : false;

			this.src = (this.zoomed) ? img.src.replace(/\/tn\d+x\d+/,'') : img.src.replace(/(.*)/,'/tn'+ this.ix +'x'+ this.iy+'$1'); 

			this.name = img.name;
			this.text = img.text;
	
			return this;
		},

		// находим предыдущий элемент
		_findPrev: function() {
			(this.current == 0) ? this.current = this.gallery[this.group].length-1 : this.current = parseInt(this.current)-1;
			return this;             
		},
		// находим следующий элемент
		_findNext: function() {
			(this.current == this.gallery[this.group].length-1) ? this.current = 0 : this.current = parseInt(this.current)+1;
			return this;
		},
		// создаем контейнер для видео
		_videoBox: function(hide) {
			this.$videobox = $('<div>', {'class': 'gallery-video', 'id': 'gallery-video'}).attr({'width':this.x,'height':this.y}).appendTo( this.$photo);
			this.$videobox.css({'width':0,'height':0, opacity: (!hide) ? 1 : 0 });
			return this.$videobox;
		},

		// находим видео	
		_videoSource: function() {

			var img_video = this.gallery[this.group][this.current];
			// если есть атрибут video, значит это плеер хостинга
			if( img_video.video ) {
				var $video = $('<iframe>',{'src': img_video.video, 'frameborder':0, 'allowfullscreen':true, 'webkitallowfullscreen':true, 'mozallowfullscreen' :true, width:this.x, height:this.y}).attr({'width':this.x,'height':this.y}).css({'width':this.x,'height':this.y}).appendTo( this.$videobox);
			}
			// если есть атрибуты mp4, webm, ogv значит это HTML5video
			if( img_video.mp4 || img_video.webm || img_video.ogv ) {
				var $video = $('<video>', {'poster': img_video.src, 'preload':'none', 'controls':true, 'width':this.x, 'height':this.y}).addClass('video-js vjs-default-skin').appendTo( this.$videobox);
				$('<source>',{'src': img_video.mp4, 'type':'video/mp4'}).appendTo( $video);
				$('<source>',{'src': img_video.webm, 'type':'video/webm'}).appendTo( $video);
				$('<source>',{'src': img_video.ogv, 'type':'video/ogv'}).appendTo( $video);
			}
		},

		_zoom: function() {
			if(this.type != 'img') { return false; }
			if(this.zoomed) {
				this.zoomed = false;
				$('html, body').removeClass('zoomed');

				this.$box.removeClass('zoomed zoomed-x zoomed-y');
				this.$photo.find('img').attr({'title': this.config.locale.interface.zoom});
			}
			else {
				this.zoomed = true;
				$('html,body').addClass('zoomed');
				var classes = 'zoomed ';

				if( $('body').width() < this.zx ) { classes += ' zoomed-x'; }
				if( $('body').height() < this.zy ) { classes += ' zoomed-y'; }
				this.$box.addClass(classes)
				this.$photo.find('img').attr({'title': this.config.locale.interface.zoomed});
			}
			this._animate();
		},

		_animate: function(callback) {
			var self = this;
			(this.zoom) ? this.$box.addClass('zoom') : this.$box.removeClass('zoom');

			if(this.win && this.typecur == 'img') { this.$photo.find('img').attr({'src': this.src}); }
				
			this.$area.add(this.$photo.find('img')).stop().animate({ width: (self.zoomed) ? self.zx : self.x, height: (self.zoomed) ? self.zy : self.y }, 200, function() {
	                        if( self.typecur == 'img' ) {
					var imgzoomed = (self.zoomed) ? self.$photo.find('img:first') : self.$photo.find('img:last');
					imgzoomed.attr('src', imgzoomed.attr('src').replace(/\/tn\d+x\d+(.*)/, '/tn'+ ( (self.zoomed) ? self.zx : self.ix )  +'x'+ ( (self.zoomed) ? self.zy : self.iy ) +'$1')  );
				}
			});
			this.$holder.stop().animate({ top: 0, left: 0 },  200, function() { if(callback) (callback)() }).show();
		},

		// список превью
		_thumbs: function() {
			var self = this;

			// функция генерации превью изображений
			this.$thumbs = $('<div>',{'id':'gallery-thumbs'});

			// определим куда встроить в DOM 
			( self.config.interface_in.carousel ) ? this.$thumbs.appendTo(self.$area) : this.$thumbs.prependTo(self.$holder);

			if( this.config.carousel ) {
				this._createList();
				this.carousel =  this.$thumbs.seedCarousel({
					'autoplay': false,
					'animation':'slide',
					'dynamic': false,
					'group' : self.config.thumb_group,
					'locale' : {
						'interface' : {
							'next' : self.config.locale.interface.next,
							'prev' : self.config.locale.interface.prev
						}
					}
				});
			}
			else {
				self.$row = $('<div>',{'class':'gallery-thumbs-list row start-xs nowrap-xs'}).appendTo(self.$thumbs);
				this._createList();
			}

			// прикрутим скроллинг
			self.scrollto = self.$thumbs.find('a[data-index="'+self.current+'"]');
			self._scroll();

		},

		// создаем список превью изображений
		_createList: function() {
			var self = this;

			$.each(this.gallery[self.group], function(i,v) {
				var index = i;
				var $a = $('<a>').attr('data-index',i);

				if( self.config.carousel ) { $a.appendTo(self.$thumbs); }

				else { var $thumb = $('<div>', {'class':'col'}).appendTo( self.$row); $a.appendTo($thumb); }

				var $img = $('<img>', { 'src': ((v.type == 'video') ? (v.src || '/tn0x'+ self.config.thumb_height +self.config.video_icon) : ('/tn'+ self.config.thumb_width +'x' + self.config.thumb_height + v.src)), 'height':self.config.thumb_height, 'data-index': i }).appendTo($a);

				if( self.current == index ) { $a.addClass('active'); }

				$a.on({
					'click touchend' : function() {
						if(self.current != $a.attr('data-index')) {
							self.current = $a.attr('data-index');
							self.$thumbs.find('a').removeClass('active');
							$a.addClass('active');
							self._create();
						}
						return false;
					},
					'hover' : function() {
						$(this).toggleClass('hover');
					}
				});
			});
		},

		_scroll: function() {
			var self = this;

			var pos =  {
				thumbs: {
					left: self.$thumbs.offset().left,
					width: self.$thumbs.width()
				},
				active: {
					left: self.scrollto.offset().left,
					width: self.scrollto.width() + parseInt( self.scrollto.css('padding-left') ) + parseInt( self.scrollto.css('padding-right') )
				}
			};
			
			var delta = pos.thumbs.width + pos.thumbs.left - pos.active.left - pos.active.width - self.$thumbs.scrollLeft();

			if( delta <= 0 ) { self.$thumbs.scrollLeft( self.$thumbs.scrollLeft() + Math.abs(delta) ); }
			else { self.$thumbs.scrollLeft(0); }
		},

		// фунция слайдшоу
		slideShow: function() {
			var self = this;
			if(self.autoplay == true) {
				clearInterval(self.timer);
				delete self.timer;

				self.$next.click();
				self.timer = setInterval(function(){
					if(!self.timer) { return false; }
					self.$next.click()
				}, self.config.time );
			}
			else {
				clearInterval(self.timer);
				delete self.timer;
			}
		},
		
		// установим текущий аквтиный элемент самиы
		setCurrent: function(num){
			this.current = num;
			return this;
		},	

		close: function() {

			var self = this;

			if( this.config.fullscreen ) {
				this.$fullscreen.cancelFullScreen();
			}

			$('body').removeClass('gallery-active');

			this.$holder.remove();

			this.$overlay.fadeOut(function() {
				self.$overlay.remove();
				self.$el.removeData(name.replace('seed','seed.'));

				$('html,body').removeClass('zoomed zoomed-hld');
				$('embed, object').css({'visibility' : 'visible'});

				// снимаем бинды с глобальных элементов
				$(window).off('resize.seed.gallery');
				$(document).off('keydown.seed.gallery, keyup.seed.gallery')

			});
			
			if( $.isFunction(self.config.func.close) ) {
				( self.config.func.close )(self);
			}			

			this._destroy();
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
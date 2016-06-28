/* 
* Seed Framework
* seedCarousel 
* ver. 3.0
* Kirill Ivanov
* create: 2015.06.15
* update: 2015.06.15
*/

/* предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты». */
;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

/* данные для конструктора */
	var name = 'seedCarousel';

	$.seed[name] = {};
	$.seed[name].VERSION = '3.0';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented': false,

			'autoplay' : true,
			'hover_stop' : false,
			'cycle' : true,

			'animation': 'fade',
			'animation_time' : 300,
			'animation_element' : 'img', /* 'background' - спецзначение параметра означение что изображение передается как CSS параметр верхнего элемента списка. */

			'easing' : 'swing',
			'easing_plugin' : ( $.easing.def ) ? true : false, /* Если загружен плагин JQuery Easing */

			'progress' : false,
			'progressbar': 'line',

			'force' : false,
			'time' : 5000,

			'width': null,
			'height' : '100%',

			'group' : 1,

			'ajax': false,
			'total' : null,
			
			'offset' : 0, // стартовый элемент

			'module' : {
				'main' : null,
				'func': false
			},

			'url': {
				'ajax' : window.location.href
			},
			'selector': {
				'auto' : '[data-seed="carousel"], [role="carousel"]',
				'caption' : '[role="group-caption"]:first',
				'items' : '> *' /* элементы которые нужно найти в ответе ajax */
			},

			'func' : {
				'open' : null
			},
			'locale' : {
				'error' : {
				},
				'interface' : {
					'next': '›',
					'prev': '‹'
				}
			}
		},

		build: function() {
			var self = this;

			this.timer = null;
			this.current = 1;
			this.active = 1;
			this.group_count = 1;
			this.total_slides = parseInt(this.config.total || this.$el.attr('data-total'));

			this.config.initalTime = this.config.time;

			if( !this.config.easing_plugin ) { this.config.easing = 'linear'; }

			if( this.$el.attr('data-carousel-ajax') == 'true' ) { this.config.ajax = true; }
			if( this.$el.attr('data-carousel-autoplay') == 'false' ) { this.config.autoplay = false; }
			if( this.$el.attr('data-carousel-hover_stop') == 'true' ) { this.config.hover_stop = true; }
			if( this.$el.attr('data-carousel-dynamic') == 'false' ) { this.config.dynamic = false; }
			if( this.$el.attr('data-carousel-width') ) { this.config.width = this.$el.attr('data-carousel-width') * 1; }
			if( this.$el.attr('data-carousel-height') ) { this.config.height = this.$el.attr('data-carousel-height') * 1; }
			if( this.$el.attr('data-carousel-group') ) { this.config.group = this.$el.attr('data-carousel-group') * 1; }

			if( this.$el.attr('data-carousel-cycle') ) { this.config.cycle = this.$el.attr('data-carousel-cycle'); }

			if( this.$el.attr('data-carousel-offset') ) { this.config.offset = this.$el.attr('data-carousel-offset') * 1; }
			if( this.$el.attr('data-carousel-animation') ) { this.config.animation = this.$el.attr('data-carousel-animation'); }
			if( this.$el.attr('data-carousel-animation-time') ) { this.config.animation_time = this.$el.attr('data-carousel-animation-time') * 1; }
			if( this.$el.attr('data-carousel-time') ) { this.config.time = this.$el.attr('data-carousel-time') * 1; }


			if( this.$el.attr('data-carousel-progressbar') ) { this.config.progressbar = this.$el.attr('data-carousel-progressbar'); }

			this.$el.addClass('carousel carousel-'+ this._$list.marker + ' carousel-animation-' + this.config.animation);

			if( this.config.hover_stop ) { this.$el.addClass('hover-stop'); }

/* найдем все слайды */
			this.$items = this.$el.find(this.config.selector.items);

/* создаем блок слайдов и переносим в него все слайды */
			this.$box = $('<div>',{'class':'carousel-box'}).appendTo(this.$el, {'dymanic':false}).append(this.$items);

/* создаем рабочую область и переносим в нее блок слайдов */
			this.$area = $('<div>',{'class':'carousel-area'}).appendTo(this.$el, {'dymanic':false}).append(this.$box);

/* найдем полную ширину */
			this._setWidth( this._getWidth() ).setHeight();

/* если включен ajax, создаем нужные переменные */
			if( this.config.ajax) { this._ajax(); }

			if( this.config.animation != 'slide' && this.config.animation != 'fade' ) { this.config.group = 1; }

/* сгруппируем слайды */
			this._grouping( this.$items, 0 );

			this.$el.addClass('carousel-groups-'+this.$groups.length + ' carousel-items-'+ this.$items.length);

			if( this.config.progressbar == 'line' ) {
				this.$bar = $('<div>',{'class':'carousel-bar'}).css({'animation-duration' : this.config.time/1000 + 's'}).appendTo( this.$el, {'dymanic':false});
			}

			this.$nav = $('<div>',{'class':'carousel-navbar'}).appendTo( this.$el, {'dymanic':false});

			this.$status = $('<span>',{'class':'carousel-status'}).appendTo( this.$nav, {'dymanic':false}).append();
			this.$total = $('<span>',{'class':'total'}).text( this.total_slides ).appendTo( this.$status, {'dymanic':false});

			this.$pages = $('<span>',{'class':'carousel-pages'}).prependTo( this.$nav, {'dymanic':false});
				
/* создадим элементы переключения групп слайдов */
			this._buttons();

			this.$next = $('<button>',{'class':'carousel-navbutton carousel-next'})
				.html('<span>'+ this.config.locale.interface.next +'</span>')
				.appendTo( this.$nav, {'dymanic':false});

			this.$prev = $('<button>',{'class':'carousel-navbutton carousel-prev'})
				.html('<span>'+ this.config.locale.interface.prev +'</span>')
				.prependTo( this.$nav, {'dymanic':false});

			this.$groups.first().show().find('.carousel-caption, .carousel-text').show();

			if( this.$groups.length == 1 && !this.config.ajax ) {
				this.$nav.hide();
			}
			if( this.$groups.length > 1 ) {
				if( this.config.offset == 0 ) {
					this._start(1); /* Запустим первую ссылку */
				}
				else if( typeof this.config.offset == 'number' && this.config.offset <= this.$groups.length ) {
					if( this.config.offset == -1 ) this.config.offset = 'prev';
					this._page(this.config.offset); /* Переставим активность нужный слайд */
				}
			} 

			this.bind();
		},

		bind: function() {
			var self = this;
			$(window).resize(function() {
				self._setWidth( self._getWidth() ).setHeight();
			});

// бинды для элемента при наведении если элементов больше 1 и есть условие остановки
			if( this.config.hover_stop && self.$items.length > 1 ) {
				this.$el.on({
					'mouseenter' : function() { self.$el.addClass('hovered'); self._pause(); },
					'mouseleave' : function() { self.$el.removeClass('hovered'); self._resume(); }
				});
			}

// бинд свайпа для основного элемента карусели
			this.$el.on({
				'swipe' : function() {
				}
			});

// банды кнопок Вперед и Назад
			this.$next.on('click touchend', function() { self._page('next'); return false; });
			this.$prev.on('click touchend', function() { self._page('prev'); return false; });

		},

/* создание кнопок навигации по группам */
		_buttons: function() {
			var self = this;
			this.$groups.each(function(i) {
				i++;
				if( self.$pages.find('i[data-group="'+i+'"]').length ) { return; }

				var $button = $('<i>',{'data-group':i, name: $(this).attr('data-name')}).addClass((i==1) ? 'active':'').appendTo( self.$pages, {'dymanic':false});

				$button.on('click touchend',function(e) {
					if( !$(this).hasClass('active') ) { self._page(i); }
					else if( $(this).hasClass('active') && self.progress ) { self._page(i); }
					return false;
				});
		

				if( $(this).find(self.config.selector.caption).length ) {
					$(this).find(self.config.selector.caption).appendTo($button, {'dymanic':false});
				}
				else {
					$('<span>', {'class':'num'}).text(i).appendTo($button, {'dymanic':false});
				}
			
				if(self.config.progressbar == 'in-button') {
					$('<span>',{'class':'ani circle left'}).css({'animation-duration' : self.config.time/1000 + 's'}).appendTo($button, {'dymanic':false});
					$('<span>',{'class':'ani circle right'}).css({'animation-duration' : self.config.time/1000 + 's'}).appendTo($button, {'dymanic':false});
					$('<span>',{'class':'ani mask'}).css({'animation-duration' : self.config.time/1000 + 's'}).appendTo($button, {'dymanic':false});
				}
			});
			return this;
		},

/* Группировка слайдов по блокам */
		_grouping: function( $items ) {
			var count = 0;
			var group = this.group_count;
			var $block;
			var self = this;

			$items.each(function(i) {
				i++;
				var $el = $(this);
				$el.attr('data-num', i);

				if(count == 0) {
					$block = $('<div>',{'class':'carousel-group carousel-group-'+group, 'data-group':group}).appendTo( self.$box, {'dymanic':false});

					var addwidth = 
						parseInt( $block.css('padding-left') ) + 
						parseInt( $block.css('padding-right') ) + 
						parseInt( $block.css('margin-left') ) + 
						parseInt( $block.css('margin-right') ) + 
						parseInt( $block.css('border-left-width') ) + 
						parseInt( $block.css('border-right-width') );

					var width = addwidth + this.width;
					self._setWidth(width);
					group++;
				}

				$el.appendTo($block, {'dymanic':false});
				count++;
				if(count == self.config.group) { count = 0; }
			});

			this.group_count = group;
			this.$groups = this.$box.find('.carousel-group');

//			if( self.config.animation == 'slide' ) {
				this.$box.find('.carousel-group[data-group="'+self.active+'"]').addClass('active');
				this.$box.find('.carousel-group[data-group="'+self.current+'"]').addClass('current');
//			}

			return self;
		},

		_getWidth: function($items) {
			var width = 0;

			if( !$items ) { $items = this.$el.find(this.$items); }

			width = this._getItemWidth($items.filter(':first'));
			return parseInt(width);
		},

		_getItemWidth: function(el) {
			var width = 0;
			width = $(el).width() + 
				parseInt( $(el).css('padding-left') ) + 
				parseInt( $(el).css('padding-right') ) + 
				parseInt( $(el).css('margin-left') ) + 
				parseInt( $(el).css('margin-right') ) + 
				parseInt( $(el).css('border-left-width') ) + 
				parseInt( $(el).css('border-right-width') );
			return parseInt(width);
		},

		_setWidth: function(width) {
			this.width = width;
/*
			if( this.config.animation == 'horizontal' ) { this.$box.width('100%'); }
			else if( this.config.animation != 'slide' ) { this.$box.width(width); }
*/
			return this;
		},

		setHeight: function() {
			this.height = this.config.height || this.$box.find('> *:first').height();
//console.log( this.config.height );
			this.$area.height( this.height );
		},

		_start: function() {
			var self = this;
			if( this.config.autoplay ) {
				this.timer = null;
				this.timerStart = new Date();
				this.countdown = this.config.time;

				if( this.config.progress && this.config.progressbar == 'line' ) { this.$bar.addClass('run'); }
				if( !this.$el.hasClass('hovered') ) { this.timer = setTimeout(function() { self._page('next') }, self.countdown); }
			}
		},

		_resume: function() {
			var self = this;
			if( this.config.autoplay ) {
				this.timerStart = new Date();
				this.timer = setTimeout(function() { self._page('next') }, self.countdown);
			}
		},

		_pause: function() {
			this.countdown -= new Date() - this.timerStart;
			clearTimeout(this.timer);
		},

		_stop: function() {
			clearTimeout(this.timer);
		},

		_page: function(i) {
			this._stop();

			if( this.config.ajax ) {
				if( this.total_pages < this.active ) {
					this.active = 1;
				}
			}

			this.current = this.active;

			if( this.progress && this.config.force ) {
				this._force();
				return false;
			}

			if( this.progress == true ) { 
				return false;
			}

			this.progress = true;

			this.$el.find('.carousel-caption').fadeOut(200);
			this.$el.find('.cloned').remove();


			if (typeof i === 'number') {
				this.active = i;
				this._step(i);
			}
			else {
				this.active = this.active || parseInt( this.$nav.find('i.active').data('group') );

				if ( i == 'next' ) {
					if( this.config.ajax ) {
						if( this.total_slides > this.$groups.length * this.config.group ) {
							if ( this.active < this.total_pages && this.config.cycle == true ) {
								this.active++;
								if( this.active < this.$groups.length ) {
									this._step(i);
								}
								else {
									this._getContent(i);	
								}
							}
							else if ( this.active < this.total_pages && this.config.cycle != true ) {
								this.active = this.$nav.find('i').length;
								this._step(i);
							}
							else {
								this.active = 1;
								this._step(i);
							}
						}
						else {
							( this.active == this.$groups.length ) ? ( ( this.config.cycle == true ) ? this.active = 1 : this.active = this.$groups.length ) : this.active++;
							this._step(i);
						}	
					}
					else {
						( this.active == this.$groups.length ) ? ( ( this.config.cycle == true ) ? this.active = 1 : this.active = this.$groups.length ) : this.active++;
						this._step(i);
					}
				}
				else if ( i == 'prev' ) {
					( this.active == 1 ) ? ( ( this.config.cycle == true ) ? this.active = this.$groups.length : this.active == 1 ) : this.active--;
					this._step(i);
				}
			}
		},

		_step: function(i) {
			var self = this;

			if(i == 'next') { self.$next.addClass('loading'); }
			if(i == 'prev') { self.$prev.addClass('loading'); }


			if(this.config.progress && this.config.progressbar == 'line') {
				this.$bar.removeClass('run');
			}

			this.animation[this.config.animation](self, i);

			this.$nav.find('i').removeClass('next prev active').end().find('i[data-group="'+this.active+'"]').addClass('active').next('i').addClass('next').end().prev('i').addClass('prev');
			
		},

		_force: function() {
			this._stop();
			this.$groups.stop();

			this.$el.find('.cloned').remove();
			this.$groups.hide();

			this.$groups.filter('[data-group="'+this.active+'"]').show(100).find('.carousel-caption, .carousel-text').show(100);

       			this.forced = false;
			this.progress = false;

			this._callback();

			this._start();
		},

		_ajax: function() {
			this.module = this.config.module.main || this._getAttr('data-module') || this._getAttr('data-module-main');
			this.module_function = this.config.module.func || this._getAttr('data-function') || this._getAttr('data-func');

			this.total_pages = Math.ceil(this.total_slides / this.config.group);

			this.limit = 0;

			this.counter = 0; /* количество подгруженных страниц */

			this.query = this.config.url.ajax;

			if( !/first/.test(this.query) ) {
				this.query = this.query + ( /\?/.test(this.query) ? '&' : '?' ) + 'first' + this.module_function + '=0';
			}
		},

		_getContent: function(step) {
			var self = this;

			if( this.blocked || this.current * this.config.group >= this.total_slides ) {
				this.progress = false;
				return false;
			}

			var qs = {};
			qs['show'] = this.module;
			qs['mime'] = 'txt';
			qs['first'+this.module_function] = this.current * this.config.group;


			$.ajax({
				url: self.config.url.ajax,
				data: $.param(qs),
				cache: false,
				beforeSend: function() {
					self.blocked = true;
					if(step == 'next') { self.$next.addClass('loading'); }
					if(step == 'prev') { self.$prev.addClass('loading'); }
				},
				statusCode : {
					404 : function() {
						console.error('Carousel: Нет такой страницы!');
						self.unblock();
					},
					503 : function() {
						console.error('Carousel: Страница недоступна!');
						self.unblock();
					}
				},
				success: function(data, textStatus, jqXHR) {
					if( jqXHR.status == 200 ) {
						var $html = $(data).find(self.config.selector.current || self._$list.selector).find(self.config.selector.items);
						if($html.length) { self._grouping($html)._buttons()._step(step); }
						else { self._step(step); }
						self.unblock();
					}
				},
				error: function() {
					console.error('Carousel: Произошла неизвестная ошибка!');
					self.unblock();
				}
			});
		},

		unblock: function() {
			this.blocked = false;
//			this.$next.removeClass('loading');
//			this.$prev.removeClass('loading');
		},

		_animate: function() {
			if( !this.config.width ) { this.config.width = this.$el.width(); }

			this.anim = {};
			this.anim.$active = this.$groups.filter('[data-group="'+this.active+'"]');
			this.anim.$current = this.$groups.filter('[data-group="'+this.current+'"]');

			return this;
		},

		_finish: function(callback) {
			this.anim.$current.hide();
			this.anim.$active.show();
			this.anim.$active.find('.carousel-caption, carousel-text').fadeIn( this.anim.time/10 );
			this.$el.find('.cloned').remove();
			this.progress = false;
			this._callback();
		},

		_callback: function() {
			var self = this;
			if( $.isFunction(self.config.func.open) ) {
				( self.config.func.open )(self);
				if( self.config.debug ) { console.info(self._name+': func.open inited!'); }
			}

			this.$next.removeClass('loading');
			this.$prev.removeClass('loading');

			self._start();
			self.progress = false;
		},

/* Анимации переходов между группами слайдов */
		animation: {
				fade : function(self, callback) {
					self.$groups.fadeOut( self.config.animation_time ).removeClass('active');
					self.$groups.filter('[data-group="'+self.active+'"]').addClass('active').fadeIn(self.config.animation_time, function() { self._callback(); }).find('.carousel-caption, .carousel-text').show();
				},

				slide : function(self, i) {
					self.$el.find('.carousel-caption, .carousel-text').show();

					self.$groups.removeClass('active current previous');

					var $active = self.$box.find('.carousel-group[data-group="'+self.active+'"]').addClass('active');
					var $current = self.$box.find('.carousel-group[data-group="'+self.current+'"]').addClass('current');

					if( i == self.current ) {
                                                 self._callback(); 
					}

					if(i < self.current || i == 'prev') {
						var width = self._getItemWidth( $active );
						var delta = width;

						if( self.config.cycle == true ) {
							var $clone = $active.clone().addClass('clone').insertBefore( $current );
							self.$box.css('left', '-'+width+'px');
							delta = 0;
						}
						else {
							var left = parseInt( self.$box.css('left') );
							if( left >= 0 ) { self._callback(); return false; }
							delta = left + delta * (self.current - self.active);
						}

						self.$box.animate({left: delta + 'px'}, self.config.animation_time, self.config.easing, function() {
							if( self.config.cycle == true ) {

								$clone.remove();
//								$active.prependTo( self.$box, {'dymanic':false});
								self.$groups = self.$box.find('.carousel-group');

/* Создадим 2 списка: до активной группы и после активной группы */
								var list1 = []; var list2 = [];
								self.$groups.not('[data-group="'+self.active+'"]').each(function(i, el) {
									( $(el).data('group') > self.active ) ? list1.push($(el)) : list2.push($(el));
								});
/* Отсортируем сначала список групп, который идет после активной группы */
								self.$box.append(list1.sort(function(a, b) { return $(a).data('group') > $(b).data('group') ? 1 : -1; }));
/* Отсортируем список групп, который идет ДО активной группы */
								self.$box.append(list2.sort(function(a, b) { return $(a).data('group') > $(b).data('group') ? 1 : -1; }));
							}

							self._callback();
						});

					}

					if(i > self.current || i == 'next') {
						var width = self._getItemWidth( $current );
						var $previous = self.$box.find('.carousel-group[data-group="'+ (( self.current - 1 <= 0 ) ? self.$groups.length : self.current - 1) +'"]').addClass('previous');
						var width2 = parseInt(self.config.width) || self._getItemWidth( $previous );

						var delta = width2 || width;

						if( self.config.cycle == true ) {

							$active.insertAfter($current, {'dymanic':false});
							var $clone = $current.clone().addClass('clone').prependTo( self.$box, {'dymanic':false});

/* Создадим 2 списка: до активной группы и после активной группы */
							var list1 = []; var list2 = [];
							self.$groups.not('[data-group="'+self.active+'"]').each(function(i, el) {
								( $(el).data('group') > self.active ) ? list1.push($(el)) : list2.push($(el));
							});

/* Отсортируем сначала список групп, который идет после активной группы */
							self.$box.append(list1.sort(function(a, b) { return $(a).data('group') > $(b).data('group') ? 1 : -1; }));
/* Отсортируем список групп, который идет ДО активной группы */
							self.$box.append(list2.sort(function(a, b) { return $(a).data('group') > $(b).data('group') ? 1 : -1; }));

							var $clone_previous = $previous.clone().prependTo( self.$box, {'dymanic':false});
							
							self.$box.css('left','-'+width2+'px');
							delta = parseInt(width) + parseInt(width2);
						}
						else {
							var left = Math.abs( parseInt( self.$box.css('left') ) );
							if( (self.$groups.length - 1) * delta <= left ) { self._callback(); return false; }
							delta = delta * (self.active - 1);
						}


						self.$box.animate({left: '-'+delta+'px'}, self.config.animation_time, self.config.easing, function() {
							if( self.config.cycle == true ) {
								$clone.remove();
								$clone_previous.remove();
								$current.appendTo( self.$box, {'dymanic':false});

								self.$groups = self.$box.find('.carousel-group');
								self.$box.css('left', 0+'px');
							}
							self._callback(); 
						});
					}
				},

				horizontal: function(self) {
					self._animate();

					self.anim.total = Math.ceil(self.$el.width() / (self.$el.width() / 10));
					self.box_width = Math.ceil(self.$el.width() / self.anim.total);
					self.box_height	= self.$el.height(); 
					self.anim.margin = 0; /* (self.config.width - self.$el.width())/2; */

					$.each(new Array(self.anim.total), function(i) {
						self.anim.top = -20;
						self.anim.left = (self.box_width * (i));
						self.anim.delay = 50 * i;
        
						self.anim.delta = Math.round(self.box_height/100)*30;

						self.anim.$clone = self.anim.$active.clone().addClass('cloned').show().appendTo( self.$box, {'dymanic':false});

						self.anim.$clone.css({ left: self.anim.left, top:self.anim.top, width:self.box_width, height:self.box_height - self.anim.delta, opacity:0 })

						if( self.config.animation_type == 'background' ) { 
							self.anim.$clone.css({'height':'100%'}).find(self.config.selector.items).css({'background-position' : - self.anim.left - self.anim.margin +'px 0'});

						}
						else { 
							self.anim.$clone.find(self.config.animation_element).css({'left' : - self.anim.left - self.anim.margin +'px'});
						}


						var finish = (i == (self.anim.total - 1)) ? function() {
							self._finish()
						} : '';

						self.anim.$clone.delay(self.anim.delay).animate({opacity:1, top:0, left:self.anim.left, height:self.box_height}, self.config.animation_time, self.config.easing, finish);
					});
				},

				glass: function(self) {
					self._animate();

					self.anim.total = Math.ceil(self.$el.width() / (self.$el.width() / 10));
					self.box_width = Math.ceil(self.$el.width() / self.anim.total);
					self.box_height	= self.config.height || self.$el.height(); 
					self.anim.margin = 0;

					self.config.easing = ( !self.config.easing_plugin ) ? self.config.easing  : 'easeOutExpo';

					$.each(new Array(self.anim.total), function(i) {
						self.anim.left = self.box_width*i;
						self.anim.top = 0;

						self.anim.delay = 100 * i;

						self.anim.delta = Math.round(self.box_height/100)*30;

						self.anim.$clone = self.anim.$active.clone().addClass('cloned').show().appendTo( self.$box, {'dynamic':false});

						self.anim.$clone.css({left: self.anim.left, top:self.anim.top, width:self.box_width, height:self.box_height, opacity:0});

						if( self.config.animation_type == 'background' ) { 
							self.anim.$clone
							.css({ left: -(self.anim.left/1.5-total*i) })
							.find('a')
							.css({'background-position-x' : parseFloat(self.anim.left+total*i) +'%', 'background-position-y' : self.anim.top})
							.delay(self.anim.delay)
							.animate({'background-position-x' : self.anim.left, 'background-position-y' : self.anim.top}, self.config.animation_time*2.5*1.1 , self.config.easing);
						}
						else { 
							self.anim.$clone
							.find('img')
							.css({ left: -self.anim.left + (self.box_width/1.5) })
							.delay(self.anim.delay)
							.animate({ left : -self.anim.left, top: self.anim.top}, self.config.animation_time *2, 'easeInOutQuad');

						}

						var finish = (i == (self.anim.total-1)) ? function() {
							self._finish()
						} : '';

						self.anim.$clone.delay(self.anim.delay).animate({opacity:1, top:0, left:self.anim.left, height:self.box_height}, self.config.animation_time*2.5, self.config.easing, finish);

					});
				},


				animationGlassBlockVertical: function(self) {
					var self = this;
					this.config.progress = true;

					var easing = (this.config.easing_plugin) ? 'easeOutExpo' : this.config.easing;
					var time_animate = this.config.animation_time;

					var total = Math.ceil(this.$el.height() / (this.$el.height() / 10));
					self.box_height 	= Math.ceil(this.$el.height() / total);
					self.box_width = this.$el.width(); 

					this.$el.find('a').hide();

					var active = this.$el.find('a[page="'+this.$active+'"]');
					var current = this.$el.find('a[page="'+this.current+'"]').show();

					if(this.current != this.$active) active.insertBefore(current);

					var clone = active.show().clone();


					for (i = 0; i < total; i++) {
						var _ileft = 0;
						var _itop = (self.box_height * (i));

						var _fleft = 0;
						var _ftop = (self.box_height * (i));

						self.anim.left = 0;
						self.anim.top = -(self.box_height * (i));

						self.anim.delay = 100 * i;

						self.anim.$clone = $('<div class="cloned"></div>').insertAfter( current );
						clone.clone().appendTo( self.anim.$clone, {'dymanic':false});

						self.anim.$clone.css({left: _ileft, top:_itop, width:self.box_width, height:self.box_height});

						if( self.anim.$clone.find('img').length ) {

							self.anim.$clone
							.find('img')
							.css({left: self.anim.left + (self.box_width / 1.5), top: self.anim.top})
							.delay(self.anim.delay)
							.animate({left: self.anim.left, top: self.anim.top, opacity: 1}, (time_animate * 1.1), 'easeInOutQuad');
						}
						else {
							self.anim.$clone
							.css({ top: -(self.anim.top/1.5-total*i) })
							.find('a')
							.css({'background-position-y' : parseFloat(self.anim.top+total*i) +'%', 'background-position-x' : self.anim.left, opacity:0})
							.delay(self.anim.delay)
							.animate({'background-position-y' : self.anim.top, 'background-position-x' : self.anim.left, opacity:1}, time_animate , 'easeInOutQuad');
						}


						var callback2 = (i == (total - 1)) ? function() {
							current.hide();
							active.show();
							self.$el.find('.$cloned').remove();
							active.find('.pl-slide-caption').fadeIn(500);
							self.config.progress = false;
							if(callback) (callback)()
						} : '';

						self.anim.$clone.delay(self.anim.delay).animate({top:_ftop, left:_fleft, opacity: 'show'}, time_animate, easing, callback2);

					}
				}


			}
	});

	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
/* 
* Seed Framework
* seedTab 
* ver. 1.2
* Kirill Ivanov
* create: 2015.05.27
* update: 2015.06.15
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedTab';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.2';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,

			'hash' : window.location.hash.replace('#',''),
			'group' : null,
			'empty' : null,
			'selector': {
				'auto' : '[data-seed="tab"]',
				'holder_menu' : '[role="tabmenu"]',
				'holder_tabs' : '[role="tablist"]',
				'menu' : ''
			},

			'cssclass': {
				'menu' : 'menu-tabs',
				'holder_menu' : 'menu-tabs-place',
				'holder_tabs' : 'tabs-place'
			},
			'func' : {
				'open' : null,
				'caption' : null
			},
			'locale' : {
				'error' : {
				}
			}
		},

		build: function() {
			var self = this;

			this.config.hash = window.location.hash.replace('#','');


			this.hash = this._getAttr('data-name');
			this.title  = this._getAttr('data-caption') || this._getAttr('title') || '';
			this.group = this.config.group || this._getAttr('group') || 'default';
			this.empty = this.config.empty || this._getAttr('empty') || false;

			if( this.empty === true && ( this.$el.find('*').length < 0 || this.$el.text().length < 5 ) ) {
				return false;
			}

			this.$el.addClass('content-tab content-tab-'+this.hash).attr({'data-group':this.group, 'role':'tab'});

// находим определенное местоположение для меню табов, либо создаем его сами
			this.$selector_holder_menu = $(this.config.selector.holder_menu);

			if( this.$selector_holder_menu.filter('[data-group="'+this.group+'"]').length ) {
				this.$holder_menu = this.$selector_holder_menu.filter('[data-group="'+this.group+'"]');
			}
			else {
				if( $(this.config.cssclass.holder_menu+'[data-group="'+this.group+'"]').length ) {
					this.$holder_menu = $(this.config.cssclass.holder_menu+'[data-group="'+this.group+'"]');
				}
				else {
					this.$holder_menu = $('<div>',{'class': this.config.cssclass.holder_menu, 'data-group':this.group, 'role': 'tabmenu'}).insertBefore(this.$el, {'dynamic':false});
				}
			}

// находим определенное местоположение для списка табов, либо создаем его сами
			this.$selector_holder_tabs = $(this.config.selector.holder_tabs);

			if( this.$selector_holder_tabs.filter('[data-group="'+this.group+'"]').length ) {
				this.$holder_tabs = this.$selector_holder_tabs.filter('[data-group="'+this.group+'"]');
			}
			else {
				if( $(this.config.cssclass.holder_tabs+'[data-group="'+this.group+'"]').length ) {
					this.$holder_tabs = $(this.config.cssclass.holder_tabs+'[data-group="'+this.group+'"]');
				}
				else {
					this.$holder_tabs = $('<div>',{'class': this.config.cssclass.holder_tabs, 'data-group':this.group, 'role':'tablist'}).insertBefore(this.$el, {'dynamic':false});
				}
			}

// определяем меню табов
			if( this.$holder_menu.find(this.config.selector.menu).length ) {
				this.$menu = this.$holder_menu.find(this.config.selector.menu);
			}
			else {
				if( $('.'+this.config.cssclass.menu+'[data-group="'+this.group+'"]').length ) {
					this.$menu = $('.'+this.config.cssclass.menu+'[data-group="'+this.group+'"]');
				}
				else {
					this.$menu = $('<ul>', {'class': this.config.cssclass.menu, 'data-group':this.group}).prependTo( this.$holder_menu, {'dynamic':false});
				}
			}
                                                                                        

// определяем список табов
			this.$tabs = ( !this.$holder_tabs.find('.tabs').length ) ? $('<div>', {'class': 'tabs'}).prependTo( this.$holder_tabs, {'dynamic':false}) : this.$holder_tabs.find('.tabs');

			this.$el.appendTo( this.$tabs, {'dynamic':false});

// создаем заголовок и помешаем его в меню
			this.$caption = $('<li>',{'class':'title '+this.hash,'data-name': this.hash, 'role':'button', 'aria-controls': 'content-tab-'+this.hash }).appendTo( this.$menu, {'dynamic':false});

// создаем кастомную запись для заголовка, если функция существует
			if( this.config.func.caption ) {
				this.$title = this.config.func.caption(self);
			}
// если существует вложенный элемент с роль заголовка то используем его
			else if( this.$el.find('> [role="tab-caption"]').length ) {
				this.$title = this.$el.find('> [role="tab-caption"]');
			}
			else {
				this.$title = $('<span>').text(this.title);
			}

			this.$title.appendTo( this.$caption, {'dynamic':false});

//console.log( this.config.event.__on );
			this.bind();
		},

// навешиваем обработку клика по заголовку 
		bind: function() {
			var self = this;

//console.log( self.config.func)

			this.$caption.on('click touchend', function(e) {
				if( self.$caption.hasClass('active') ) { return false; }

				$('[data-seed="tooltip-helper"]').remove();

				$('.content-tab[data-group="'+self.group+'"]').removeClass('active').addClass('hidden').attr('aria-expanded', false);
				self.$el.addClass('active').removeClass('hidden').attr('aria-expanded',true);
				if( $.isFunction(self.config.func.open) ) {
					( self.config.func.open )(self);
				}

				if( self.config.debug ) { console.info(self._name+': tab clicked!'); }

				self.$menu.find('.active').removeClass('active').attr('aria-pressed',false);
				self.$caption.addClass('active').attr('aria-pressed',true);

				window.location.hash = self.hash;
				return false;
			});

			if( !this.$el.hasClass('active') ) {
				this.$el.css('display','hide').addClass('hidden');
			}

			if( this.$el.hasClass('active') ) {
				$('.content-tab[data-name="'+this.hash+'"]').css('display','block').removeClass('hidden');
				this.$caption.addClass('active');
			}
			else if( !this.config.hash || !this.$menu.find('.title[data-name="'+ this.config.hash +'"]').length  ) {
				$('.content-tab[data-name="'+this.$menu.find('.title:first').attr('data-name')+'"]').css('display','block').removeClass('hidden');
				this.$menu.find('.title:first').addClass('active');
			}
			if( this.config.hash == this.hash && !this.$el.hasClass('active') ) {
				this.$caption.click();
			}

			if( this.config.hash == '' && !this.$el.hasClass('active') ) {
				if( $.isFunction(self.config.func.open) ) {
					( self.config.func.open )(self);
				}
			}

			$(window).on('hashchange', function() {
				if( window.location.hash.replace('#','') == self.hash && !self.$el.hasClass('active') ) {
					self.$caption.click();
				}
			});
		}
	});

	var module = new $.fn.seedCore(name, $.seed[name]);

})(jQuery, window, document);
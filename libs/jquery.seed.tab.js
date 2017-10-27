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

			'hash' : window.location.hash.replace('#',''),
			'group' : null,
			'empty' : true,
			'selector': {
				'auto' : '[data-seed="tab"]',
				'tabmenu' : '[role="tabmenu"]',
				'tablist' : '[role="tablist"]',
				'menu' : ''
			},

			'cssclass': {
				'menu' : 'menu-tabs',
				'tabmenu' : 'menu-tabs-place',
				'tablist' : 'tabs-place'
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

			// проверяем таб на дочерние элементы, если стоит флаг запрета, то не обрабатываем пустой элемент.
			if( this.empty === false && ( this.$el.find('> *').length < 0 || this.$el.text().length < 5 ) ) {
				return false;
			}

			this.$el.addClass('content-tab content-tab-'+this.hash).attr({'data-group':this.group, 'role':'tab'});

// находим определенное местоположение для меню табов, либо создаем его сами
			this.$selector_tabmenu = $(this.config.selector.tabmenu);

			if( this.$selector_tabmenu.filter('[data-group="'+this.group+'"]').length ) {
				this.$tabmenu = this.$selector_tabmenu.filter('[data-group="'+this.group+'"]');
			}
			else {
				if( $(this.config.cssclass.tabmenu+'[data-group="'+this.group+'"]').length ) {
					this.$tabmenu = $(this.config.cssclass.tabmenu+'[data-group="'+this.group+'"]');
				}
				else {
					this.$tabmenu = $('<div>',{'class': this.config.cssclass.tabmenu, 'data-group':this.group, 'role': 'tabmenu'}).insertBefore(this.$el );
				}
			}

// находим определенное местоположение для списка табов, либо создаем его сами
			this.$selector_tablist = $(this.config.selector.tablist);

			if( this.$selector_tablist.filter('[data-group="'+this.group+'"]').length ) {
				this.$tablist = this.$selector_tablist.filter('[data-group="'+this.group+'"]');
			}
			else {
				if( $(this.config.cssclass.tablist+'[data-group="'+this.group+'"]').length ) {
					this.$tablist = $(this.config.cssclass.tablist+'[data-group="'+this.group+'"]');
				}
				else {
					this.$tablist = $('<div>', {'class': this.config.cssclass.tablist, 'data-group':this.group, 'role':'tablist'}).insertBefore(this.$el );
				}
			}

			// определяем меню табов
			if( this.$tabmenu.find(this.config.selector.menu).length ) {
				this.$menu = this.$tabmenu.find(this.config.selector.menu);
			}
			else {
				if( $('.'+this.config.cssclass.menu+'[data-group="'+this.group+'"]').length ) {
					this.$menu = $('.'+this.config.cssclass.menu+'[data-group="'+this.group+'"]');
				}
				else {
					this.$menu = $('<ul>', {'class': this.config.cssclass.menu, 'data-group':this.group}).prependTo( this.$tabmenu );
				}
			}

			// определяем список табов
			this.$tabs = ( !this.$tablist.find('.tabs').length ) ? $('<div>', {'class': 'tabs'}).prependTo( this.$tablist ) : this.$tablist.find('.tabs');

			this.$el.appendTo( this.$tabs );

			// определяем заголовок или создаем его и помешаем его в меню
			this.$caption = ( this.$menu.find('li[data-name="'+this.hash+'"]').length )
				? this.$menu.find('li[data-name="'+this.hash+'"]')
				: $('<li>',{'class':'title '+this.hash,'data-name': this.hash, 'role':'button', 'aria-controls': 'content-tab-'+this.hash }).appendTo( this.$menu );

			// определим текст заголовка, если есть
			if( this.$caption.find('span').length ) {
				this.$title = this.$caption.find('span');
			}
			else {
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

				this.$title.appendTo( this.$caption );
			}

			this.bind();
		},

// навешиваем обработку клика по заголовку 
		bind: function() {
			var self = this;

			this.$caption.on('click touchend', function(e) {
				if( self.$caption.hasClass('active') ) {
					return true;
				}

				$('[data-seed="tooltip-helper"]').remove();

				$('.content-tab[data-group="'+self.group+'"]').removeClass('active').addClass('hidden hide').attr('aria-expanded', false);
				self.$el.addClass('active').removeClass('hidden hide').attr('aria-expanded',true);
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
				this.$el.css('display','hide').addClass('hidden hide');
			}

			if( this.$el.hasClass('active') ) {
				$('.content-tab[data-name="'+this.hash+'"]').css('display','block').removeClass('hidden hide');
				this.$caption.addClass('active');
			}
			else if( !this.config.hash || !this.$menu.find('.title[data-name="'+ this.config.hash +'"]').length  ) {
				$('.content-tab[data-name="'+this.$menu.find('.title:first').attr('data-name')+'"]').css('display','block').removeClass('hidden hide');
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
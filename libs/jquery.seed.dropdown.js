/* 
* Seed Framework
* seedDrop 
* ver. 1.1
* Kirill Ivanov
* create: 2015.06.12
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedDropdown';

	$.seed[name] = {};
	$.seed[name].VERSION = '1.1';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented': true,

			'group' : 'default',

			'selector': {
				'auto' : null,
				'evented' : '[data-seed="dropdown"]',
				'drop' : '[data-seed="drop"]:first, [role="drop"]:first',
				'handler' : '[role="dropdown-handler"]:first',
				'close' : '[role="dropdown-close"]'
			},
			'event' : {
				'__on' : 'click.seed.drop touchend.seed.drop',
				'__off' : 'click.seed.drop touchend.seed.drop',
				'on' : 'click.seed.drop touchend.seed.drop',
				'off' : 'click.seed.drop touchend.seed.drop'
			},
			'url': {
				'current' : window.location.href
			},
			'func' : {
				'show' : function() { return true; },
				'hide' : function() { return true; }
			},
			'module' : {
				'main' : null,
				'func': false
			}
		},

		build: function(e) {

			var self = this;

			if( this.$el.find(this.config.selector.handler).length ) {
				this.$dropdown = this.$el.find(this.config.selector.handler);
			}
			else {
				this.$dropdown = this.$el;
			}

			if( this.$el.attr('data-dropdown-area') ) {
				this.$drop = $('[area-labelledby="'+ this.$el.attr('data-dropdown-area') +'"]');
			}
			else {
				this.$drop = ( this.$el.find(this.config.selector.drop).length ) ? this.$el.find(this.config.selector.drop) : this.$dropdown.next(':first');
			}

			if( this.$drop.find(this.config.selector.close).length ) {
				this.$close = this.$drop.find(this.config.selector.close);
			}
			else {
				this.$close = this.$el;
			}


// определим группу
			this.config.group = this.$dropdown.attr('data-dropdown-group') || this.config.group;

// назначим группу если она не прописана
			if( !this.$dropdown.attr('data-dropdown-group') ) {
				this.$dropdown.attr('data-dropdown-group', this.config.group);
			}
			if( !this.$drop.attr('data-dropdown-group') ) {
				this.$drop.attr('data-dropdown-group', this.config.group);
			}

			if( this.$drop.length ) {
				this.active = this.$dropdown.hasClass('dropped active');

				if( !this.active ) {
					//this._$list.filter('[data-dropdown-group="'+self.config.group+'"]').removeClass('dropped active');
					$('[data-dropdown-group="'+self.config.group+'"]').removeClass('dropped active');
				
					$('[data-dropdown-group="'+self.config.group+'"]').each(function() {
						var $drop = ( $(this).find(self.config.selector.drop).length ) ? $(this).find(self.config.selector.drop) : $(this).next(':first');
						$drop.hide();
					});

					$('[data-dropdown-group="'+self.config.group+'"]').not(this.$el).each(function() {
						$('[area-labelledby="'+ $(this).attr('data-dropdown-area') +'"]').removeClass('on').hide();
					});

					this.$drop.removeClass('off').addClass('on effect effect-drop').show();
					this.$dropdown.removeClass('off').addClass('dropped active on effect');

// callback при отображении контента
					self.config.func.show(self);

					this.bind('off');
				}
				else {
					this.$drop.removeClass('on').addClass('off').css('display','none');
					this.$dropdown.removeClass('dropped active on').addClass('off');

// callback при скрытии контента
					self.config.func.hide(self);

					this.bind('on');
				}
			}
			else {
				return true;
			}
			this.bind('on');
		},

		bind: function(e) {
			var self = this;
			if( e == 'off' ) {
				this.$dropdown.off(this.config.event.off +' '+ this.config.event._off).on(this.config.event.off, function(e) {
					self.build(e);
				});
			}
			if( e == 'on' ) {
				this.$dropdown.off(this.config.event.off +' '+ this.config.event._off).on(this.config.event.on, function(e) {
					self.build(e);
				});

				this.$close.off(this.config.event.off +' '+ this.config.event._off).on(this.config.event.on, function(e) {
					self.build(e);
				});
			}
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
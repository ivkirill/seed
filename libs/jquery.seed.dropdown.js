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
			'evented': true,

			'group' : 'default',
			'area' : null,
			'hide' : true,

			'outside' : false,

			'selector': {
				'auto' : null,
				'evented' : '[data-seed="dropdown"]',
				'drop' : '[data-seed="drop"]:first, [role="drop"]:first',
				'handler' : '[role="dropdown-handler"]:first',
				'close' : '[role="dropdown-close"]'
			},
			'event' : {
				'__on' : 'click.seed.drop',
				'__off' : 'click.seed.drop',
				'on' : 'click.seed.drop',
				'off' : 'click.seed.drop'
			},
			'url': {
				'current' : window.location.href
			},
			'func' : {
				'show' : function() { return true; },
				'hide' : function() { return true; },
				'ready' : null
			},
			'module' : {
				'main' : null,
				'func': false
			}
		},

		build: function() {
			var self = this;

			if( this.$el.find(this.config.selector.handler).length ) {
				this.$dropdown = this.$el.find(this.config.selector.handler);
				this.handler = true;
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
//				this.$close = this.$el;
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
				this.active = this.$dropdown.hasClass('active');

				if( !this.active ) {
					this.$el.addClass('active');
					$('[data-dropdown-group="'+self.config.group+'"]').removeClass('dropped active');
			
					$('[data-dropdown-group="'+self.config.group+'"]').each(function() {
						var $drop = ( $(this).find(self.config.selector.drop).length ) ? $(this).find(self.config.selector.drop) : $(this).next(':first');
						if( self.config.hide ) {
							$drop.css('display','none');
						}
					});

					$('[data-dropdown-group="'+self.config.group+'"]').not(this.$el).each(function() {
						var $drop = $('[area-labelledby="'+ $(this).attr('data-dropdown-area') +'"]').addClass('off').removeClass('on').hide();
					});

					this.$drop.removeClass('off').addClass('on effect effect-drop')
					if( this.config.hide ) { this.$drop.show(); }

					this.$dropdown.removeClass('off').addClass('dropped active on effect');

					// callback при отображении контента
					self.config.func.show(self);

					this.rebind('off');
				}
				else {
					this.close();
					this.rebind('on');
				}
			}
			else {
				return true;
			}

			this.bind();

		},

		bind: function() {
			var self = this;

			if( this.$close ) {
				this.$close
				.off(this.config.event.on)
				.on(this.config.event.on, function(e) {
					self.close();
					e.stopPropagation();
				});
			}

			if( this.config.outside ) {
				$('html')
				.off(this.config.event.on + this.config.group)
				.on(this.config.event.on + this.config.group, function(e) {

					if(self.$drop.find( $(e.target) )[0] !== e.target ) {
						$('html').off(self.config.event.on + self.config.group);

						self.close();
						e.stopPropagation();
					}
				});
			}
		},

		rebind: function(event) {
			var self = this;

			if( this.handler === true ) {
				this.$el.off(this.config.event.off +' '+ this.config.event._off +' '+ this.config.event.on +' '+ this.config.event._on);
			}
			
			if( event == 'on' ) {
				this.$dropdown
				.off(this.config.event.off +' '+ this.config.event._off +' '+ this.config.event.on +' '+ this.config.event._on)
				.on(this.config.event.on, function(e) {
					self.build();
					e.stopPropagation();
				});

			}
			else if( ( event == 'on' || event == 'off' ) && this.config.event.on != this.config.event.off ) {
				this.$dropdown
				.off(this.config.event.off +' '+ this.config.event._off +' '+ this.config.event.on +' '+ this.config.event._on)
				.on(this.config.event.off +' '+ this.config.event.on, function(e) {
					self.build();
					e.stopPropagation();
				});
			}
			else if( event == 'off' ) {
				this.$dropdown
				.off(this.config.event.off +' '+ this.config.event._off +' '+ this.config.event.on +' '+ this.config.event._on)
				.on(this.config.event.on, function(e) {
					self.build();
					e.stopPropagation();
				});
			}
		},

		close: function() {
			this.$el.removeClass('active');
			this.$drop.removeClass('on').addClass('off')
			if( this.config.hide ) { this.$drop.css('display','none'); }

			this.$dropdown.removeClass('dropped active on').addClass('off');

			//снимаем бинды с окружения, если они были
			if( this.config.outside ) {
				$('html').off(this.config.event.on + this.config.group);
			}


// callback при скрытии контента
			this.config.func.hide(this);
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
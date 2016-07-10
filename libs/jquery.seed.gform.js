7/* 
* Seed Framework
* seedGform
* ver. 3.1
* Kirill Ivanov
* create: 2015.06.26
*/

;(function ($, window, document, undefined) {
	'use strict';

	if (!$.seed) {
		$.seed = {};
	};

// данные для конструктора
	var name = 'seedGform';

	$.seed[name] = {};
	$.seed[name].VERSION = '3.1';
	$.seed[name]._inited = [];

	$.extend($.seed[name], {
		defaults: {
			'debug': false,
			'dynamic' : true,
			'evented': false,

			'method': 'POST',
			'letter' : 'html',
			'enctype' : false,
			'files' : false,

			'validate' : 'on',
			'auth' : false,

			'reload' : false,
			'reload_time' : 2000,

			'merge' : true,
			'fields' : null,

//отправка формы через ajax
			'ajax' : false,
//родитель в который должны писаться информационные данные при ajax отправке
			'context' : null,

			'required_status'  : true,
			'random_length' : 8,
			'tooltip_side' : 'left',

			'selector': {
				'auto' : '[data-seed="gform"], [data-seed="validate"]'
			},

			'cssclass': {
				'form' : '',
				'title' : '',
				'column' : '',
				'caption' : '',
				'header' : ''
			},

			'event' : {
				'__on' : 'dynamic.seed.gform',
				'on' : 'dynamic.seed.gform'
			},

			'url': {
				'post' : null
			},

			'func' : {
//кастомная функция сбора данных из формы
				'merge' : null,

//callback-функция выполняющая после инициализации формы
				'ready' : null, 

//callback-функция выполняющая после валидации, сбора данных из всех полей формы и ВМЕСТО ajax отправки формы и всех информационных сообщений.
				'ajax_custom' : null,

//callback-функция выполняющая перед сериализацей формы
				'ajax_preserialize' : null,

//callback-функция выполняющая после сериализации формы и до оправки
				'ajax_before_send' : null,

//callback-функция выполняющая после сериализации формы и оправки, ВМЕСТО стандартной функции информационных сообщений.
				'ajax_success' : null,

//callback-функция выполняющая после сериализации формы, оправки и при получение ответа об ошибке
				'ajax_error':null,

//callback-функция выполняющая после сериализации формы, оправки и при получение ответа об удаче, но при этом в ответе data есть ошибка
				'ajax_success_error' : null,

//callback-функция выполняющая после ajax отправки формы и после всех информационных сообщений.
				'ajax_success_callback' : null

			},

			'locale' : {
				'error' : {
					'data-name': 'не задано имя',
					'title': 'не задан title',
					'fields': 'нет полей для создания формы',
					'type': 'не задан типа для создания поля формы',

					'pattern' : 'Неверный формат ввода',
					'required' : 'Обязательное поле',
					'pass' : 'Введенные пароли не совпадают',
					'symbols' : 'Недопустимые символы',
					'email' : 'Не правильный формат электронной почты',
					'phone' : 'Телефон может содержать только цифры и тире',
					'date' : 'Не правильный формат даты. Формат ГГГГ-ММ-ДД чч:мм',
					'option' : 'Не выбран вариант',
					'pass_length' : 'Пароль должен быть длиннее 3 символов',
					'symbols_file' : 'В имени файла не допускаются русские буквы!',
					'extension' : 'Неверный формат изображения. Верный формат: JPEG, GIF, PNG',

					'novalid' : 'Не все поля формы заполнены корректно, проверьте правильность заполнения полей еще раз'
				},

// кастомные информационные сообщения
				'interface' : {
					'loading' : 'Отправляем данные на сервер',
					'error' : 'Во время отправки данных произошла ошибка. Перегрузите страницу и попробуйте еще раз',
					'success' : 'Данные успешно отправлены',

					'loading_auth' : 'Попытка авторизации',
					'error_auth' : 'Логин или пароль указаны неверно',
					'success_auth' : 'Авторизация успешна',
	
					'select_value' : 'Не выбрано',
					'select_name' : 'Выберите...',
					'required' : '* - поля, обязательные для заполнения.'
				}
			}
		},

		build: function() {
			var self = this;
			if(this.config.debug) { console.log(this); }

			if( this.$el.attr('data-gform-ajax') ) { this.config.ajax = this.$el.attr('data-gform-ajax'); }
			if( this.$el.attr('data-gform-merge') ) { this.config.merge = this.$el.attr('data-gform-merge'); }
			if( this.$el.attr('data-gform-auth') ) { this.config.auth = this.$el.attr('data-gform-auth'); }
			if( this.$el.attr('data-gform-validate') ) { this.config.validate = this.$el.attr('data-gform-validate'); }
			if( this.$el.attr('data-gform-required_status') ) { this.config.required_status = this.$el.attr('data-gform-required_status'); }

			this.config.url.post = this.$el.attr('data-action') || this.$el.attr('data-gform-action') || this.config.url.post || window.location.href;

			if( this.$el.get(0).tagName == 'FORM' || self.$el.find('form').length ) {
				this.$form = ( self.$el.get(0).tagName == 'FORM' ) ? self.$el : self.$el.find('form:first');
				this.$form.attr({
					'role':'form',
					'novalidate':'novalidate'
				});

				this.bind();
			}
			else {
				this.fields = this.config.fields || this.$el.attr('data-fields') || this.$el.attr('data-gform-fields') || this.$el.data('fields') || this._error(this.config.fields, 'fields'); 
				if( typeof this.fields == 'string') { this.fields = window[this.fields] };

				this._create();
			}
		},

// навешиваем бинды 
		bind: function() {
			var self = this;
			this.$form.submit(function() {
				var validate = true;
				try {
					if(typeof arguments[1] =='object' && arguments[1].novalidate) {
						validate = false;
					}
				}
				catch(e) {}
				return self.validate(validate);
			});
		},

		_create: function() {
			var self = this;

			this.$holder = $('<div>',{'class':'form-wrapper'}).appendTo( this.$el, {'dynamic':false});
// создаем форму
			this.$form = $('<form>',{
				'class':'gform gform-'+ this._index +' ' + this.config.cssclass.form,
				'role':'form',
				'action': this.config.url.post,
				'novalidate':'novalidate',
				'method' : this.config.method
			}).appendTo( this.$holder, {'dynamic':false});

// создаем инпут для проверки защиты от спама :)
			$('<input>', {
				'name' : 'from',
				'type' : 'hidden'
			}).appendTo( self.$form, {'dynamic':false});
			
			if( this.config.debug ) { console.log(this.fields); }

// создаем элементы из массива
			$.each(this.fields, function(i) {
				self._createGroup(self.fields[i])
			});

// добавляем блок с обязательностью заполенения полей
			if( this.config.required_status === true ) {	
				$('<p>',{'class':'gform-reqtitle alert alert-warning'}).html(this.config.locale.interface.required).insertAfter( self.$form.find('.form-group:last'), {'dynamic':false});
			}

			if(this.config.enctype == 'true') { this.$form.attr('enctype','multipart/form-data'); }

// создаем инпут для сбора полей функцей merge	
			if( this.config.merge == true ) {
				$('<input>', {
					'name' : ( this.config.form_event == 'update' ) ? 'Text' : 'text',
					'type' : 'hidden'
				}).appendTo( self.$form, {'dynamic':false});
			}

			this.bind();
		},

//преобразование типов
		_converting: function(args) {
			$.each(args, function(i) {
				if( this === 'true' ) { args[i] = true; }
				if( this === 'false' ) { args[i] = false; }
			});
			return args;
		},

		_createGroup: function(args) {
			if( !args ) { return false; }
			if (this.config.debug) { console.log(args); }

//если параметр не задан, отрубаем функцию
			if(!args.type) {
				this._error(args.name, 'type');
				return false;
			}

			args = this._converting(args);

			if (!args.tip) { args.tip = ''; }

			args.$group = $('<div>',{'class':'form-group ' + ((args.name) ? 'form-group-'+args.name.toLowerCase() : '') }).appendTo( this.$form, {'dynamic':false});

			if(args.hide) { args.$group.addClass('gform-hidden hidden hide'); }

			this._createHolder(args);
		},

		_createHolder: function(args) {
			if (args.type == 'caption') {
				args.$title = $('<div>',{'class':'caption '+this.config.cssclass.caption}).appendTo( args.$group, {'dynamic':false});
				args.$caption = $('<div>').addClass('h3').html(args.title).appendTo( args.$title, {'dynamic':false});
				args.$el = args.$title;
				this._createObj(args);
			}
			else if (args.type == 'header' ) {
				args.$title = $('<div>',{'class':'caption '+this.config.cssclass.header}).appendTo( args.$group, {'dynamic':false});
				args.$caption = $('<h1>').html(args.title).appendTo( args.$title, {'dynamic':false});
				args.$el = args.$title;
			}
			else if (args.type == 'hidden') {
				args.$group.remove();
				args.$el = self.$form;
				this._createObj(args);
			}
			else {
				args.$title = $('<div>',{'class':'title ' + this.config.cssclass.title}).appendTo( args.$group, {'dynamic':false});
       				if(args.type != 'submit') if(args.type != 'reset') {
					args.$caption = $('<label>',{'for':'gform-'+self._index+'-'+args.name.toLowerCase()}).html( (args.title) ? (args.title+':') : '').appendTo( args.$title, {'dynamic':false});
					args.$req = $('<span>').addClass('gform-required').text( (args.required === true) ? '*' : '').prependTo( args.$caption, {'dynamic':false});
				}      
				args.$el = $('<div>',{'class':'input-holder ' + this.config.cssclass.column}).appendTo( args.$group, {'dynamic':false});
       				if(args.type != 'submit') {
					args.$icon = $('<div>',{'class':'input-status fa', 'aria-hidden':'true'}).appendTo( args.$el, {'dynamic':false});
				}
				this._createObj(args);
			}
		},

		_createObj: function(args) {
			var self = this;

			args.valid = false;
			args.datatype = args.type;

// если поле является checkbox или radio
			if (args.type == 'checkbox' || args.type == 'radio') {
				args.$input = $('<input>',{type:'hidden','disabled': true}).prependTo( args.$el, {'dynamic':false});
				args.options = [];

				if( typeof args.items === 'object') {
					$.each(args.items, function(i) {
						var $label = $('<label>',{
							'class':args.type+' input-checkbox-label',
							'data-tooltip-side': self.config.tooltip_side
						}).appendTo( args.$el, {'dynamic':false});

						var $title = $('<span>').text(args.items[i].name || args.items[i].value).appendTo( $label, {'dynamic':false})

						args.options[i] = $('<input type="'+args.datatype+'">').prependTo( $label, {'dynamic':false}).addClass('input-checkbox').attr({
							'name': args.name,
							'value': args.items[i].value,
							'data-type': args.datatype
						});

// сохраним обьект свойств в data созданного инпута
						args.options[i].data(this);

						if( args.value ) {
							if(args.items[i].value == args.value) {
								args.options[i].attr('checked', 'checked');
							}
						}
						else {
							if(args.items[i].active == true) { args.options[i].attr('checked','checked'); }
						}
					});
				}
				else {
					console.error(this._name +': Нет items для поля '+args.name);
				}
			}       

// если поле является select
			else if (args.type == 'select') {
				args.$input = $('<select>', {'class': 'form-control'}).prependTo( args.$el, {'dynamic':false});
				args.options = [];

				args.options[0] = $('<option>').val( this.config.locale.interface.select_value ).text( this.config.locale.interface.select_name ).appendTo( args.$input, {'dynamic':false});
				if( args.required == 'true' ) args.options[0].attr({'disabled':'disabled', 'selected':'selected'});

				if( typeof args.items === 'object') {
					$.each(args.items, function(i, el) {
						args.options[i+1] = $('<option>').text(args.items[i].name || args.items[i].value).appendTo( args.$input, {'dynamic':false});

						if( args.value ) {
							if(args.items[i].value == args.value) { args.options[i+1].attr('selected','selected'); }
						}
						else {
							if(args.items[i].active == true) { args.options[i+1].attr('selected','selected'); }
						}

						$.each(args.items[i], function(j, param) {
							if(j=='name') { return; }
							else { args.options[i+1].attr(j, param); }
						});
					});
				}
				else {
					console.error(this._name +': Нет items для поля '+args.name);
				}
			}
		
// если поле является submit
			else if (args.type == 'submit') {
				args.$submit = $('<div>',{ 'class': 'submit' }).prependTo( args.$el, {'dynamic':false});
				args.$input = $('<input>',{ 'type':args.type }).val( $('<span>').html(args.title).text() ).addClass('input-submit input-submit btn btn-primary').appendTo( args.$submit, {'dynamic':false});
			}
// если поле является file
			else if (args.type == 'file') {
				args.$input = $('<input>',{ 'type':args.type }).addClass('input-file').prependTo( args.$el, {'dynamic':false});
				this.config.enctype = 'true';
			}
// если поле является textarea
			else if (args.type == 'textarea') {
				args.$input = $('<textarea>', {'class':'form-control'}).text( args.value ).prependTo( args.$el, {'dynamic':false});
			}
// если поле является hidden
			else if (args.type == 'hidden') {
				args.$input = $('<input>',{ 'type':args.type }).prependTo( self.$form, {'dynamic':false});
			}
			else {
				if( args.type == 'caption' ) { args.type = 'hidden'; }
				args.$input = $('<input>',{ 'type':args.type, 'class':'form-control'}).prependTo( args.$el, {'dynamic':false});
			}

// если существует input тогда обработаем его
			if(args.$input) {
				self._modifyObj(args);
			}

			if( $.isFunction(args.callback) ) {
				(args.callback)(args, self);
			}
		},

// назначим для элемента необходимые атрибуты и свойства
		_modifyObj: function(args) {
			var self = this;

			if( args.type != 'file' && args.type != 'submit' ) { args.$input.addClass('input'); }

			args.$input.attr('name', args.name);
			args.$input.attr('value', args.value);
			args.$input.attr('data-type', args.datatype);
			args.$input.attr('data-title', args.title);
			args.$input.attr('id', 'gform-'+this._index+'-'+args.name);

			if(args.cssclass) { args.$input.addClass(args.cssclass); }

			if(args.autocomplete == 'off') { args.$input.attr('autocomplete','off'); }
			if(args.autocomplete == 'on') { args.$input.attr('autocomplete','on'); }
			if(args.autofocus === true) { args.$input.attr('autofocus','autofocus'); }
			if(args.disabled === true || args.hide === true) { args.$input.attr('disabled','disabled'); }
			if(args.readonly === true) { args.$input.attr('readonly','readonly'); }
			if(args.required === true) { args.$input.attr('required','required'); }
			if(args.nomerge === true) { args.$input.attr('data-merge','false'); }
			if(args.multiple === true) { args.$input.attr('multiple','multiple'); }


			if(args.accept && args.type == 'file') { args.$input.attr('accept', args.accept ); }

			if(args.tip || args.tooltip || args.placeholder) {
				args.$input.attr('title', args.tip || args.tooltip);
				args.$input.attr('data-seed', 'tooltip');
				args.$input.attr('data-tooltip-side', this.config.tooltip_side);


				if( !$.seed.seedTooltip ) {
					( !args.$input.nextAll('small.error.gform-error').length ) ? ( $('<small>', {'class':'error gform-error'}).text(args.tip || args.tooltip).insertAfter(args.$input, {'dynamic':false}) ) : ( args.$input.nextAll('small.error.gform-error').text(args.tip || args.tooltip) );
				}
			}

			if(args.placeholder) { args.$input.attr('placeholder', ((args.required === true) ? '*' : '') + $('<span>').html(args.placeholder).text() ); }

			if( parseInt(args.maxlength) > 0 ) { args.$input.attr('maxlength', args.maxlength); }
			if( typeof args.min === 'number' ) { args.$input.attr('min', args.min); }
			if( typeof args.max === 'number' ) { args.$input.attr('max', args.max); }
			if( typeof args.size === 'number' ) { args.$input.attr('size', args.size); }

			if(args.random === true && !args.items && !args.value) { args.$input.val( this._randomString() ); }
			if(args.pattern && !args.items) { args.$input.data('pattern', args.pattern); }

			if(args.name == 'update') { this.config.form_event = 'update'; }

			if( args.tie ) {
				var $src = args.$input.add(self.$form.find('[name="'+args.name+'"]:input')).on('change', function() {
					var $tie = self.$form.find('input[name="'+args.tie+'"]');
					if( $tie.get(0).tagName == 'SELECT' ) {
						$tie.find('option').prop('selected', false).removeAttr('selected');
						$tie.find('option[value="'+ $(this).data('name') || $(this).val() +'"]').prop('selected', true);
					}
					else if( $tie.get(0).tagName == 'INPUT' && $tie.attr('type') == 'checkbox' ) {
						$tie.prop('checked', false).removeAttr('checked');
						$tie.filter('[value="'+ $(this).data('name') || $(this).val() +'"]').prop('checked', true);
					}
					else {
						$tie.val( $(this).data('name') || $(this).val() );
					}
				});
			}
		},

//Валидация и отравка формы
		validate: function(validation) {
			var self = this;
			var valid = true;

			this.$form = self.$form || self.el;
			this.$form.find('input[type="submit"]').attr('disabled', 'disabled');
			this.$form.find('.has-error').removeClass('has-error');
			this.$form.find('*[data-error]').removeAttr('data-error');

			$('.div-tip, .tooltip').remove();

			this.$fields = self.$form.find(':input:not(input[type=image], [type=submit])');

//Выполняем валидацию каждого поля и возвращаем логическое значение проверки
			$.each( this.$fields.get().reverse(), function(j, obj) {
//если поле не прошло валидацию, форму не отравляем
				if(!self.validateObj( $(obj) )) { valid = false; }
			});

			if (this.config.debug) { console.log('valid: ', valid); }

			if (!valid && validation) {
				this.$form.find('[type="submit"]').removeAttr('disabled');
				this.valid = false;
				return false;
			}
			else if(valid && this.config.validate == 'only') {
				if(self.config.debug) { console.log('only'); }
				self.valid = true;
				return true;
			}
			else {
				if( this.config.debug ) { console.log('merge'); }

				self.$form.find('input[name="from"]').val(window.location.href);

// если есть объединение полей, то выполним его, учитывая кастомную функцию					
				if( this.config.merge == true ) { (this.config.func.merge) ? (this.config.func.merge)() : this.merge(); }

				if( this.config.func.ajax_custom ) {
					(this.config.func.ajax_custom)(self);
					return false;
				}

				if( this.config.ajax ) {
					this.ajax();
					return false;
				}
			}
			this.valid = true;

			if( !this.config.ajax && self.config.func.ajax_before_send) {
				(self.config.func.ajax_before_send)(self);
			}

			return true;
		},

//Валидация поля формы
		validateObj: function(obj) {
			var self = this;
//дефолтные значения функции, сбрасываем все ошибки для поля
			var valid = true;
			var value = obj.val();
			var name = obj.attr('name');
			var type = obj.attr('data-type');
			var $holder = obj.parent('.input-holder').addClass('has-feedback');
			var $status = $holder.find('.input-status');

			obj.removeAttr('data-error');
			$holder.removeClass('has-success has-error');
			$status.removeClass('fa-remove fa-check');

			if( obj.attr('required') == 'required' && ( obj.is(':visible') || ( obj.attr('type') == 'hidden' && ( type == 'checkbox' || type == 'radio' ) ) ) ) {
				var re = ( obj.data('pattern') ) ? new RegExp(obj.data('pattern'), 'm') : '';
				var error = null;

				if( obj.data('pattern') && !re.test( value )  ) { error = this.config.locale.error.pattern; }

				else if ( type!='select' && ( value == 0 || !value || value=='') && obj.is(':visible') ) { error = this.config.locale.error.required; }

				else if ( name=='pass1' && ( value != self.$form.find('input[name="pass2"]').val() ) ) { error = this.config.locale.error.pass; }
				else if ( name=='pass2' && ( value != self.$form.find('input[name="pass1"]').val() ) ) { error = this.config.locale.error.pass; }

				else if ( ( name=='email' || name=='Email' ) && !self._validateEmail( value ) ) { error = this.config.locale.error.email; }
				else if ( ( name=='phone' || name=='Phone' ) && !self._validatePhone( value ) ) { error = this.config.locale.error.phone; }

				else if ( type=='select' && obj.prop('selectedIndex') == 0 ) { error = this.config.locale.error.option; }

				else if ( type=='password' && value.length < 3 ) { error = this.config.locale.error.pass_length; }

				else if ( type =='file' && name=='photo' ) {
					if( value.search(/[А-Яа-яЁё]/)>=0 ) { error = this.config.locale.error.symbols_file; }
					else if( value.search(/(jpg|gif|jpeg|png)$/i)<0 ) { error = this.config.locale.error.extension; }
				}
				else if ( obj.attr('type') == 'hidden' && ( type == 'checkbox' || type == 'radio' ) ) {
					valid = false;
					$holder.find('input[type="'+type+'"]').each(function(i, el) {
						if( $(this).prop('checked') == true ) valid = true;
					});           
					if(!valid) {
						$holder.addClass('has-error').find('label').each(function() {
							$(this).addClass('has-error').attr('data-error', self.config.locale.error.required).attr('title', self.config.locale.error.option).attr('data-placement', self.config.tooltip_side);
						});           
						$status.addClass('fa-remove');
					}
				}
				else {
					$holder.addClass('has-success');
					$status.addClass('fa-check');

					obj.addClass('valid').attr('data-error')
				}

				if( error != null ) {
					valid = false;
					$holder.addClass('has-error');
					$status.addClass('fa-remove');

					obj.attr('data-error', error);

					if( !$.seed.seedTooltip ) {
						( !obj.nextAll('small.error.gform-error').length ) ? ( $('<small>', {'class':'gform-error error text-danger'}).text(error).insertAfter(obj, {'dynamic':false}) ) : ( obj.nextAll('small.error.gform-error').text(error) );
					}
				}
			}
			else {
				$holder.addClass('has-success');
				$status.addClass('fa-check');

				obj.addClass('valid');
			}

// вешаем обработчик на поле с ошибкой для динамической проверки заполнения данного поля
			if(!valid) {
				this.$form.find('input[type="submit"]').removeAttr('data-title').attr('data-error', this.config.locale.novalidform);

				obj.off('keyup change').on({'keyup change' : function() {
					self.validateObj(obj);
					if( $('.div-tip.has-error').length ) { 
						$('.div-tip.error').remove();
						obj.focus();
					}
				}});
			}
			return valid;
		},

// скролл к элементу в фокусе
		_scrollToObj: function(obj) {
			$('html, body').stop().animate({scrollTop: obj.parent().position().top}, 100, function() { obj.focus() });
		},

// функция сбора данных для отправки
		merge: function() {
			var self = this;
			this.$form.find('input[name="from"]').val(window.location.href);

			this.text = '';
// собираем все данные в поле Text для письма

			if( this.config.letter == 'html' ) { self.delimiter = '<br>'; }
			if( this.config.letter == 'plain' ) { self.delimiter = '\n'; }

			$.each( $(self.$fields).filter(':enabled').not('input[name="from"], input[name="text"], input[name="Text"], [data-type="submit"], [type="reset"], [data-type="reset"], *[data-merge="false"], input[data-type="file"]'), function(j, obj) {
				var $obj = $(obj);
				var valid = true;
				var value = $obj.val();
				var name = $obj.attr('name');
				var title = $obj.attr('data-title') || '';
				var type = $obj.attr('data-type');

				var holder = $obj.parent();

				if( ( type == 'radio' || type == 'checkbox' ) && $obj.attr('type') == 'hidden' ) {
					self.text += title +': ' + self.delimiter;
				}
				else if( ( type == 'radio' || type == 'checkbox' ) && $obj.prop('checked') ) {
					self.text += '- ' + value + self.delimiter;
				}
				else if( ( type == 'radio' || type == 'checkbox' ) && !$obj.prop('checked') ) {
					return;
				}
				else if( type == 'caption') {
					self.text += self.delimiter + '+++' + title + '+++' + self.delimiter;
				}
				else {
					self.text += title + ': ' + value + self.delimiter;
				}
			});

			this.$form.find('input[name="text"]:last, input[name="Text"]:last').val(this.text);
		},

// валидация электронной почты
		_validateEmail: function(email) {
			return /^[^\s]+@([-a-z0-9_]+\.)+[a-z]{2,10}$/i.test(email); //
		},

// валидация телефона
		_validatePhone: function(phone) {
			return /^[\+]?[0-9-\s]{10,13}$/i.test(phone); //////
		},

// генерация рандомной строки
		_randomString: function() {
			var arr = '0123456789abcdefghijklmnopqrstuvwxyz', rnd='';
			for(var i=0; i < this.config.random_length; i++) { rnd += arr.charAt(Math.floor(Math.random() * arr.length)); }
			return rnd;
		},

//Функции ajax отправки формы
		ajax: function() {
			var self = this;

			if( this.config.func.ajax_preserialize ) (this.config.func.ajax_preserialize)(self);

			this.form_data = new FormData( this.$form.get(0) ); 
				                 
			if(this.config.debug) { console.log(this.form_data); }

			$.ajax({
				url: this.$form.attr('action') || window.location.href,
				data: this.form_data,
				dataType:'html',
				type: this.config.method,
				processData: false,
				contentType: false,
				context: this.config.ajax.context || this.$el,
				beforeSend: function() {
					self.$form.find('input[type="submit"]').addClass('btn-loading');

					if(self.config.func.ajax_before_send) {
						(self.config.func.ajax_before_send)(self);
					}
					else {
						$(this).html('');
						$('.tip, .tooltip').remove();
						$('<div class="h2 gform-status status loading"><i class="fa fa-cog fa-spin"></i> <span>'+ self._ajaxHeader('loading') +'</span></div>').appendTo( $(this), {'dynamic':false});
					}
				},
				statusCode : {
					404 : function() {
						console.error(self._name+': Нет такой страницы!');
					},
					503 : function() {
						console.error(self._name+': Страница недоступна!');
					}
				},
       				error: function(data) {
					console.error(self._name+': Произошла неизвестная ошибка!');

					if(self.config.debug) { console.log(data); }

// если задана функция обработки ошибки, запустим ее
					if(self.config.func.ajax_error) {
						(self.config.func.ajax_error)(self, data);
					}
					else {
						$(this).html('');
						$('<div class="h2 gform-status status fail"><i class="fa fa-times"></i> <span>'+ self._ajaxHeader('error') +'</span></div>').appendTo( $(this), {'dynamic':false});					}
				},
				success: function(data, textStatus, jqXHR) {
					if(self.config.debug) { console.log(data); }

					if( jqXHR.status == 200 ) {

// если задана функция обработки удачного ответа, то запустим ее
						if(self.config.func.ajax_success) {
							(self.config.func.ajax_success)(self, data);
						}
						else {
							$(this).html('');
							var ans = $(data);
							if( ans.find('var[error]').length ) {
								$('<div class="h2 gform-status status fail"><i class="fa fa-times"></i> <span>'+ self._ajaxHeader('error', ans) +'</span></div>').appendTo( $(this), {'dynamic':false});

// если задана функция обработки ошибки, внутри удачного ответа, то запустим ее
								if(self.config.func.ajax_success_error) {
									(self.config.func.ajax_success_error)(self, data);
								}
								else if( self.config.reload ) {
									setTimeout(function () {
										self.destroy();
										self.build();
									}, self.config.reload_time);

								}
							}
							else {
								$('<div class="h2 gform-status status success"><i class="fa fa-check"></i> <span>'+ self._ajaxHeader('success') +'</span></div>').appendTo( $(this), {'dynamic':false});
								if( self.config.auth ) {
									window.location.reload(true);
								}
							}
						}
						if(self.config.func.ajax_success_callback) {
							(self.config.func.ajax_success_callback)(self, data);
						}
					}
					else {
						console.log(self._name+': ajax вернул data, но не статус 200', data);
					}
				}
			});
		},

//Функция формирования ответов и загловков при ajax отправке
		_ajaxHeader: function(status, data) {
			return ( status == 'error' && data.length && data.find('var').attr('text') ) ? data.find('var').attr('text') : this.config.locale.interface[status + (( this.config.auth ) ? '_auth' : '')];
		},
		
		destroy : function() {
			this.$el.find('*').remove();
			this._destroy();
		}
	});
	var module = new $.fn.seedCore(name, $.seed[name]);
})(jQuery, window, document);
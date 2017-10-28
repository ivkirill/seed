/* 
 * seed amd Core
 * @version 2.2.0
 * @author Kirill Ivanov
 */
; // предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты».
(function(window, document, undefined) {
	'use strict';
	// добавим заглушку консоли, если ее нет
	if (typeof console == "undefined") {
		window.console = {
			log: function() {},
			error: function() {},
			info: function() {}
		};                                                                                      	
	}

	// Polyfill for "Date.now()"
	if (!Date.now) {
	  Date.now = function now() {
		return new Date().getTime();
	  };
	}
	
	// Polyfill for "matches"
	// For browsers that do not support Element.matches() or Element.matchesSelector(), but carry support for document.querySelectorAll()
	if (!Element.prototype.matches) {
		Element.prototype.matches = 
		Element.prototype.matchesSelector || 
		Element.prototype.mozMatchesSelector ||
		Element.prototype.msMatchesSelector || 
		Element.prototype.oMatchesSelector || 
		Element.prototype.webkitMatchesSelector ||
		function(s) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(s), i = matches.length;
			while (--i >= 0 && matches.item(i) !== this) {}
			return i > -1;            
		};
	}
	
	if (!typeof Promise) {
		return;
	}
	
	// создаем объект seed, если он не существует
	if (!window.seed) {
		window.seed = {};
	}
	
	// дефолтный конфиг проекта
	seed.config = {
		'debug' : false,
		'performance' : false,
		'lazy' : false,
		'scoped': false, // строгая инкапсуляция, инкапсулируем все глобальные переменные внешних модулей в локальные, т.е. например jQuery будет доступен только внутри модулей
		'jquery' : 'jquery.2.1.4',
		'selector' : {
			'lazy' : {},
			'cached': {}
		},
		'amd': {
			'cache': true, // кешируем все зависимости
			'charset': 'UTF-8', // при значении false, скрипты будут загружаться согласно charset страницы
			'path': '/js/seed/seed.libs.js' // URL для конфига плагинов по умолчанию
		},
		'locale': {}, // локализация библиотек ядра
		'defaults' : {}
	};
	
	if( seed.config.performance ) console.info('Start:', performance.now());

	// Helpers
	// вспомогательные методы
	
	// парсинг data-config- атрибутов в объект
	seed._dataset = function(el) {
		var config = {};
		if(!el || el.nodeType != 1) return config;
		
		var attributes = el.attributes;
		if( attributes ) {
			[].forEach.call(attributes, function(attr) {
				if (/^data-config-/.test(attr.name)) {

					var key = attr.name.replace('data-config-','');
					var value = (/^[0-9]+$/.test(attr.value)) ? parseInt(attr.value) : attr.value;
					if( value === 'false' ) value = false;
					if( value === 'true' ) value = true;
					
					if (/-/.test(key)) {
						var keys = key.split('-');
						
						if( !config[keys[0]] ) config[keys[0]] = {};

						if( keys[2] ) {
							if( !config[keys[0][keys[1]]] ) config[keys[0]][keys[1]] = {};
							config[keys[0]][keys[1]][keys[2]] = value;
						}
						else {
							config[keys[0]][keys[1]] = value;
						}
					}
					else {
						config[key] = value;
					}

				}
			});
		}
		
		return config;
	};
		
	// расширяем свойства объекта
	seed.extend = function(obj) {
		obj = obj || {};
		
		// если передан не обьект, вернем пустой обьект
		if( !seed.isObject(obj) ) return {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i]) continue;
			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) {
					var value = arguments[i][key];
					if( value === "true" ) value = true;
					else if( value === "false" ) value = false;
					obj[key] = value;
				}
			}
		}
		
		return obj;
	}

	// уникальные значения массива
	seed.unique = function(arr) {
		var a = [];
		
		// если передан не обьект, вернем пустой обьект
		if( !seed.isArray(arr) ) return a;
		
		for (var i=0, l=arr.length; i<l; i++) {
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '') a.push(arr[i]);
		}
		return a;
	};

	seed.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	}

	seed.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	seed.isFunction = function(func) {
		return Object.prototype.toString.call(func) === '[object Function]';
	}
	
	// реализация DOM Ready
	// готовность DOM
	seed.isReady = false;
	// массив для хранения функций до наступления DOM Ready
	seed.readyArray = [];
	// функция готовности, убиваем если у нас загрузился DOM
	seed.completed = function() {
		document.removeEventListener( "DOMContentLoaded", seed.completed );
		window.removeEventListener( "load", seed.completed );
		seed.isReady = true;
		seed.ready();
	}

	// Ждем когда будет выполенен запрос на seed.ready()
	document.addEventListener( "DOMContentLoaded", seed.completed );
	window.addEventListener( "load", seed.completed );
	
	// биндим событие по DOM Ready
	seed.ready = function(func) {
		// когда массив функций существует и DOM готов
		if( seed.readyArray.length && seed.isReady === true ) {
			// запуск сохраненных функции
			seed.readyArray.forEach(function(func) { func() });
			// очищаем массив функций
			seed.readyArray = [];
			return;
		}

		// если передали функцию
		if( func && seed.isFunction(func) ) {
			// когда массив функций НЕ существует и DOM готов
			// иначе, добавляем функцию в массив функций
			(seed.readyArray.length == 0 && seed.isReady === true) ? func() : seed.readyArray.push(func); 
		}
	}
	
	// Загрузка файла по url
	// Принимает url
	// Возвращает ответ xhr	
	seed.fetch = function(url) {
		// возвращаем новый Promise
		return new Promise(function(resolve, reject) {
			// проверим что пришло на выход
			if( typeof url != 'string' ) {
				reject(Error("Wrong URL type: ", url));
				return false;
			}
			
			// создаем get запрос к серверу
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.onload = function() {
				if (xhr.status == 200) {
					resolve(xhr.response)
				} else {
					reject(Error(xhr.statusText)); // ошибка, отдаем её статус
				}
			}
			
			// отлавливаем ошибки сети
			xhr.onerror = function() {
				reject(Error("Network Error"));
			};			
			
			// Делаем запрос
			xhr.send();
		});
	}
	
	seed.lazy = function(func, selector) {
		// определяе selector для DOM
		var selector = selector || ( typeof this.selector == 'string' && !/^</.test(this.selector) ) ? this.selector : ( ( seed.isObject(this.selector) && typeof this.selector.selector ) ? this.selector.selector : false );

		// если не было передано selector или функции то отключаем функционал
		if( !seed.isFunction(func) || !selector ) return false;
		seed.config.selector.lazy[selector] = func;
		
		return document.querySelectorAll(selector);
	}
	
	// создание наблюдателя
	seed.observe = function() {
		// если браузер не поддерживает функцию обзервера, то это грустно...
		if (!window.MutationObserver) return;
		
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var nodes = mutation.addedNodes;
				nodes = Array.prototype.slice.call(nodes);
				
				// если массив нодов нулевой или состоит из текстового нода, то его пропускаем
				if (nodes.length === 0 || (nodes.length === 1 && nodes.nodeType === 3)) return; 
				
				// если есть нужные нам ноды
				nodes.forEach(function(node) {
					//if( node.matches('[data-config-lazy="false"]') ) console.log('FALSE', node);
					
					// проверяем ноду на соотвествие, нет не подходит, переходим к следующей
					if( node.nodeType !== 1 
						|| node.nodeName == 'JDIV' 
						|| node.nodeName == 'SCRIPT' 
						|| node.nodeName == 'STYLE'
						|| node.matches('[data-config-lazy="false"]')
						|| node.nodeName == 'STYLE'
					) return;

					// нода нам подходим, начинаем её прогонять через список селекторов на соотвествие
					for(var selector in seed.config.selector.lazy) {
						var escapeAttr = seed.config.selector.cached[selector]
							|| (seed.config.selector.cached[selector] = (Object.keys(seed.config.selector.cached).length++) );
					
						// создаем список найденных нодов
						var newNodes = [];
					
						// пушим найденные ноды, исключаем уже инициализированные по селектору и который мы отключили
						if( node.matches(selector) 
							&& !node.matches(('[data-lazy-cached="'+escapeAttr+'"]'))
						) newNodes.push(node);
						
						// найдем дочерние ноды
						var childs = node.querySelectorAll(selector);
						childs = Array.prototype.slice.call(childs);

						// если нет ни дочерних, ни прямых, то завершаем цикл
						if( childs.length == 0 && newNodes.length == 0 ) {
							if( seed.config.performance ) console.info('End:', performance.now());						
							continue;
						}
						
						// если есть добавляем к списку найденных нодов
						if( childs.length ) {
							childs.forEach(function(node) {
								// пушим найденные ноды, исключаем уже инициализированные по селектору и который мы отключили
								if( node.matches(selector) 
									&& !node.matches('[data-config-lazy="false"]')
									&& !node.matches('[data-lazy-cached="'+escapeAttr+'"]')
								) newNodes.push(node);								
							});
						}

						// если ноды все найдены то запускаем связанную с ними функцию
						if(newNodes.length > 0) {
							seed.config.selector.lazy[selector].call(newNodes, selector);
							
							// пометим ноды исполненными
							newNodes.forEach(function(node) {
								node.setAttribute('data-lazy-cached', escapeAttr);
							});
						}
						if( seed.config.performance ) console.info('End:', performance.now());						
					}
				});
   			});
   		});

   		observer.observe(document, {subtree: true, childList: true});
	};
	
	// Расширение фунционала метода
	seed.hook = function(name, extend, obj) {
		if( !obj ) obj = this;
		var title = ( extend.event ) ? name + '_' + extend.event : name;

		// сохраняем метод 
		$.fn[base._name][title] = obj[name] || function() { return this; };

		// заменяем метод на новый
		obj[name] = function() {
			if( seed.isFunction(extend.before) ) (extend.before)(this);
			
			var returned = $.fn[base._name][title].apply(this, arguments);
			
			if( seed.isFunction(extend.after) ) (extend.after)(returned);
			
			return returned;
		};

		if( extend.exec ) obj[name]();
	}

	// Снятие фунционала метода
	seed.unhook = function(name, event, obj){
		var base = this;
		var title = ( event ) ? name+'_'+event : name;
		// восстанавливаем старый метод
		obj[name] = $.fn[base._name][title];
		// удаляем старый метод
		delete $.fn[base._name][title];
	}	
	
	// переопредляем конфиг внешними переменными
	seed.globals = function(obj) {
		var config = seed.config;
		
		// читаем конфиг из data- атрибутов файла script, подключемого для seed.js
		if( obj === 'dataset' ) {
			var scripts = document.querySelectorAll('script');
			Array.prototype.forEach.call(scripts, function(el) {
				if( /main/.test(el.dataset.seed ) ) config = seed.extend(seed.config, seed._dataset( el ) );
			});
		}
		else {
			config = seed.extend(seed.config, obj);
		}
		
		return seed.config = config;
	}
	
	// текущее состоянии загрузки
	seed.state = 'loading';
	
	// зарезервированные имена для модулей
	seed._reserved = ['filter', 'selector', 'items'];
	
	// инициалиация ядра Seed
	seed.init = function() {
		seed.core = {};
		if (seed.config.debug) console.info('%cINIT', 'background-color: #409f00; font-weight: bold; padding: 2px 10px; color:#fff; display:block; width: 100%');
		
		// обновляем глобальный конфиг из dataset для основного включения скрипта (точки входа)
		seed.globals('dataset');
		
		// определяем модуль с основными библиотеками
		if( seed.config.amd.path ) {
			seed.amd._include(seed.config.amd.path).then(function() {
				// создаем функцию для исполнения внешнего в нашей области видимости
				//(seed.amd._exec({source: source}))();

				// определяем библиотеки
				seed.amd._libs(seed.libs);
				load();
			});
		}
		else {
			// библиотек нет, грузим модули
			load();
		}

		function load() {
			seed.ready(function() {
				seed.state = 'ready';
				seed.amd._init();

				// запускаем наблюдатель
				if (seed.config.lazy) seed.observe();
			})
		};
		
		return seed;
	}	
	
	// amd функционал
	seed.amd = {
		modules : [], // модули, которые были определены
		defined : [], // ключи модулей (имена), которые были определены
		required : [], // ключи модулей (имена), которые были запрошены
		storage : [], // возвращаемые данные от модулей
		pending : {} // массив промисов ожидающих загрузки модулей
	};
	 	
	// amd. Запрос модуля
	// Принимает имя модуля, callback-функцию
	seed.amd.require = function(depents, callback) {
		if (seed.config.debug) console.log('%cREQUIRE:', 'color: #3e3;', 'запрашиваем модуль', depents);
		
		// создаем объект конфигурации модуля
		var config = {
			depents : []
		}
		
		// если первый аргумент строка или массив то мы нашли модули, которые требуются
		if (seed.isArray(arguments[0]) ) config.depents = arguments[0];
		else if ( typeof arguments[0] == 'string' ) config.depents.push(arguments[0]);
		else return Error('Не могу определить имя запрашиваего модуля!', seed);

		// определяем callback-функцию
		config.callback = ( seed.isFunction(arguments[1]) ) ? arguments[1] : function() { };
		var module = seed.amd.define('seed'+Date.now(), config.depents, config.callback, { global : true });
		
		return (config.depents.length === 1) ? seed.amd._restore(config.depents) : module;
	}
	
	// amd. Определение модуля
	// Принимает все аргументы, при необходимости заполняем дефолтными значениями. Далее передаем в функцию обновления
	// Возвращает ссылку на модуль
	seed.amd.define = function(name, depents, callback, data) {
		if (seed.config.debug) console.log('%cDEFINE:', 'color: #090;', 'определяем модуль', name);
		
		//Если первый полученный аргумент Объект и второй функция или не передан, то значит мы получили конфиг и обработаем его через специальную функцию.
		if (seed.isObject(arguments[0])) {
			seed.amd._libs(arguments[0], arguments[1]);
			return false;
		}
		//Если первый аргумент не является строкой, то сообщаем об ошибке и возвращаем false
		else if (typeof arguments[0] !== 'string') {
			console.error('Не задано имя для модуля!');
			return false;
		}
		//Если первый аргумент является зарезервированным
		else if (typeof arguments[0] === 'string' && arguments[0] in seed._reserved) {
			console.error('Слово '+ arguments[0] +' зарезервировано, используйте другое имя для модуля!');
			return false;
		}
		else {
			// создаем объект конфигурации модуля
			var config = {};

			// парсим все входящие аргументы функции, определяем их тип и заполняем внутренний объект аргументов
			for (var i = 0, l = arguments.length; i < l; i++) {
				var argument = arguments[i];

				// если аргумент является строкой, то значит это название модуля (name)
				if (typeof argument === 'string') config.name = argument;

				// если аргумент является массивом, то значит это массив зависимостей модуля (depents)
				else if ( seed.isArray(argument) ) config.depents = argument;

				// если аргумент является функцией, то значит это callback-функция (callback)
				else if ( seed.isFunction(argument) ) config.callback = argument;

				// если аргумент является обьектом, то значит это обьект дополнительных данных модуля
				else if ( seed.isObject(argument) ) config.data = argument;
			}

			// если аргументы не нашли, то поставим их значение по умолчанию равным false
			if (!config.depents) config.depents = [];
			if (!config.callback) config.callback = function() {};
			
			if (!config.data) {
				config.data = {
					inited : false,
					require : true,
					plugin : false
				}
				if( /\.js$/.test(config.name)  ) config.data.path = config.name;
			} else {
				config.data.inited = ( config.data.inited ) ? config.data.inited : false;
				config.data.require = (
					(config.data.plugin === true && seed.state != 'ready') // || (seed.config.lazy === true && config.data.selector)
				) ? false : true;
			}
			
			var module; 
			// находим модуль, если такого модуля нет - создаем новый пустой
			if( seed.amd.modules[config.name] ) {
				module = seed.amd.modules[config.name]
				module.data.require = true;
			}
			// модуль уже был определен ранее, и значит он теперь вызывается, передаем ставим require = true;
			else {
				module = seed.amd.modules[config.name] = {
					name: config.name,
					depents: config.depents,
					callback: config.callback,
					data: config.data,
					values: {},
					value: null,
					source: null
				};
			}
			
			// добавляем имя модуля в массив определенных
			seed.amd.defined.push(module.name);
			module = seed.amd._update(module, config);
			
			// если в конфиге модуля есть определенный селектор и включена функция lazy
			if(module.data.selector && seed.config.lazy === true) seed.amd._lazyReady(module.name, module.data.selector);
			return (seed.state == 'ready') ? (( config.data.plugin !== true ) ? seed.amd._pending(module) : module) : module;
		}
	}
	
	// amd. Обновление конфига модуля
	// Принимает модуль и новый конфиг
	// Возвращает модуль
	seed.amd._update = function(module, config) {
		if( !module ) return Error('Модуль не передан');
		if (seed.config.debug) console.log('%c_UPDATE:', 'color:#FDB950', 'обновляем конфиг для модуля', module.name);

		// объект конфига
		var config = config || {};
			
		// если переданы зависимости, до добавим их к текущим
		if ( seed.isArray(config.depents) ) module.depents = seed.unique( module.depents.concat(config.depents) );
		
		// если передана callback-функция, то обновим её
		if ( seed.isFunction(config.callback) ) module.callback = module.callback;
		
		//обновляем общие данные
		if ( seed.isObject(config.data) ) module.data = seed.extend(module.data, config.data);
		if ( config.source ) module.source = config.source;
		if ( config.values ) module.values = config.values;
		
		if (seed.config.debug) console.log('  Новый конфиг', module);
		return module;
	}

	// amd. Ожидание модуля
	// Принимает модуль
	// Возвращает обещание, старое или новое, в зависимости от того первый это вызов модуля или нет
	seed.amd._pending = function(module) {
		var promise = ( seed.amd.pending[module.name] ) ? seed.amd.pending[module.name] : (seed.amd.pending[module.name] = seed.amd._call(module));
		if (seed.config.debug) console.log('_pending', module.name, module, promise);
		return promise;
	}
	
	// amd. Вызов модуля
	// Принимает модуль
	// Определяет зависимости, вызывает цепочку или/и
	// Возвращает обещание
	seed.amd._call = function(module) {
		if (seed.config.debug) console.info('%c_call:', 'color: #840000; font-weight: bold', 'вызов модуля', module.name, 'с зависимостями', module.depents);

		return new Promise(function(resolve, reject) {
			// если модуль необходим и имеет зависимости
			if (module.data.inited === false && module.data.require === true && module.depents.length > 0) {
				if (seed.config.debug) console.log('Модуль ', module.name, 'необходим. Имеет зависимости');
				
				/*
				 проверим массив зависимостей, если в нем есть значения (0, null, false), то такой модуль не будем загружать
				 массив зависимостей может содержать не только имена модулей, от который зависит текущий модуль,
				 но и, булевые значения, число элементов DOM, test по регулярному выражения - любое проверочное уравнение, которое возвращает true\false.
				
				 если существует хотя бы одна зависимость, которая обращается в false, то выходим из цикла,
				 функция some при этом вернет true (forEach же продолжил бы цикл до последнего элемента)
				*/
				var check = !module.depents.some(function(depent) {
					// если зависимость строка, считаем это именем и проверяем определен ли такой модуль
					return !((typeof depent === 'string') ? seed.amd.modules[depent] : depent); 
				});
				
				if (check === true) {
					seed.amd._chain(module).then(function() {
						seed.amd._get(module).then(function(module) {
							resolve(module);
							if (seed.config.debug) console.info('%cМодуль полностью загружен и исполнен', 'color: #F00; font-weight: bold', module.name);
							if( seed.config.performance ) console.info('Loaded:', performance.now());
						}, function(reject) {
							console.error('Неудалось загрузить модуль', module, reject);
							reject;
						});
					}, function(module) {
						if (seed.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку');
						resolve(module);
					}).catch(function(e) {
						console.error(e);
					});
				}
				else {
					if (seed.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку', check);
					resolve(module);
				}
			}
			
			// если модуль необходим и не имеет зависимостей
			else if (module.data.inited === false && module.data.require === true) {
				if (seed.config.debug) console.log('Модуль ', module.name, 'необходим. Зависимостей нет');
				seed.amd._get(module).then(function(module) {
					resolve(module);
					if( seed.config.debug) console.info('%cМодуль полностью загружен и исполнен', 'color: #F00; font-weight: bold', module.name);
					if( seed.config.performance ) console.info('Loaded:', performance.now());
				}, function(reject) {
					console.error('Неудалось загрузить модуль', module, reject);
					reject(module);
				}).catch(function(e) {
					console.info('Поймана ошибка: ', e);
				});
			}

			// если никакое условние не сработало
			else {
				if (seed.config.debug) console.info('Модуль ', module.name, 'не требуется или уже загружен', module);
				// отклоняем заргрузку модуля, и его зависимостей
				resolve();
			}
		});
	}

	// amd. Вызов цепочки
	// Принимает модуль, определяет его зависимости
	// Возвращает обещание
	seed.amd._chain = function(module) {
		if (seed.config.debug) console.log(' Зависимости модуля', module.name, 'прошли проверку');

		// создаем обещаения для всего списка зависимостей модуля
		return Promise.all(
			module.depents.map(function(depent) {
				if( typeof depent === 'string' ) {
					if (seed.amd.modules[depent]) {
						if (seed.config.debug) console.log(' Зависимость модуля', module.name + '. Модуль', depent, 'необходим для загрузки');

						// обновим модуль зависимости, передав новый конфиг если требуется
						if( seed.amd.modules[depent].data.require !== true ) seed.amd._update( seed.amd.modules[depent], { data : { require : true } })
						
						return seed.amd._pending(seed.amd.modules[depent]);
					}
					// если такой модуль не был определен вообще 
					else {
						console.error('Проверьте зависимость от модуля', depent, '. Такой модуль не был определен в системе!');
						return Promise.reject();
					}
				}
				else if(depent) {
					return Promise.resolve();
				}
				else {
					return Promise.reject();
				}
			})
		);
	}
	
	// amd. Определение списка библиотек
	seed.amd._libs = function(config) {
		if (seed.config.debug) console.log('%c_libs', 'color: #00f; font-weight: bold', 'определяем конфиг seed');
		
		// поочередно определяем переданные в объекте модули
		for (var name in config) {
			if (config.hasOwnProperty(name)) {
				var data = config[name];
				var callback = data.callback;
				delete data.callback;
				
				// если модуль уже определен в системе, обновим его новым данными
				if( seed.amd.modules[name] ) {
					seed.amd._update(seed.amd.modules[name], {
						depents : data.depents,
						callback : callback,
						data : seed.extend(data, {plugin : true})
					});
				}
					
				// если модуль не определен, то определим
				else {
					seed.amd.define(name, data.depents, callback, seed.extend(data, {plugin : true}));
				}
			}
		}
	};

	// amd. Получение библиотеки по url
	// Принимает модуль и адрес загрузки
	// Возвращает модуль
	seed.amd._get = function(module, url) {
		if( !module ) return Error('Модуль не передан');
		if (seed.config.debug) console.log('%c_GET', 'color: #00f; font-weight: bold', module.name, module);
	
		return new Promise(function(resolve, reject) {
            // URL модуля
            var url = url || module.data.path || false;
			
				// Если url модуля есть, то будем его подгружать
				if (url) {
					seed.amd._include(url).then(function() {
						if (seed.config.debug) console.info('   Внешний файл для модуля', module.name, 'загружен');
						// вызываем _restore метод
						resolve(seed.amd._callback(module));
					}, function(error) {
						console.error("Ошибка!", error);
						// модуль не загружен
						reject(error, module);
					});
				}
				// Если url нет
				else resolve(seed.amd._callback(module));
			/*
			if( seed.config.scoped === false ) {
			
			}
			// если включена строгая инкапсуляция
			else {
				// Если url модуля есть, то будем его подгружать
				if (url) {
					// получаем source модуля по url
					seed.fetch(url).then(function(source) {
						if (seed.config.debug) console.info('   Внешний файл для модуля', module.name, 'загружен');
						// обновим модуль, сохраним source
						seed.amd._update(module, { source: source });					
						
						// вызываем _exec метод
						resolve(seed.amd._exec(module));
					}, function(error) {
						console.error("Ошибка!", error);
						// модуль не загружен
						reject(error, module);
					});
					
				}
				// Если url нет
				else resolve(seed.amd._exec(module));
			}
			*/
        });
	}
	
	// amd. Прокидывание переменных из callback-функцию в зависимые модули
	// Принимает модуль
	// Возвращает модуль
	seed.amd._callback = function(module) {
		if (seed.config.debug) console.log('   _callback', module.name, module);

		// текущее хранилище модуля
		var storage = seed.amd._storage(module);
		// все значения по зависмостям
		var args = seed.amd._arguments(storage);
		// исполняем callback функцию
		storage[module.name] = module.callback.apply(storage, args);
		// сохраняем ответ функции
		seed.amd._save(module, storage[module.name]);
		// обновим конфиг модуля
		return seed.amd._update(module, {values : storage, value: storage[module.name]});
	}
	
	// amd. Возращает из хранилища все данные по родительским модуялм
	// Принимает модуль
	// Возвращает обьект
	seed.amd._storage = function(module) {
		if (seed.config.debug) console.log(' _storage', module.name, module.depents);
		var storage = {};
		
		if(module) {
			module.depents.filter(function(value) {
				return (typeof value === 'string');
			}).forEach(function(module) {
				storage = seed.extend(storage, seed.amd.modules[module].values);
			});
			
			if( module.data.selector ) {
				storage.items = document.querySelectorAll(module.data.selector);
				storage.selector = module.data.selector;
			}
		}
		
		return storage;
	}
	
	// amd. Возращает списко всех значений из хранилища в формате
	// Принимает модуль
	// Возвращает обьекты	
	seed.amd._arguments = function(storage) {
		return Object.keys(storage).map(function (key) {
			return (key != 'items' && key != 'selector' && storage[key] !== undefined ) ? storage[key] : null;
		}).filter(function (key) {
			return key !== null;
		});
	}
	
	// amd. Сохраняет значение, которое вернула функция модуля
	// Принимает модуль и значение
	seed.amd._save = function(module, value) {
		seed.amd.storage[module.name] = (value) ? value : null;
	}
	
	// amd. Сохраняет значение, которое вернула функция модуля
	// Принимает массив зависимостей
	// Возвращает либо одно значение, либо обьект значений
	seed.amd._restore = function(depents) {
		return new Promise(function(resolve, reject) {
			if (!seed.isArray(depents) || depents.length !== 1) resolve(false);
			
			if( depents.length === 1 ) {
				var value = seed.amd.storage[depents[0]];
				if( value !== undefined ) resolve(value);
			}
		});
	}
	
	// amd. Оборачиваем внешний код
	// Принимает исходный код
	// Создает анонимную функцию, загрженный код помещается в тело функции, ниже добавляется тело callback-функции модуля
	// Возвращает анонимную функцию
	seed.amd._exec = function(module) {
		if (seed.config.debug) console.log(' _exec', module.name, module.depents);
			//console.log('exec', module);
		
	
			// текущий callback модуля, который мы задали
			
			// функцию в строку
			var func = (module.callback || function() {}).toString();
			// тело функции
			var func_body = func.slice(func.indexOf("{") + 1, func.lastIndexOf("}"));//.replace('return jQuery', 'return jQuery.noConflict(true)');
			// аргументы функции
			var func_args = func.slice(func.indexOf("(")+1, func.indexOf(")")) || '';
			// подгруженные внешние исходники
			var source = module.source || '';
			
			if( !func_args && module.depents.length > 0 ) {
				// сохраним хранилище для текущего модуля
				var storage = seed.amd._storage(module);
				var args = seed.amd._arguments(storage);
				console.log('exec depents', module, storage, args);
				
				module.depents.forEach(function(name) {
					console.log('RESULT', seed.amd.modules[name].result);
					
					if(seed.amd.modules[name].result) func_args += seed.amd.modules[name].result + ',';
				});
			}
			
			// новый callback с оберткой инкапсуляции
			module.callback = function() {
				var module = eval('(function('+func_args+') {"use strict"; console.log("CCC", this, arguments);  '+ source + '\n' + func_body + '}).apply(this, arguments);');
				// если модуль jQuery, то отключаем его от глобального использования
				if( window.jQuery ) module.noConflict(true);
				return module;
			};
			
			return seed.amd._callback(module);
	}

	// amd. Создает script и добавляет его в шапку
	// Принимает исходный код
	// Создает тег script, загрженный код помещается в тег
	// Возвращает объект DOM
	seed.amd._include = function(url, module) {
		if (seed.config.debug) console.log(' _include', url);
		
		return new Promise(function(resolve, reject) {		
			var n = document.getElementsByTagName("head")[0];
			var s = document.createElement('script');
			var d = false;
			
			s.type = 'text/javascript';
			s.defer = 'defer';
			s.src = url + ((!seed.config.amd.cache) ? '?nocache' : '');
			
			if( seed.config.amd.charset ) s.charset = seed.config.amd.charset;

			s.onload = s.onreadystatechange = function(){
				if ( !d && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") ) {
					d = true;
				   
					if (seed.config.debug) console.info('Модуль ' + url + ' загружен');

					// IE memory leak
					//s.onload = s.onreadystatechange = null;
					//n.removeChild( s );
					
					resolve();
				}
			};			
			
			n.appendChild(s);
		});
	}
	
	// amd. Создает связку между селектором и модулем
	// Принимает имя модуля и селектор
	// создает пряму связь между селектором и модулем
	seed.amd._lazyReady = function(module, selector) {
		seed.config.selector.lazy[selector] = function(selector) {
			if( document.querySelector(selector) ) seed.amd.modules[module].data.require = true;
			if( seed.amd.modules[module].data.require === true ) return seed.amd._pending( seed.amd.modules[module] );
		};
	}
	
	// amd. Вызов всех определенных модулей
	/* Инициализируем все модули, которые были определены ранее */
	seed.amd._init = function() {
		if (seed.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Запуск общей инициалзиации определенных модулей');

		return Promise.all(
			seed.amd.defined.map(function(module) {
				var selector = seed.amd.modules[module].data.selector;
				
				// если в DOM находятся селекторы зависимостей библиотек, то ставим модули нужными
				if( document.querySelector(selector) ) seed.amd.modules[module].data.require = true;
				if( seed.amd.modules[module].data.require === true ) return seed.amd._pending( seed.amd.modules[module] );
			})
		).then(function(resolve) {
			if (seed.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Все модули проиницилизированы', resolve);
			if( seed.config.performance ) console.info('End:', performance.now());
		}, function(reject) {
			console.error('Ошибка загрузки модулей', reject);
		});
	}

	// ярлыки
	if (!window.define) window.define = seed.amd.define;
	if (!window.require) window.require = seed.amd.require;
	
	window.seedLazy = function(func) {
		seed.lazy.apply(this, func);
	}
	
	NodeList.prototype.seedLazy = window.seedLazy;

	return seed.init();
})(window, document);
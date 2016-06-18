/* 
 * seed AMD Core
 * @version 2.0.27
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

	// создаем объект seed, если он не существует
	if (!window.seed) {
		window.seed = {};
		seed = window.seed;
	}
	
	// дефолтный конфиг проекта
	seed.config = {
		'debug' : false,
		'performance' : false,
		'jquery' : 'jquery.2.1.4',
		'AMD': {
			'cache': true,
			'charset': 'UTF-8', // при значении false, скрипты будут загружаться согласно charset страницы
			'libs_path': '/js/seed/seed.config.js' // URL для конфига плагинов по умолчанию
		},
		'locale': {}, // локализация библиотек ядра
		'defaults' : {}
	};

	if( seed.config.performance ) console.info('Start:', performance.now());

	// Helpers
	// вспомогательные методы
	
	// расширяем свойства объекта
	seed.extend = function(obj) {
		obj = obj || {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i]) continue;
			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) obj[key] = arguments[i][key];
			}
		}
		return obj;
	}

	// уникальные значения массива
	seed.unique = function(arr) {
		var a = [];
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
	
	// биндим событие по domReady
	seed.ready = function(func) {
		if (document.readyState != 'loading') func();
		else document.addEventListener('DOMContentLoaded', func);
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

	// Расширение фунционала метода
	seed.hook = function(name, func, obj) {
		if( !obj ) { obj = this; }

		var title = ( func.event ) ? name+'_'+func.event : name;
		// console.log('hook',$.fn[base._name], obj, name, func, title);

		// сохраняем метод 
		$.fn[base._name][title] = obj[name] || function() { return this; };

		//console.log( $.fn[base._name][title], base._name, title );

		// заменяем метод на новый
		obj[name] = function() {
			if( $.isFunction(func.before) ) {
				(func.before)(this);
			}
			
			var returned = $.fn[base._name][title].apply(this, arguments);
			
			if( $.isFunction(func.after) ) {
				(func.after)(returned);
			}
			
			return returned;
		};

		if( func.exec ) obj[name]();
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
		return seed.config = seed.extend(seed.config, obj);
	}
	
	seed.STATE = 'loading';	
	
	// инициалиация ядра Seed
	seed.init = function() {
		seed.core = {};

		if (seed.config.debug) console.info('%cINIT', 'background-color: #409f00; font-weight: bold; padding: 2px 10px; color:#fff; display:block; width: 100%');
		
		var corelibs = new Promise(function(resolve, reject) {
			// определяем модуль с основными библиотеками
			if( seed.config.AMD.libs_path ) {
				seed.AMD._include(seed.config.AMD.libs_path).then(function(source) {
					// создаем функцию для исполнения внешнего в нашей области видимости
					(seed.AMD._exec({source: source}))();

					seed.AMD._libs(seed.libs).then(function(callback) {
						// библиотеки определены
						resolve();
					});
				});
			}
			else {
				// библиотек нет, грузим модули
				resolve();
			}
		});
		
		corelibs.then(function(resolve) {
			seed.STATE = 'ready';
			seed.AMD._init();
		});
		
		return seed;
	}	
	
	// AMD функционал
	seed.AMD = {};
	// модули, которые были определены
	seed.AMD.modules = [];
	// ключи модулей (имена), которые были определены
	seed.AMD.defined = [];
	// ключи модулей (имена), которые были запрошены
	seed.AMD.required = [];
	// массив промисов ожидающих загрузки модулей
	seed.AMD.pending = {};
	 	
	// AMD. Запрос модуля
	// Принимает имя модуля, callback-функцию
	seed.AMD.require = function(depents, callback) {
		if (seed.config.debug) console.log('%cREQUIRE:', 'color: #3e3;', 'запрашиваем модуль', depents);
		
		// создаем объект конфигурации модуля
		var config = {}	
		config.depents = [];
		
		// если первый аргумент строка или массив то мы нашли модули, которые требуются
		if (seed.isArray(arguments[0]) ) config.depents = arguments[0];
		else if ( typeof arguments[0] == 'string' ) config.depents.push(arguments[0]);
		else return Error('Не могу определить имя запрашиваего модуля!', seed);

		// определяем callback-функцию
		config.callback = ( seed.isFunction(arguments[1]) ) ? arguments[1] : function() { };

		return seed.AMD.define('seed'+Date.now(), config.depents, config.callback, { global : true });			
	}
	
	// AMD. Определение модуля
	// Принимает все аргументы, при необходимости заполняем дефолтными значениями. Далее передаем в функцию обновления
	// Возвращает ссылку на модуль
	seed.AMD.define = function(name, depents, callback, data) {
		if (seed.config.debug) console.log('%cDEFINE:', 'color: #090;', 'определяем модуль', name);
		
		//Если первый полученный аргумент Объект и второй функция или не передан, то значит мы получили конфиг и обработаем его через специальную функцию.
		if (seed.isObject(arguments[0])) {
			return seed.AMD._libs(arguments[0], arguments[1]);
		}
		//Если первый аргумент не является строкой, то сообщаем об ошибке и возвращаем false
		else if (typeof arguments[0] !== 'string') {
			console.error('Не задано имя для модуля!');
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
				else if ( seed.isObject(argument) /* typeof value === 'object' пропустит null */ ) config.data = argument;
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
				if( /\.(css|js)$/.test(config.name)  ) config.data.path = config.name;
			} else {
				config.data.inited = ( config.data.inited ) ? config.data.inited : false;
				config.data.require = ( config.data.plugin === true ) ? false : true;
			}
			
			// находим модуль, если такого модуля нет - создаем новый пустой.
			var module = (seed.AMD.modules[config.name]) ? (seed.AMD.modules[config.name]) : (seed.AMD.modules[config.name] = {
				name: config.name,
				depents: config.depents,
				callback: config.callback,
				data: config.data,
				values: {},
				source : null
			});
			
			// добавляем имя модуля в массив определенных
			seed.AMD.defined.push(module.name);
			module = seed.AMD._update(module, config);
			
			return (seed.STATE == 'ready') ? (( config.data.plugin !== true ) ? seed.AMD._pending(module) : module) : module;
		}
	}
	
	// AMD. Обновление конфига модуля
	// Принимает модуль и новый конфиг
	// Возвращает модуль
	seed.AMD._update = function(module, config) {
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
		
		if (/\.(css)$/.test(module.data.path)) module.data.type = 'html';
		if (seed.config.debug) console.log('  Новый конфиг', module);
		return module;
	}

	// AMD. Ожидание модуля
	// Принимает модуль
	// Возвращает обещание, старое или новое, в зависимости от того первый это вызов модуля или нет
	seed.AMD._pending = function(module) {
		var promise = ( seed.AMD.pending[module.name] ) ? seed.AMD.pending[module.name] : (seed.AMD.pending[module.name] = seed.AMD._call(module));
		if (seed.config.debug) console.log('_pending', module.name, module, promise);
		return promise;
	}
	
	// AMD. Вызов модуля
	// Принимает модуль
	// Определяет зависимости, вызывает цепочку или/и
	// Возвращает обещание
	seed.AMD._call = function(module) {
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
					return !((typeof depent === 'string') ? seed.AMD.modules[depent] : depent); 
				});
				
				if (check === true) {
					seed.AMD._chain(module).then(function() {
						seed.AMD._get(module).then(function(module) {
							resolve(module);
							if (seed.config.debug) console.info('%cМодуль полностью загружен и исполнен', 'color: #F00; font-weight: bold', module.name);
							if( seed.config.performance ) console.info('Loaded:', performance.now());
						}, function(reject) {
							console.error('Неудалось загрузить модуль', module, reject);
							reject(module);
						});
					}, function(module) {
						if (seed.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку');
						resolve(module);
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
				seed.AMD._get(module).then(function(module) {
					resolve(module);
					if (seed.config.debug) console.info('%cМодуль полностью загружен и исполнен', 'color: #F00; font-weight: bold', module.name);
					if( seed.config.performance ) console.info('Loaded:', performance.now());
				}, function(reject) {
					console.error('Неудалось загрузить модуль', module, reject);
					reject(module);
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

	// AMD. Вызов цепочки
	// Принимает модуль, определяет его зависимости
	// Возвращает обещание
	seed.AMD._chain = function(module) {
		if (seed.config.debug) console.log(' Зависимости модуля', module.name, 'прошли проверку');

		// создаем обещаения для всего списка зависимостей модуля
		return Promise.all(
			module.depents.filter(String).map(function(depent) {
				if (seed.AMD.modules[depent]) {
					if (seed.config.debug) console.log(' Зависимость модуля', module.name + '. Модуль', depent, 'необходим для загрузки');
				
					// обновим модуль зависимости, передав новый конфиг если требуется
					if( seed.AMD.modules[depent].data.require !== true ) seed.AMD._update( seed.AMD.modules[depent], { data : { require : true } })
						
					return seed.AMD._pending(seed.AMD.modules[depent]);
				}
				// если такой модуль не был определен вообще 
				else {
					console.error('Проверьте зависимость от модуля', depent, '. Такой модуль не был определен в системе!');
					return Promise.reject();					
				}
			})
		);
	}
	
	// AMD. Определение списка библиотек
	seed.AMD._libs = function(config, callback, require) {
		if (seed.config.debug) console.log('%c_libs', 'color: #00f; font-weight: bold', 'определяем конфиг seed');
		
		return new Promise(function(resolve, reject) {
			// поочередно определяем переданные в объекте модули
			for (var name in config) {
				
				if (config.hasOwnProperty(name)) {
					var data = config[name];
					var callback = data.callback;
					delete data.callback;
					
					// если модуль уже определен в системе, обновим его новым данными
					if( seed.AMD.modules[name] ) {
						seed.AMD._update(seed.AMD.modules[name], {
							depents : data.depents,
							callback : callback,
							data : seed.extend(data, {plugin : true})
						});
					}
					
					// если модуль не определен, то определим
					else {
						seed.AMD.define(name, data.depents, callback, seed.extend(data, {plugin : true}));
					}
				}
			};

			// после определения всех модулей, запускаем callback-функцию, если она есть
			resolve(callback);
		});				
	};

	// AMD. Получение библиотеки по url
	// Принимает модуль и адрес загрузки
	// Возвращает модуль
	seed.AMD._get = function(module, url) {
		if( !module ) return Error('Модуль не передан');
		if (seed.config.debug) console.log('%c_GET', 'color: #00f; font-weight: bold', module.name, module);
	
		return new Promise(function(resolve, reject) {
            // URL модуля
            var url = url || module.data.path || false;
			
            // Если url модуля есть, то будем его подгружать
            if (url) {
				seed.AMD._include(url).then(function(source) {
					if (seed.config.debug) console.info('   Внешний файл для модуля', module.name, 'загружен');
					// обновим модуль
					seed.AMD._update(module, { source: source });

					// вызываем _restore метод
					resolve(seed.AMD._callback(module));
				}, function(error) {
					console.error("Ошибка!", error);
					// модуль не загружен
					reject(error, module);
				});
            }

            // Если url нет
            else {
				resolve(seed.AMD._callback(module));
            }
        });
	}
	
	// AMD. Прокидывание переменных из callback-функцию в зависимые модули
	// Принимает модуль
	// Возвращает модуль
	seed.AMD._callback = function(module) {
		if (seed.config.debug) console.log('   _callback', module.name, module);
		
		// сохраним хранилище для текущего модуля
		var storage = seed.AMD._storage(module);
		//storage[module.name] = (seed.AMD._exec(module))(storage);
		storage[module.name] = module.callback.apply(storage);
		
		// обновим конфиг модуля
		return seed.AMD._update(module, {values : storage});
	}
	
	// AMD. Возращаем из хранилища все данные по родительским модуялм
	// Принимает модуль
	// Возвращает обещание
	seed.AMD._storage = function(module) {
		if (seed.config.debug) console.log(' _storage', module.name, module.depents);
		var storage = {};
		
		if(module) {
			module.depents.filter(String).forEach(function(module) {
				storage = seed.extend(storage, seed.AMD.modules[module].values);
			})
		}
		
		return storage;
	}	

	// AMD. Оборачиваем внешний код
	// Принимает исходный код
	// Создает анонимную функцию, загрженный код помещается в тело функции, ниже добавляется тело callback-функции модуля
	// Возвращает анонимную функцию
	seed.AMD._exec = function(module) {
		if (seed.config.debug) console.log(' _exec', module.name, module.depents);

		var func = (module.callback || '').toString();
		var callback = func.slice(func.indexOf("{") + 1, func.lastIndexOf("}"));
		return new Function('args','return (function(args) { seed.ready(function() {'+ (module.source || '') + '\n' + callback + '}) })(args)');
	}

	// AMD. Создает script и добавляет его в шапку
	// Принимает исходный код
	// Создает тег script, загрженный код помещается в тег
	// Возвращает объект DOM
	seed.AMD._include = function(url, module) {
		if (seed.config.debug) console.log(' _include', url);
		
		return new Promise(function(resolve, reject) {		
			var n = document.getElementsByTagName("head")[0];
			var s = document.createElement('script');
			
			s.type = 'text/javascript';
			//s.innerHTML = module.source;
			s.src = url;
			
			if( seed.config.AMD.charset ) s.charset = seed.config.AMD.charset;
			
			n.appendChild(s);
			
			s.onload = function() {
				if (seed.config.debug) console.info('Модуль ' + url + ' загружен');
				resolve();
			}
		});
	}
	
	
	// AMD. Вызов всех определенных модулей
	/* Инициализируем все модули, которые были определены ранее */
	seed.AMD._init = function() {
		if (seed.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Запуск общей инициалзиации определенных модулей');
		
		return Promise.all(
			seed.AMD.defined.map(function(module) {
				if( seed.AMD.modules[module].data.require === true ) return seed.AMD._pending( seed.AMD.modules[module] );
			})
		).then(function(resolve) {
			if (seed.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Все модули проиницилизированы', resolve);
			if( seed.config.performance ) console.info('End:', performance.now());
		}, function(reject) {
			console.error('Ошибка загрузки модулей', reject);
		});
	}
	
	// обратная совместимость с seed 1.0
	/*
	if (!window.$) {
		window.$ = {};

		$.define = seed.AMD.define;
		$.require = seed.AMD.require;
	}
	*/

	// ярлыки
	if (!window.define) window.define = seed.AMD.define;
	if (!window.require) window.require = seed.AMD.require;

	return seed.init();
})(window, document);
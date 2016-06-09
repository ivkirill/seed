/* 
 * Berry Core
 * @version 2.0.0
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

	// создаем объект berry, если он не существует
	if (!window.berry) {
		window.berry = {};
		berry = window.berry;
	}
	
	// дефолтный конфиг проекта
	berry.config = {
		'debug' : true,
		'AMD': {
			'cache': true,
			'charset': 'UTF-8', // при значении false, скрипты будут загружаться согласно charset страницы
			'plugins_path': '/js/berry/berry.config.js' // URL для конфига плагинов по умолчанию
		}
	};

	// Helpers
	// вспомогательные методы
	
	// расширяем свойства объекта
	berry.extend = function(obj) {
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
	berry.unique = function(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++) {
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '') a.push(arr[i]);
		}
		return a;
	};

	berry.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	}

	berry.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	berry.isFunction = function(func) {
		return Object.prototype.toString.call(func) === '[object Function]';
	}
	
	berry.ready = function(func) {
		if (document.readyState != 'loading') func();
		else document.addEventListener('DOMContentLoaded', func);
	}

	// AMD функционал
	// модули, которые были определены
	berry.modules = [];
	// ключи модулей (имена)
	berry.defined = [];
	// массив промисов ожидающих загрузки модулей
	berry.pending = [];
	// начальное состояние загрузки
	berry.STATE = 'loading';
	
	// AMD. Запрос модуля
	/*
	berry.require = function(depents, callback) {
		return false; // пока не используется %)
		
		var self = this;
		var done;

		if (typeof arguments[0] == 'string' || typeof arguments[0] == 'object') {
			depents = arguments[0];
		} else {
			console.error('Не могу определить имя модуля!');
			return false;
		}

		if (typeof arguments[1] != 'function') callback = undefined;

		if (typeof depents == 'string') {
			var name = depents;
			var module = self.modules[name];
			if (!module) {
				console.error('Модуль ' + name + ' не определен в системе');
				return false;
			} else {
				//если модуль уже был проиницилизирован, то выполняем нужную функцию
				if (module.inited) {
					if (typeof arguments[1] === 'boolean' && arguments[1] === true) {
						callback = module.callback;
					}

					if (callback) {
						var storage = self._storage();
						(callback)();
					}
				} else {
					self.define(name, module.depents, callback, false);
				}

				return true;
			}
		} else if (Object.prototype.toString.call(depents) === '[object Array]') {
			done = true;

			$.each(depents, function(i, name) {
				// если зависимость является булевой, то пропускаем ее
				if (typeof name == 'boolen') {
					return;
				}

				var response = self.require(name);
				if (!response) {
					done = false;
				}
			});

			if (done) {
				if (callback) {
					var storage = self._storage();
					(callback)();
				}
			}
		} else if (typeof depents === 'object') {
			done = true;
			$.each(depents, function(name, data) {
				// если зависимость является булевой, то пропускаем ее
				if (typeof name == 'boolen') {
					return;
				}

				var response = self.require(name, data.callback);
				if (!response) {
					done = false;
				}
			});
			if (done) {
				if (callback) {
					var storage = self._storage();
					(callback)();
				}
			}
		}
	}
	*/

	// AMD. Определение модуля
	// Принимает все аргументы, при необходимости заполняем дефолтными значениями. Далее передаем в функцию обновления
	// Возвращает ссылку на модуль
	berry.define = function(name, depents, callback, data) {
		if (berry.config.debug) console.log('%cDEFINE:', 'color: #090;', 'определяем модуль', name);
		
		//Если первый полученный аргумент Объект и второй функция или не передан, то значит мы получили конфиг и обработаем его через специальную функцию.
		if (berry.isObject(arguments[0])) {
			return berry._config(arguments[0], arguments[1]);
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
				else if ( berry.isArray(argument) ) config.depents = argument;

				// если аргумент является функцией, то значит это callback-функция (callback)
				else if ( berry.isFunction(argument) ) config.callback = argument;

				// если аргумент является обьектом, то значит это обьект дополнительных данных модуля
				else if ( berry.isObject(argument) /* typeof value === 'object' пропустит null */ ) config.data = argument;
			}

			// если аргументы не нашли, то поставим их значение по умолчанию равным false
			if (!config.depents) config.depents = [];
			if (!config.callback) config.callback = function() {};
			config.data = berry.extend({
				inited : false,  // если data был пустой, то значит модуль не был инициализован и необходим
				require : true,
				path: (/\.(css|js)$/.test(config.name) ) ? config.name : false
			}, config.data);
			
			// находим модуль, если такого модуля нет - создаем новый пустой.
			var module = (berry.modules[config.name]) ? (berry.modules[config.name]) : (berry.modules[config.name] = {
				name: config.name,
				depents: config.depents,
				callback: config.callback,
				data: config.data,
				values: {},
				source : null
			});
			
			// добавляем имя модуля в массив определенных
			berry.defined.push(module.name);
			
			return berry._update(module, config);
		}
	}
	
	// AMD. Обновление конфига модуля
	// Принимает модуль и новый конфиг
	// Возвращает модуль
	berry._update = function(module, config) {
		if( !module ) return Error('Модуль не передан');
		if (berry.config.debug) console.log('%c_UPDATE:', 'color:#FDB950', 'обновляем конфиг для модуля', module.name);

		// объект конфига
		var config = config || {};
			
		// если переданы зависимости, до добавим их к текущим
		if ( berry.isArray(config.depents) ) module.depents = berry.unique( module.depents.concat(config.depents) );
		
		// если передана callback-функция, то обновим её
		if ( berry.isFunction(config.callback) ) module.callback = module.callback;
		
		//обновляем общие данные
		if ( berry.isObject(config.data) ) {
			module.data = berry.extend(module.data, config.data);
			module.data.require = (config.data.require === null) ? false : true;
		} else {
			module.data.require = true;
		}
		
		if ( config.source ) module.source = config.source;
		if ( config.values ) module.values = config.values;
		
		if (/\.(css)$/.test(module.data.path)) module.data.type = 'html';
		if (berry.config.debug) console.log('  Новый конфиг', module);
		return module;
	}

	// AMD. Ожидание модуля
	// Принимает модуль
	// Возвращает обещание, старое или новое, в зависимости от того первый это вызов модуля или нет
	berry._pending = function(module) {
		if (berry.config.debug) console.log('_pending', module.name, module);
		return ( berry.pending[module.name] ) ? berry.pending[module.name] : (berry.pending[module.name] = berry._call(module));
	}
	
	// AMD. Вызов модуля
	// Принимает модуль
	// Определяет зависимости, вызывает цепочку или/и
	// Возвращает обещание
	berry._call = function(module) {
		if (berry.config.debug) console.info('%c_call:', 'color: #840000; font-weight: bold', 'вызов модуля', module.name, 'с зависимостями', module.depents);

		return new Promise(function(resolve, reject) {
			// если модуль необходим и имеет зависимости
			if (module.data.inited === false && module.data.require === true && module.depents.length > 0) {
				if (berry.config.debug) console.log('Модуль ', module.name, 'необходим. Имеет зависимости');
				
				/*
				 проверим массив зависимостей, если в нем есть значения (0, null, false), то такой модуль не будем загружать
				 массив зависимостей может содержать не только имена модулей, от который зависит текущий модуль,
				 но и, булевые значения, число элементов DOM, test по регулярному выражения - любое проверочное уравнение, которое возвращает true\false.
				
				 если существует хотя бы одна зависимость, которая обращается в false, то выходим из цикла,
				 функция some при этом вернет true (forEach же продолжил бы цикл до последнего элемента)
				*/
				var check = !module.depents.some(function(depent) {
					// если зависимость строка, считаем это именем и проверяем определен ли такой модуль
					return !((typeof depent === 'string') ? berry.modules[depent] : depent); 
				});
				
				if (check === true) {
					berry._chain(module).then(function() {
						berry._get(module).then(function(module) {
							resolve(module);
							if (berry.config.debug) console.info('%cМодуль полностью загружен и исполенен', 'color: #F00; font-weight: bold', module.name);
						}, function(reject) {
							console.error('Неудалось загрузить модуль', module, reject);
							reject(module);

					}, function(module) {
						if (berry.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку');
						resolve(module);
					});
				}
				else {
					if (berry.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку');
					resolve(module);
				}
			}
			
			// если модуль необходим и не имеет зависимостей
			else if (module.data.inited === false && module.data.require === true) {
				if (berry.config.debug) console.log('Модуль ', module.name, 'необходим. Зависимостей нет');
				berry._get(module).then(function(module) {
					resolve(module);
					if (berry.config.debug) console.info('%cМодуль полностью загружен и исполенен', 'color: #F00; font-weight: bold', module.name);
				}, function(reject) {
					console.error('Неудалось загрузить модуль', module, reject);
					reject(module);
				});
			}

			// если никакое условние не сработало
			else {
				if (berry.config.debug) console.info('Модуль ', module.name, 'не требуется или уже загружен', module);
				// отклоняем заргрузку модуля, и его зависимостей
				resolve(module);
			}
		});
	}

	// AMD. Вызов цепочки
	// Принимает модуль, определяет его зависимости
	// Возвращает обещание
	berry._chain = function(module) {
		if (berry.config.debug) console.log(' Зависимости модуля', module.name, 'прошли проверку');

		// создаем обещаения для всего списка зависимостей модуля
		return Promise.all(
			module.depents.filter(String).map(function(depent) {
				if (berry.modules[depent]) {
					if (berry.config.debug) console.log(' Зависимость модуля', module.name + '. Модуль', depent, 'необходим для загрузки');
				
					// обновим модуль зависимости, передав новый конфиг если требуется
					if( berry.modules[depent].data.require !== true ) berry._update( berry.modules[depent], { data : { require : true } })
						
					return berry._pending(berry.modules[depent]);
				}
				// если такой модуль не был определен вообще 
				else {
					console.error('Проверьте зависимость от модуля', depent, '. Такой модуль не был определен в системе!');
					return Promise.reject();					
				}
			})
		);
	}
	
	// AMD. Определения конфига
	berry._config = function(config, callback, require) {
		var require = (require == null) ? null : true;
		
		return new Promise(function(resolve, reject) {
			// поочередно определяем переданные в объекте модули
			for (var name in config) {
				if (config.hasOwnProperty(name)) {
					var data = config[name];
					berry.define(name, data.depents, data.callback, berry.extend(data, {'require': null }));
				}
			};

			// после определения всех модулей, запускаем callback-функцию, если она есть
			if (callback) resolve(callback);
			else resolve();
		});				
	};

	// AMD. Получение библиотеки по url
	// Принимает модуль и адрес загрузки
<<<<<<< HEAD
	// Возвращает модуль
	berry._get = function(module, url) {
		if( !module ) return Error('Модуль не передан');
		if (this.config.debug) console.log('GET', module.name, module);
	
		return new Promise(function(resolve, reject){
            // URL модуля
            var url = url || module.data.path || false;

            // Если url модуля есть, то будем его подгружать
            if (url) {
                berry.fetch(url).then(function(source) {
                    if (berry.config.debug) console.info('   Внешний файл для модуля', module.name, 'загружен');
					// обновим модуль
					berry._update(module, { source: source });

                    // вызываем _restore метод
					resolve(berry._callback(module));
                }, function(error) {
                    console.error("Ошибка!", error);
                    // модуль не загружен
                    reject(error, module);
                });
            }

            // Если url нет
            else {
				resolve(berry._callback(module));
            }
        });
	}
	
	// AMD. Загрузка файла по url
	// Принимает url
	// Возвращает ответ xhr	
	berry.fetch = function(url) {
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

	// AMD. Прокидывание переменных из callback-функцию в зависимые модули
	// Принимает модуль
	// Возвращает модуль
	berry._callback = function(module) {
		if (berry.config.debug) console.log('   _callback', module.name, module);
		
		// сохраним хранилище для текущего модуля
		var storage = berry._storage(module);
		storage[module.name] = berry._exec(module, storage).call();

		// обновим конфиг модуля
		return berry._update(module, {  values : storage });
	}
	
	// AMD. Возращаем из хранилища все данные по родительским модуялм
	// Принимает модуль
	// Возвращает обещание
	berry._storage = function(module) {
		if (berry.config.debug) console.log(' _storage', module.name, module.depents);
		var storage = {};
		
		if(module) {
			module.depents.filter(String).forEach(function(module) {
				storage = berry.extend(storage, berry.modules[module].values);
			})
		}
		
		return storage;
	}	


	// AMD. Оборачиваем внешний код
	// Принимает исходный код
	// Создает анонимную функцию, загрженный код помещается в тело функции, ниже добавляется тело callback-функции модуля
	// Возвращает анонимную функцию
	berry._exec = function(module, storage) {
		var func = (module.callback || '').toString();
		var callback = func.slice(func.indexOf("{") + 1, func.lastIndexOf("}"));
		return new Function('args','return function(args) {'+ (module.source || '') + '\n' + callback + '}')(storage);
	}

	
	// AMD. Вызов всех определенных модулей
	/* Инициализируем все модули, которые были определены ранее */
	berry._init = function() {
		if (berry.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Запуск общей инициалзиации определенных модулей');
		
		return Promise.all(
			berry.defined.map(function(module) {
				return berry._pending( berry.modules[module] );
			})
		).then(function(resolve) {
			if (berry.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Все модули проиницилизированы', resolve);
			console.info('End:', performance.now());
		}, function(reject) {
			console.error('Ошибка загрузки модулей', reject);
		});
	}
	
	// инициалиация ядра
	berry.init = function() {
		this.core = {};

		// создаем пустой обьект для локализации
		this.core.locale = {};
		
		this.ready(function() {
			if (berry.config.debug) console.info('%cDOM ready', 'background-color: #409f00; font-weight: bold; padding: 2px 10px; color:#fff; display:block; width: 100%');
			
			var coreplugins = new Promise(function(resolve, reject) {
				// определяем модуль с основными библиотеками
				if( berry.config.AMD.plugins_path ) {
					berry.fetch(berry.config.AMD.plugins_path).then(function(xhr) {
						// создаем функцию для исполнения внешнего в нашей области видимости
						berry._exec(xhr).apply();
						console.log('PLUGINS', berry.plugins )

						berry._config( berry.plugins, null, null ).then(function(callback) {
							// библиотеки определены
							if(callback) callback.call();
							resolve();
						});
					});
				}
				else {
					// библиотек нет, грузим модули
					resolve();
				}
			});
			
			coreplugins.then(function(resolve) {
				berry.STATE = 'ready';
				berry._init();
			});
		});
	}

	// обратная совместимость с seed 1.0
	/*
	if (!window.$) {
		window.$ = {};

		$.define = berry.define;
		$.require = berry.require;
	}
	*/

	// ярлыки
	if (!window.define) window.define = berry.define;
	if (!window.require) window.require = berry.require;

	return berry.init();
})(window, document);
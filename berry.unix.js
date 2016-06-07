/*
 * Berry Core
 * @version 2.0.
 * @author Kirill Ivano
 *
; // предваряющие точка с запятой предотвращают ошибки соединений с предыдущими скриптами, которые, возможно не были верно «закрыты»
(function(window, document, unmodules) 
	'use strict'

	// добавим заглушку консоли, если ее не
	if (typeof console == "unmodules") 
		window.console = 
			log: function() {}
			error: function() {}
			info: function() {
		}
	

	// создаем объект berry, если он не существуе
	if (!window.berry) 
		window.berry = {}
		berry = window.berry
	

	// дефолтный конфиг проект
	berry.config = 
		'debug' : false
		'AMD': 
			'cache': true
			'charset': 'UTF-8', // при значении false, скрипты будут загружаться согласно charset страниц
			'plugins_path': '/js/berry/berry.config.js' // URL для конфига плагинов по умолчани
		
	}

	// Helpers
	// вспомогательные методы

	// расширяем свойства объект
	berry.extend = function(obj) 
		obj = obj || {}

		for (var i = 1; i < arguments.length; i++) 
			if (!arguments[i]) continue
			for (var key in arguments[i]) 
				if (arguments[i].hasOwnProperty(key)) obj[key] = arguments[i][key]
			
		}
		return obj
	

	// уникальные значения массив
	berry.unique = function(arr) 
		var a = []
		for (var i=0, l=arr.length; i<l; i++) 
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '') a.push(arr[i])
		
		return a
	}

	berry.isArray = function(arr) 
		return Object.prototype.toString.call(arr) === '[object Array]'
	

	berry.isObject = function(obj) 
		return Object.prototype.toString.call(obj) === '[object Object]'
	

	berry.isFunction = function(func) 
		return Object.prototype.toString.call(func) === '[object Function]'
	

	berry.ready = function(func) 
		if (document.readyState != 'loading') func()
		else document.addEventListener('DOMContentLoaded', func)
	

	// AMD функциона
	// модули, которые были определен
	berry.modules = [];
	// ключи модулей (имена)
	berry.defined = [];
	// массив промисов ожидающих загрузки модулей
	berry.pending = [];
	// начальное состояние загрузк
	berry.STATE = 'loading'

	// AMD. Запрос модуля
	/
	berry.require = function(depents, callback) 
		return false; // пока не используется %
	
		var self = this
		var done

		if (typeof arguments[0] == 'string' || typeof arguments[0] == 'object') 
			depents = arguments[0]
		} else 
			console.error('Не могу определить имя модуля!')
			return false
		

		if (typeof arguments[1] != 'function') callback = unmodules

		if (typeof depents == 'string') 
			var name = depents
			var module = self.modules[name]
			if (!module) 
				console.error('Модуль ' + name + ' не определен в системе')
				return false
			} else 
				//если модуль уже был проиницилизирован, то выполняем нужную функци
				if (module.inited) 
					if (typeof arguments[1] === 'boolean' && arguments[1] === true) 
						callback = module.callback
					

					if (callback) 
						var storage = self._storage()
						(callback)()
					
				} else 
					self.define(name, module.depents, callback, false)
				

				return true
			
		} else if (Object.prototype.toString.call(depents) === '[object Array]') 
			done = true

			$.each(depents, function(i, name) 
				// если зависимость является булевой, то пропускаем е
				if (typeof name == 'boolen') 
					return
				

				var response = self.require(name)
				if (!response) 
					done = false
				
			})

			if (done) 
				if (callback) 
					var storage = self._storage()
					(callback)()
				
			
		} else if (typeof depents === 'object') 
			done = true
			$.each(depents, function(name, data) 
				// если зависимость является булевой, то пропускаем е
				if (typeof name == 'boolen') 
					return
				

				var response = self.require(name, data.callback)
				if (!response) 
					done = false
				
			})
			if (done) 
				if (callback) 
					var storage = self._storage()
					(callback)()
				
			
		
	}
	*

	// AMD. Определение модул
	// Принимает все аргументы, при необходимости заполняем дефолтными значениями. Далее передаем в функцию обновлени
	// Возвращает ссылку на модул
	berry.define = function(name, depents, callback, data) 
		if (berry.config.debug) console.log('%cDEFINE:', 'color: #090;', 'определяем модуль', name)
	
		//Если первый полученный аргумент Объект и второй функция или не передан, то значит мы получили конфиг и обработаем его через специальную функцию
		if (berry.isObject(arguments[0])) 
			return berry._config(arguments[0], arguments[1])
		
		//Если первый аргумент не является строкой, то сообщаем об ошибке и возвращаем fals
		else if (typeof arguments[0] !== 'string') 
			console.error('Не задано имя для модуля!')
			return false
		
		else 
			// создаем объект конфигурации модул
			var config = {}

			// парсим все входящие аргументы функции, определяем их тип и заполняем внутренний объект аргументо
			for (var i = 0, l = arguments.length; i < l; i++) 
				var argument = arguments[i]

				// если аргумент является строкой, то значит это название модуля (name
				if (typeof argument === 'string') config.name = argument

				// если аргумент является массивом, то значит это массив зависимостей модуля (depents
				else if ( berry.isArray(argument) ) config.depents = argument

				// если аргумент является функцией, то значит это callback-функция (callback
				else if ( berry.isFunction(argument) ) config.callback = argument

				// если аргумент является обьектом, то значит это обьект дополнительных данных модул
				else if ( berry.isObject(argument) /* typeof value === 'object' пропустит null */ ) config.data = argument
			

			// если аргументы не нашли, то поставим их значение по умолчанию равным fals
			if (!config.depents) config.depents = []
			if (!config.callback) config.callback = function() {}
			config.data = berry.extend(
				inited : false,  // если data был пустой, то значит модуль не был инициализован и необходи
				require : true
				path: (/\.(css|js)$/.test(config.name) ) ? config.name : fals
			}, config.data)
		
			// находим модуль, если такого модуля нет - создаем новый пустой
			var module = (berry.modules[config.name]) ? (berry.modules[config.name]) : (berry.modules[config.name] = 
				name: config.name
				depents: config.depents
				callback: config.callback
				data: config.dat
			})
		
			// добавляем имя модуля в массив определенны
			berry.defined.push(module.name)
		
			return berry._update(module, config)
		
	

	// AMD. Обновление конфига модул
	// Принимает модуль и новый конфи
	// Возвращает модул
	berry._update = function(module, config) {
		if( !module ) return Error('Модуль не передан')
		if (berry.config.debug) console.log('%c_UPDATE:', 'color:#FDB950', 'обновляем конфиг для модуля', module.name)

		// объект конфиг
		var config = config || {}
		
		// если переданы зависимости, до добавим их к текущим
		if ( berry.isArray(config.depents) ) module.depents = berry.unique( module.depents.concat(config.depents) );
		
		// если передана callback-функция, то обновим её
		if ( berry.isFunction(config.callback) ) module.callback = module.callback;
	
		//обновляем общие данны
		if ( berry.isObject(config.data) ) 
			module.data = berry.extend(module.data, config.data);
			module.data.require = (config.data.require === null) ? false : true
		} else 
			module.data.require = true
		
	
		// создаем хранилище переменных модул
		if( !module.storage ) module.storage = []
		if (/\.(css)$/.test(module.data.path)) module.data.type = 'html'

		if (berry.config.debug) console.log('  Новый конфиг', module)
	
		return module
	

	// AMD. Ожидание модуля
	// Принимает модуль
	// Возвращает обещание	
	berry._pending = function(module) {
		return ( berry.pending[module.name] ) ? berry.pending[module] : (berry.pending[module.name] = berry._call(module));
	}

	// AMD. Вызов модул
	// Принимает модуль, определяет его зависимост
	// Возвращает обещани
	berry._call = function(module) {
		if (berry.config.debug) console.info('%c_call:', 'color: #840000; font-weight: bold', 'вызов модуля', module.name, 'с зависимостями', module.depents);

		return new Promise(function(resolve, reject) 

			// если модуль необходим и имеет зависимости
			if (module.data.inited === false && module.data.require === true && module.depents.length > 0) {
				if (berry.config.debug) console.log('Модуль ', module.name, 'необходим. Имеет зависимости');
				
				// проверим массив зависимостей, если в нем есть значения (0, null, false), то такой модуль не будем загружать
				// массив зависимостей может содержать не только имена модулей, от который зависит текущий модуль,
				// но и, булевые значения, число элементов DOM, test по регулярному выражения - любое проверочное уравнение, которое возвращает true\false.
				
				// если существует хотя бы одна зависимость, которая обращается в false, то выходим из цикла,
				// функция some при этом вернет true (forEach же продолжил бы цикл до последнего элемента)
				var check = !module.depents.some(function(depent) {
					
					// если зависимость строка, считаем это именем и проверяем определен ли такой модуль
					return !((typeof depent === 'string') ? berry.modules[depent] : depent); 
				});
				
				if (check === true) {
					berry._chain(module).then(function() {
						berry.get(module).then(function() {
							return resolve(module);
						});
					}, function(module) {
						if (berry.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку');
						return resolve(module);
					});
				}
				else {
					if (berry.config.debug) console.log('Модуль ', module.name, 'не будет загружен. Зависимости не прошли проверку');
					return resolve(module);
				
			}
		
			// если модуль необходим и не имеет зависимосте
			else if (module.data.inited === false && module.data.require === true) 
				if (berry.config.debug) console.log('Модуль ', module.name, 'необходим. Зависимостей нет');
			
				berry.get(module).then(function(module) {
					return resolve(module);
				})
			

			// если никакое условние не сработал
			else 
				if (berry.config.debug) console.info('Модуль ', module.name, 'не требуется или уже загружен', module)
				// отклоняем заргрузку модуля, и его зависимосте
				return resolve(module)
			
		})
	

	// AMD. Вызов модуля
	// Принимает модуль, определяет его зависимости
	// Возвращает обещание
	berry._chain = function(module) {
		if (berry.config.debug) console.log(' Зависимости модуля', module.name, 'прошли проверку');

		// запустим обновление модулей рекурсивно проверяя зависимости
		return Promise.all(
			module.depents.map(function(depent) {
				if (typeof depent === 'string' && berry.modules[depent]) {
					if (berry.config.debug) console.log(' Зависимость для модуля', module.name, 'обновлена. Модуль', depent, 'необходим для загрузки');
					
					// обновим модуль зависимости, передав новый конфиг
					return berry._pending( berry._update( berry.modules[depent], { data : { require : true } }) );
				}
				// если такой модуль не был определен вообще 
				else if (typeof depent === 'string' && !berry.modules[depent]) {
					return Promise.reject();					
				}
				else {
					return Promise.resolve();
				}
			})
		)
	}

	// AMD. Определения конфиг
	berry._config = function(config, callback, require) 
		var require = (require == null) ? null : true
	
		return new Promise(function(resolve, reject) 
			// поочередно определяем переданные в объекте модул
			for (var name in config) 
				if (config.hasOwnProperty(name)) 
					var data = config[name]
					berry.define(name, data.depents, data.callback, berry.extend(data, {'require': null }))
				
			}

			// после определения всех модулей, запускаем callback-функцию, если она ест
			if (callback) resolve(callback)
			else resolve()
		});			
	}

	// AMD. Получение библиотеки по url
	// Принимает модуль и адрес загрузки
	// Возвращает модул
	berry.get = function(module, url) {
		if( !module ) return Error('Модуль не передан')
		if (this.config.debug) console.log('GET', module)

		return new Promise(function(resolve, reject)
            // URL модул
            var url = url || module.data.path || false

            // Если url модуля есть, то будем его подгружат
            if (url) 
                berry._xhr(url).then(function(response) 
                    if (berry.config.debug) console.info('   Внешний файл для модуля', module.name, 'загружен')

                    module.response = response;

                    // передадим исполнение callback-функции в спец мето
                    return resolve(berry._callback(module))
                }, function(error) 
                    console.error("Ошибка!", error)
                    // модуль не загруже
                    reject(error, module)
                })
            

            // Если url не
            else 
                // передадим исполнение callback-функции в спец мето
                return resolve(berry._callback(module))
            
        })
	

	// AMD. Загрузка файла по url
	// Принимает url
	// Возвращает ответ xhr
	berry._xhr = function(url) 
		// возвращаем новый Promis
		return new Promise(function(resolve, reject) 
			// проверим что пришло на выхо
			if( typeof url != 'string' ) 
				reject(Error("Wrong URL type: ", url))
				return false
			
		
			// создаем get запрос к сервер
			var xhr = new XMLHttpRequest()
			xhr.open('GET', url, true)
			xhr.onload = function() 
				if (xhr.status == 200) resolve(xhr.response)
				else reject(Error(xhr.statusText)); // ошибка, отдаем её стату
			
		
			// отлавливаем ошибки сет
			xhr.onerror = function() 
				reject(Error("Network Error"))
			};		
		
			// Делаем запро
			xhr.send()
		})
	

	// AMD. Прокидывание переменных из callback-функцию в зависимые модули
	// Принимает модуль
	// Возвращает модул
	berry._callback = function(module) 
		if (this.config.debug) console.log('   _callback: обновляем состояние модуля', module.name, module);
	
		console.log('response', this._storage(module) );

		// выполним callback, передадим в него область видимости от внешнего скрипта, а также объект хранилищ
		module.storage[module.name] = berry._exec(module).call(); //module.callback.apply(this._storage(module));
		
		console.log('STORAGE', module.storage[module.name])
		
		//module.storage[module.name] = berry._exec(module.response, this._storage(module), module.callback);
	
		// обновим модуль
		berry._update(module, { data: { inited: true, require: false }, callback: function() {} });
		
		if (this.config.debug) console.info('%cМодуль полностью загружен и исполенен', 'color: #F00; font-weight: bold', module.name);;
		return module
	

	// AMD. Сохраняем значение callback-функции, нужно для прокидывания в зависмые модули
	// Принимает модуль
	// Возвращает объект хранилищ
	berry._storage = function(module) 
		if (!module) return {}

		var storage = {}

		if (module.depents) 
			module.depents.forEach(function(depent) {
				// т.к. зависимость может быть не только по модулю, то делаем через try\catc
				try 
					berry.extend(storage, berry.modules[depent].storage)
				} catch (e) 
					if (berry.config.debug) console.log(e
				}
				console.log('depent', depent, berry.modules[depent].storage);
			})
		}

		return storage
	

	// AMD. Оборачиваем внешний код
	// Принимает исходный код
	// Создает анонимную функцию, загрженный код помещается в тело функции, ниже добавляется тело callback-функции модуля
	// Возвращает анонимную функци
	berry._exec = function(module) {
		var func = (module.callback || '').toString();
		var callback = func.slice(func.indexOf("{") + 1, func.lastIndexOf("}"));
		return new Function('args','return function(args) {'+ (module.response || '') + '\n' + callback + '}')(berry._storage(module));
	}

	// AMD. Вызов всех определенных модуле
	/* Инициализируем все модули, которые были определены ранее *
	berry._init = function() 
		if (berry.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Запуск общей инициалзиации определенных модулей')
	
		return Promise.all
			berry.defined.map(function(module) 
				return berry._pending( berry.modules[module] )
			}
		).then(function(resolve) {
			if (berry.config.debug) console.info('%c_INIT', 'color: #F00; font-weight: bold', 'Все модули проиницилизированы', resolve);
			console.info('End:', performance.now());
		})
	

	// инициалиация ядр
	berry.init = function() {
		this.core = {}

		// создаем пустой обьект для локализаци
		this.core.locale = {}
	
		this.ready(function() 
			if (berry.config.debug) console.info('%cDOM ready', 'background-color: #409f00; font-weight: bold; padding: 2px 10px; color:#fff; display:block; width: 100%')
		
			var coreplugins = new Promise(function(resolve, reject) 
				// определяем модуль с основными библиотекам
				if( berry.config.AMD.plugins_path ) 
					berry._xhr(berry.config.AMD.plugins_path).then(function(xhr) 
						// создаем функцию для исполнения внешнего в нашей области видимост
						berry._exec(xhr);//.apply()
						console.log('PLUGINS', berry.plugins 

						berry._config( berry.plugins, null, null ).then(function(callback) 
							// библиотеки определен
							if(callback) callback.call()
							resolve()
						})
					})
				
				else 
					// библиотек нет, грузим модул
					resolve()
				
			})
		
			coreplugins.then(function(resolve) 
				berry.STATE = 'ready'
				berry._init()
			})
		})
	

	// обратная совместимость с seed 1.
	/
	if (!window.$) 
		window.$ = {}

		$.define = berry.define
		$.require = berry.require
	
	*

	// ярлык
	if (!window.define) window.define = berry.define
	if (!window.require) window.require = berry.require

	return berry.init()
})(window, document)
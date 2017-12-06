# seed
2.3.0

Simple Flex Framework 
Javascript: http://seedunit.ru/libs.html

Projects included Seed:

* https://aeongrove.ru/
* https://giftsday.ru/
* https://scic.ru/
* http://xindaorussia.ru/
* http://www.azimutyachts.ru/
* http://www.azimutyachts.me/
* http://www.azimutyachts.ua/
* http://www.azimutyachts.vn/
* http://www.azimutyachts.kz/
* http://ultraboats.ru/
* http://greentown-ipp.ru/
* http://snpro-expo.com/
* http://benettiyachts.ru/
* http://heavenlytea.ru/
* http://m.doubletreemoscow.ru/
* http://redstarlabs.net/
* http://giftsprice.ru/

update 2.3.0 

* Строгая инкапсуляция:
  - добавлено свойство для модуля result, должно содержать название переменной, которую возвращает модуль;
  - все модули загружают через метод exec(), который исполняет исходник файла через eval();
* Рефакторинг seed.observer, теперь ноды обработанные мутационной функцией помечаются, и не передаются второй раз в функцию.
  Ранее, они исключались только после того как observer обновлял массив addedNodes.
* В seed.js добавлен метод window.seedLazy(selector, func), аналог метода $(selector).seedLazy(func) внутри seed.core.js


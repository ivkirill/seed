/* 
* seed Config Libs
* @version 2.0.0
* @author Kirill Ivanov
*/

"use strict";

// проверим существование объекта seed
if (!window.seed) {
	window.seed = {};
	seed = window.seed;
}

// список библиотек AMD ядра и зависимостей
seed.libs = {
	"jquery.1.4.2" : {
		"path" : "/js/jquery/jquery-1.4.2.js",
		"callback" : function() {
			return jQuery;
		}
	},
	"jquery.1.7.1" : {
		"path" : "/js/jquery/jquery-1.7.1.js",
		"callback" : function() {
			return jQuery;
		}
	},
	"jquery.1.9.1" : {
		"path" : "/js/jquery/jquery-1.9.1.js",
		"callback" : function() {
			return jQuery;
		}
	},
	"jquery.2.0.1" : {
		"path" : "/js/jquery/jquery-2.0.1.js",
		"callback" : function() {
			return jQuery;
		}
	},
	"jquery.2.1.3" : {
		"path" : "/js/jquery/jquery-2.1.3.min.js",
		"callback" : function() {
			return jQuery;
		}
	},
	"jquery.2.1.4" : {
		"path" : "/js/jquery/jquery-2.1.4.min.js",
		"callback" : function() {
			return jQuery;
		}
	},
	"jquery.3.0.0" : {
		"path" : "/js/jquery/jquery-3.0.0.min.js",
		"callback" : function() {
			return jQuery;
		}
	},

// библиотеки seed
	"seed.core" : {
		"path" : "/js/seed/libs/jquery.seed.core.js",
		"depents": [seed.config.jquery]
	},
	"seed.basket" : {
		"path" : "/js/seed/libs/jquery.seed.basket.js",
		"selector" : "[data-seed='basket']",
		"depents": ["seed.core", "seed.gform", "common.json"]
	},
	"seed.buy" : {
		"path" : "/js/seed/libs/jquery.seed.buy.js",
		"selector" : "[role='button-buy-ajax'], [role='basket-button'], [role='button-buy'], [data-seed='buy']",
		"depents": ["seed.core"]
	},
	"seed.carousel" : {
		"path" : "/js/seed/libs/jquery.seed.carousel.js",
		"selector" : "[data-seed='carousel']",
		"depents": ["seed.core", "common.easing", "ui.touch"]
	},
	"seed.compare" : {
//			"path" : "/js/seed/libs/jquery.seed.compare.js"
	},
	"seed.dropdown" : {
		"path" : "/js/seed/libs/jquery.seed.dropdown.js",
		"selector" : "[data-seed='dropdown']",
		"depents": ["seed.core"]
	},
	"seed.filter" : {
		"path" : "/js/seed/libs/jquery.seed.filter.js",
		"selector" : "[data-seed='filter']",
		"depents": ["seed.core", "common.cookie"]
	},
	"seed.gallery" : {
		"path" : "/js/seed/libs/jquery.seed.gallery.js",
		"selector" : "[data-seed='gallery']",
		"depents": ["seed.core"]
	},
	"seed.gform" : {
		"path" : "/js/seed/libs/jquery.seed.gform.js",
		"selector" : "[data-seed='gform'], [data-seed='validate']",
		"depents" : ["seed.core", "seed.tooltip"]
	},
	"seed.modal" : {
		"path" : "/js/seed/libs/jquery.seed.modal.js",
		"selector" : "[data-seed='modal'], [data-modal-html], [data-modal-url]",
		"depents" : ["seed.core", "ui.draggable"]
	},
	"seed.page" : {
		"path" : "/js/seed/libs/jquery.seed.page.js",
		"selector" : "[data-seed='page'], [role='list-infinity']",
		"depents": ["seed.core", "common.cookie"]
	},
	"seed.select" : {
		"path" : "/js/seed/libs/jquery.seed.select.js",
		"selector" : "[data-seed='select']",
		"depents": ["seed.core", "seed.dropdown"]
	},	
	"seed.tab" : {
		"path" : "/js/seed/libs/jquery.seed.tab.js",
		"selector" : "[data-seed='tab']",
		"depents": ["seed.core"]
	},
	"seed.tooltip" : {
		"path" : "/js/seed/libs/jquery.seed.tooltip.js",
		"selector" : "[data-error], [data-seed='tooltip']",
		"depents": ["seed.core"]
	},
	"seed.ui" : {
		"path" : "/js/seed/libs/jquery.seed.ui.js",
		"selector" : "[data-seed='ui'][data-ui]",
		"depents": ["seed.core", "seed.modal", "seed.gform"]
	},
	"seed.zoom" : {
		"path" : "/js/seed/libs/jquery.seed.zoom.js",
		"selector" : "[data-seed='zoom']",
		"depents" : ["seed.core"]
	},


/* Дополнительные библиотеки для работы с проектами */


// Общие библиотеки
	"common.cookie" : {
		"path" : "/js/jquery/jquery.cookie.js",
		"depents": [seed.config.jquery]
	},
	"common.easing" : {
		"path" : "/js/jquery/jquery.easing.1.3.js",
		"depents": [seed.config.jquery]
	},
	"common.mousewheel" : {
		"path" : "/js/jquery/jquery.mousewheel.js",
		"depents": [seed.config.jquery]
	},
	"common.swipe" : {
		"path" : "/js/jquery/jquery.swipe.js",
		"depents": [seed.config.jquery]
	},
	"common.scrollbar" : {
		"path" : "/js/jquery/jquery.mCustomScrollbar.min.js",
		"selector" : "[data-seed='scroll']",
		"depents": [seed.config.jquery, 'common.mousewheel']
	},
	"common.map" : {
		"path" : "/js/jquery/jquery.map.js",
		"depents": [seed.config.jquery]
	},
	"common.meta" : {
		"path" : "/js/jquery/jquery.metadata.js",
		"depents": [seed.config.jquery]
	},
	"common.tablesorter" : {
		"path" : "/js/jquery/jquery.tablesorter.2.10.js",
		"depents": [seed.config.jquery]
	},
	"common.tablednd-2.10" : {
		"path" : "/js/jquery/jquery.tablednd.js",
		"depents": [seed.config.jquery]
	},
	"common.synctranslit" : {
		"path" : "/js/jquery/jquery.synctranslit.min-utf8.js",
		"depents": [seed.config.jquery]
	},
	"common.base64" : {
		"path" : "/js/base64/base64.js",
		"callback" : function() {
			return Base64;
		}
	},
	"common.json" : {
		"path" : "/js/jquery/jquery.json.js",
		"depents": [seed.config.jquery]
	},

// библиотеки jQuery UI
	"ui.dialog" : {
		"path" : "/js/jquery/ui/jquery.ui.dialog.js",
		"depents": [seed.config.jquery]
	},
	"ui.datepicker" : {
		"path" : "/js/jquery/ui/jquery.ui.datepicker.1.11.4.js",
		"depents": [seed.config.jquery]
	},
	"ui.datepicker-ru" : {
		"path" : "/js/jquery/ui/jquery.ui.datepicker-ru-utf.js",
		"depents": [seed.config.jquery, "ui.datepicker"]
	},
	"ui.datepicker-extension" : {
		"path" : "/js/jquery/ui/jquery.ui.datepicker-extension.js",
		"depents": [seed.config.jquery, "ui.datepicker"]
	},
	"ui.timepicker" : {
		"path" : "/js/jquery/ui/jquery.ui.timepicker.js",
		"depents": [seed.config.jquery, "ui.datepicker"]
	},
	"ui.timepicker-ru" : {
		"path" : "/js/jquery/ui/jquery.ui.timepicker-ru.js",
		"depents": [seed.config.jquery, "ui.datepicker"]
	},
	"ui.mouse" : {
		"path" : "/js/jquery/ui/jquery.ui.mouse.js",
		"depents": [seed.config.jquery]
	},
	"ui.draggable" : {
		"path" : "/js/jquery/ui/jquery.ui.draggable.1.11.4.min.js",
		"depents": [seed.config.jquery]
	},
	"ui.slider" : {
		"path" : "/js/jquery/ui/jquery.ui.slider.1.11.4.js",
		"depents": [seed.config.jquery]
	},
	"ui.touch" : {
		"path" : "/js/jquery/ui/jquery.ui.touch.min.js",
		"depents": [seed.config.jquery]
	},


// библиотеки html5
	"html5.jQueryPlugin" : {
		"path" : "/js/html5/jQueryPlugin.js"
	},
	"html5.HTML5Loader" : {
		"path" : "/js/html5/HTML5Loader.js"
	},
	"html5.HTML5Viewer" : {
		"path" : "/js/html5/HTML5Viewer.js"
	},

// библиотеки High Slide
	"high.slide" : {
		"path" : "/js/slide/highslide.4.1.13.packed.js"
	},
// библиотеки High Charts
	"high.charts" : {
		"path" : "/js/highstock/highcharts.4.1.9.js"
	},

// Яндекс карты
	"yandex.maps" : {
		"path" : "https://api-maps.yandex.ru/2.1/?lang=ru_RU",
		"callback" : function() {
			return ymaps;
		}
	}
};

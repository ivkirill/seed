/* 
* seed Config Libs
* @version 2.0.0
* @author Kirill Ivanov
*/

// проверим существование объекта seed
if (!window.seed) {
	window.seed = {};
}

// список библиотек AMD ядра и зависимостей
seed.libs = {
	"jquery.1.4.2" : {
		path: "/js/jquery/jquery-1.4.2.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.1.7.1" : {
		path: "/js/jquery/jquery-1.7.1.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.1.7.2" : {
		path: "/js/jquery/jquery-1.7.2.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.1.8.1" : {
		path: "/js/jquery/jquery.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.1.9.1" : {
		path: "/js/jquery/jquery-1.9.1.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.2.0.1" : {
		path: "/js/jquery/jquery-2.0.1.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.2.1.3" : {
		path: "/js/jquery/jquery-2.1.3.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.2.1.4" : {
		path: "/js/jquery/jquery-2.1.4.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.3.0.0" : {
		path: "/js/jquery/jquery-3.0.0.min.js",
		callback: function() {
			return jQuery;
		}
	},
	"jquery.3.2.1" : {
		path: "/js/jquery/jquery-3.2.1.min.js",
		callback: function() {
			return jQuery;
		}
	},


// библиотеки seed
	"seed.core" : {
		path: "/js/seed/libs/jquery.seed.core.min.js",
		depents: [seed.config.jquery]
	},
	"seed.basket" : {
		path: "/js/seed/libs/jquery.seed.basket.min.js",
		selector: "[data-seed='basket']",
		depents: ["seed.core", "seed.gform", "common.json"]
	},
	"seed.buy" : {
		path: "/js/seed/libs/jquery.seed.buy.min.js",
		selector: "[role='button-buy-ajax'], [role='basket-button'], [role='button-buy'], [data-seed='buy']",
		depents: ["seed.core"]
	},
	"seed.carousel" : {
		path: "/js/seed/libs/jquery.seed.carousel.min.js",
		selector: "[data-seed='carousel']",
		depents: ["seed.core", "common.easing", "ui.touch"]
	},
	"seed.dropdown" : {
		path: "/js/seed/libs/jquery.seed.dropdown.min.js",
		selector: "[data-seed='dropdown']",
		depents: ["seed.core"]
	},
	"seed.filter" : {
		path: "/js/seed/libs/jquery.seed.filter.min.js",
		selector: "[data-seed='filter']",
		depents: ["seed.core", "common.cookie"]
	},
	"seed.gallery" : {
		path: "/js/seed/libs/jquery.seed.gallery.min.js",
		selector: "[data-seed='gallery']",
		depents: ["seed.core"]
	},
	"seed.gform" : {
		path: "/js/seed/libs/jquery.seed.gform.min.js",
		selector: "[data-seed='gform'], [data-seed='validate']",
		depents: ["seed.core", "seed.tooltip"]
	},
	"seed.modal" : {
		path: "/js/seed/libs/jquery.seed.modal.min.js",
		selector: "[data-seed='modal'], [data-modal-html], [data-modal-url]",
		depents: ["seed.core", "ui.draggable"]
	},
	"seed.page" : {
		path: "/js/seed/libs/jquery.seed.page.min.js?2017-01-15",
		selector: "[data-seed='page'], [role='list-infinity']",
		depents: ["seed.core", "common.cookie"]
	},
	"seed.select" : {
		path: "/js/seed/libs/jquery.seed.select.min.js",
		selector: "[data-seed='select']",
		depents: ["seed.core", "seed.dropdown"]
	},	
	"seed.tab" : {
		path: "/js/seed/libs/jquery.seed.tab.min.js",
		selector: "[data-seed='tab']",
		depents: ["seed.core"]
	},
	"seed.tooltip" : {
		path: "/js/seed/libs/jquery.seed.tooltip.min.js",
		selector: "[data-error], [data-seed='tooltip']",
		depents: ["seed.core"]
	},
	"seed.ui" : {
		path: "/js/seed/libs/jquery.seed.ui.min.js",
		selector: "[data-seed='ui'][data-ui]",
		depents: ["seed.core", "seed.modal", "seed.gform"]
	},
	"seed.zoom" : {
		path: "/js/seed/libs/jquery.seed.zoom.min.js",
		selector: "[data-seed='zoom']",
		depents: ["seed.core"]
	},


/* Дополнительные библиотеки для работы с проектами */


// Общие библиотеки
	"common.cookie" : {
		path: "/js/jquery/jquery.cookie.min.js",
		depents: [seed.config.jquery]
	},
	"common.easing" : {
		path: "/js/jquery/jquery.easing.1.3.min.js",
		depents: [seed.config.jquery]
	},
	"common.mousewheel" : {
		path: "/js/jquery/jquery.mousewheel.min.js",
		depents: [seed.config.jquery]
	},
	"common.mask" : {
		path: "/js/jquery/jquery.mask.min.js",
		depents: [seed.config.jquery]
	},
	"common.swipe" : {
		path: "/js/jquery/jquery.swipe.min.js",
		depents: [seed.config.jquery]
	},
	"common.scrollbar" : {
		path: "/js/jquery/jquery.mCustomScrollbar.min.js",
		selector: "[data-seed='scroll']",
		depents: [seed.config.jquery, 'common.mousewheel']
	},
	"common.map" : {
		path: "/js/jquery/jquery.map.min.js",
		depents: [seed.config.jquery]
	},
	"common.meta" : {
		path: "/js/jquery/jquery.metadata.min.js",
		depents: [seed.config.jquery]
	},
	"common.tablesorter" : {
		path: "/js/jquery/jquery.tablesorter.2.10.min.js",
		depents: [seed.config.jquery]
	},
	"common.tablednd-2.10" : {
		path: "/js/jquery/jquery.tablednd.min.js",
		depents: [seed.config.jquery]
	},
	"common.synctranslit" : {
		path: "/js/jquery/jquery.synctranslit.min-utf8.min.js",
		depents: [seed.config.jquery]
	},
	"common.base64" : {
		path: "/js/base64/base64.min.js",
		callback: function() {
			return Base64;
		}
	},
	"common.json" : {
		path: "/js/jquery/jquery.json.min.js",
		depents: [seed.config.jquery]
	},
	"common.swipe" : {
		path: "/js/jquery/jquery.swipe.min.js",
		depents: [seed.config.jquery]
	},


// библиотеки jQuery UI
	"ui.dialog" : {
		path: "/js/jquery/ui/jquery.ui.dialog.min.js",
		depents: [seed.config.jquery]
	},
	"ui.datepicker" : {
		path: "/js/jquery/ui/jquery.ui.datepicker.1.11.4.min.js",
		depents: [seed.config.jquery]
	},
	"ui.datepicker-ru" : {
		path: "/js/jquery/ui/jquery.ui.datepicker-ru-utf.min.js",
		depents: [seed.config.jquery, "ui.datepicker"]
	},
	"ui.datepicker-extension" : {
		path: "/js/jquery/ui/jquery.ui.datepicker-extension.min.js",
		depents: [seed.config.jquery, "ui.datepicker"]
	},
	"ui.timepicker" : {
		path: "/js/jquery/ui/jquery.ui.timepicker.min.js",
		depents: [seed.config.jquery, "ui.datepicker"]
	},
	"ui.timepicker-ru" : {
		path: "/js/jquery/ui/jquery.ui.timepicker-ru.min.js",
		depents: [seed.config.jquery, "ui.datepicker"]
	},
	"ui.mouse" : {
		path: "/js/jquery/ui/jquery.ui.mouse.min.js",
		depents: [seed.config.jquery]
	},
	"ui.draggable" : {
		path: "/js/jquery/ui/jquery.ui.draggable.1.11.4.min.js",
		depents: [seed.config.jquery]
	},
	"ui.slider" : {
		path: "/js/jquery/ui/jquery.ui.slider.1.11.4.min.js",
		depents: [seed.config.jquery]
	},
	"ui.autocomplete" : {
		path: "/js/jquery/ui/jquery.ui.autocomplete.1.12.1.min.js",
		depents: [seed.config.jquery]
	},
	"ui.touch" : {
		path: "/js/jquery/ui/jquery.ui.touch.min.js",
		depents: [seed.config.jquery]
	},


// библиотеки html5
	"html5.jQueryPlugin" : {
		path: "/js/html5/jQueryPlugin.min.js"
	},
	"html5.HTML5Loader" : {
		path: "/js/html5/HTML5Loader.min.js"
	},
	"html5.HTML5Viewer" : {
		path: "/js/html5/HTML5Viewer.min.js"
	},

// библиотеки High Slide
	"high.slide" : {
		path: "/js/slide/highslide.4.1.13.packed.min.js"
	},
// библиотеки High Charts
	"high.charts" : {
		path: "/js/highstock/highcharts.4.1.9.min.js"
	},
// библиотеки High Stock 
// highcharts по умолчанию включён в highstock! Не грузить одновременно highstock и highcharts
	"high.stock" : {
		path: "/js/highstock/highstock.4.2.3.min.js"
	},

// Яндекс карты
	"yandex.maps" : {
		path: "https://api-maps.yandex.ru/2.1/?lang=ru_RU",
		callback: function() {
			return ymaps;
		}
	}
};

// Определяем список библиотек глобально
seed.amd._libs(seed.libs);
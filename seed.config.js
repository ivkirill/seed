/* 
* seed Config
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
		"path" : "https://code.jquery.com/jquery-3.0.0.js", //"/js/jquery/jquery-3.0.0.min.js",
		"callback" : function() {
			return jQuery;
		}
	},

// Общие библиотеки
	"common.cookie" : {
		"path" : "/js/jquery/jquery.cookie.js",
		"depents": [ seed.config.jquery ]
	},
	"common.easing" : {
		"path" : "/js/jquery/jquery.easing.1.3.js",
		"depents": [ seed.config.jquery ]
	},
	"common.mousewheel" : {
		"path" : "/js/jquery/jquery.mousewheel.js",
		"depents": [ seed.config.jquery ]
	},
	"common.map" : {
		"path" : "/js/jquery/jquery.map.js",
		"depents": [ seed.config.jquery ]
	},
	"common.meta" : {
		"path" : "/js/jquery/jquery.metadata.js",
		"depents": [ seed.config.jquery ]
	},
	"common.tablesorter" : {
		"path" : "/js/jquery/jquery.tablesorter.2.10.js",
		"depents": [ seed.config.jquery ]
	},
	"common.tablednd-2.10" : {
		"path" : "/js/jquery/jquery.tablednd.js",
		"depents": [ seed.config.jquery ]
	},
	"common.synctranslit" : {
		"path" : "/js/jquery/jquery.synctranslit.min-utf8.js",
		"depents": [ seed.config.jquery ]
	},
	"common.base64" : {
		"path" : "/js/base64/base64.js",
		"callback" : function() {
			return Base64;
		}
	},
	"common.json" : {
		"path" : "/js/jquery/jquery.json.js",
		"depents": [ seed.config.jquery ]
	},

// библиотеки jQuery UI
	"ui.dialog" : {
		"path" : "/js/jquery/ui/jquery.ui.dialog.js"
	},
	"ui.datepicker" : {
		"path" : "/js/jquery/ui/jquery.ui.datepicker.js"
	},
	"ui.datepicker-ru" : {
		"path" : "/js/jquery/ui/jquery.ui.datepicker-ru-utf.js"
	},
	"ui.datepicker-extension" : {
		"path" : "/js/jquery/ui/jquery.ui.datepicker-extension.js"
	},
	"ui.timepicker" : {
		"path" : "/js/jquery/ui/jquery.ui.timepicker.js"
	},
	"ui.timepicker-ru" : {
		"path" : "/js/jquery/ui/jquery.ui.timepicker-ru.js"
	},
	"ui.mouse" : {
		"path" : "/js/jquery/ui/jquery.ui.mouse.js"
	},
	"ui.draggable" : {
		"path" : "/js/jquery/ui/jquery.ui.draggable.1.11.4.min.js"
	},
	"ui.slider" : {
		"path" : "/js/jquery/ui/jquery.ui.slider.1.11.4.js.js"
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

// библиотеки seed
	"seed.core" : {
		"path" : "/js/seed/libs/jquery.seed.core.js",
		"depents": [ seed.config.jquery ]
	},
	"seed.buy" : {
		"path" : "/js/seed/libs/jquery.seed.buy.js",
		"depents": ["seed.core"]
	},
	"seed.basket" : {
		"path" : "/js/seed/libs/jquery.seed.basket.js",
		"depents": ["seed.core", "seed.gform", "common.json"]
	},
	"seed.carousel" : {
		"path" : "/js/seed/libs/jquery.seed.carousel.js",
		"depents": ["seed.core", "common.easing"]
	},
	"seed.compare" : {
//			"path" : "/js/seed/libs/jquery.seed.compare.js"
	},
	"seed.dropdown" : {
		"path" : "/js/seed/libs/jquery.seed.dropdown.js",
		"depents": ["seed.core"]
	},
	"seed.filter" : {
		"path" : "/js/seed/libs/jquery.seed.filter.js",
		"depents": ["seed.core", "common.cookie"]
	},
	"seed.gallery" : {
		"path" : "/js/seed/libs/jquery.seed.gallery.js",
		"depents": ["seed.core"]
	},
	"seed.gform" : {
		"path" : "/js/seed/libs/jquery.seed.gform.js",
		"depents" : ["seed.core", "seed.tooltip"]
	},
	"seed.modal" : {
		"path" : "/js/seed/libs/jquery.seed.modal.js",
		"depents" : ["seed.core", "ui.draggable"]
	},
	"seed.page" : {
		"path" : "/js/seed/libs/jquery.seed.page.js",
		"depents": ["seed.core", "common.cookie"]
	},
	"seed.tab" : {
		"path" : "/js/seed/libs/jquery.seed.tab.js",
		"depents": ["seed.core"]
	},
	"seed.tooltip" : {
		"path" : "/js/seed/libs/jquery.seed.tooltip.js",
		"depents": ["seed.core"]
	},
	"seed.select" : {
		"path" : "/js/seed/libs/jquery.seed.select.js",
		"depents": ["seed.core", "seed.dropdown"]
	},
	"seed.ui" : {
		"path" : "/js/seed/libs/jquery.seed.ui.js",
		"depents": ["seed.core", "seed.modal", "seed.gform"]
	},
	"seed.zoom" : {
		"path" : "/js/seed/libs/jquery.seed.zoom.js",
		"depents": ["seed.core"]
	}
};
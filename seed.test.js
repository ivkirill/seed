/* 
* Berry Test
* @version 2.0.27
* @author Kirill Ivanov
*/


define('external', function() {
   	return 'external';
});

define('external2', function(args) {
	console.log(args);
   	return 'external';
});


require('jquery.2.1.4');
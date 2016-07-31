var expect = chai.expect;


// тестовый массив выходных переменных
var bdd_test_array = [
	[],
	{},
	'',
	0,
	1,
	false,
	true,
	[1,2,3],
	{a:1, b: 2, c: 3},
	function() {},
	function() { alert(1) },
	'undefined',
	null
];

describe("Seed", function() {

  // тестирование глобальных изменение, вносимых Seed
  describe("Global", function() {
    it("should be a object", function() {
      expect(seed).to.be.a("object");
    });	

	it("should have a window.console as object", function() {
      expect(console).to.be.a("object");
    });

	// проверка полифила для .matches
    it("should extend prototype Element for 'matches'", function() {
      expect(Element.prototype.matches).to.be.a("function");
    });
	
  });
  
  // тестирование общих методов Seed
  describe("methods", function() {
	describe("extend", function() {
		function test(obj) {
			it("should return object, when argument is " + typeof obj + ' - '+ obj, function() {
			  expect(seed.extend(obj)).to.be.a("object");
			});
		}
		
		for (var i = 1; i < bdd_test_array.length; i++) {
			test( bdd_test_array[i] );
		}
	});
	
	describe("unique", function() {
		function test(arr) {
			it("should return array, when argument is " + typeof arr + ' - '+ arr, function() {
			  expect(seed.unique(arr)).to.be.a("array");
			});
		}
		
		for (var i = 1; i < bdd_test_array.length; i++) {
			test( bdd_test_array[i] );
		}
	});	
  });
  
  
  // тестирование общих методов Seed
  describe("AMD", function() {
	describe("define", function() {
		function test(arg1, arg2, arg3, arg4) {
			it("if first argument is a object then returned false", function() {
				console.log(arg1);
			  expect( arg1 ).to.be.a("object");
			  expect( define(arg1) ).to.be.a(false);
			});
		}
		
		for (var i = 1; i < bdd_test_array.length; i++) {
			for (var j = 1; j < bdd_test_array.length; j++) {
				for (var k = 1; k < bdd_test_array.length; k++) {
					for (var m = 1; m < bdd_test_array.length; m++) {
						test( bdd_test_array[i], bdd_test_array[j], bdd_test_array[k], bdd_test_array[m] );
					}
				}
			}
		}
	});
	
  });  
});
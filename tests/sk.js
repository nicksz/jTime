t_ = require('../jTime.js');

globalCounter = 0;
var higherObject = {
	exercise: false
};
var p = [];
var pollerExerciser;
var pollerExerciseSetter;
var pollerExpirer;


var unilaterals = {
	grant : function(right) { 
		contract.swap(right, "null");
	},
	timedGrant : function(right, deliveryTime) { 
		t_.at(deliveryTime + 50, titles.pollInterval, function() { 
			contracts.swap(right, "null"); 
		});
	}
}



var contracts = {
	swap : function(assetA, assetB) {
	        console.log('entering contracts.swap()');
		console.log('pretending to swap assetA for assetB');
		console.log('and the time is:' + t_.nowChopped());
	},

	future : function(rightA, rightB, deliveryTime) { 
		t_.at(deliveryTime + 50, titles.pollInterval, function() { 
			contracts.swap(rightA, rightB) 
		});
	},


	option : function(exerciseSetter, assetA, assetB, expires) {
	        console.log('entering contracts.option()');
   		// must be asynch, e.g. $.on() or ajax call:
   		pollerExerciser = exerciseSetter.call();
   		var pollInterval = 0.1*t_.SECOND;
   		var condition  = function() { return higherObject.exercise; };
		pollerExerciser = t_.becomes(
			pollInterval, 
			condition, 
			function() {
				contracts.swap(assetA,assetB); 
   				t_.clear(pollerExerciseSetter);
   				t_.clear(pollerExpirer);
			}

		);
   		pollerExpirer = t_.at(expires, pollInterval, function() { 
   			t_.clear(pollerExerciser);
   			t_.clear(pollerExerciseSetter);
   		});
	}
};

console.log('starting time is:' + t_.nowChopped());
var assetA  = 'fake';
var assetB  = 'fake';
var start = t_.now() + 1*t_.SECOND;
var expires = t_.now() + 4*t_.SECOND;
var testExerciseSetter = function() {
	console.log('entering testExerciseSetter');
	return t_.every(
		0.1*t_.SECOND,
		start,	
		expires + 1*t_.SECOND,
		function() { 
			console.log('entering anon function for t_.every() which increments globalCounter. The time is: ' + t_.nowChopped());
			globalCounter++; 
			console.log('globalCounter now is: ' + globalCounter);
			if (globalCounter > 35) {
				higherObject.exercise = true;
			}
		}
	);
}

contracts.option(testExerciseSetter, assetA, assetB, expires)


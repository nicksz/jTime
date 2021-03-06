
t_ = require('../jTime.js');

var p = new Array();



//  should print test2 once and stop: works
p[0] = t_.becomes(700, function() { return true; }, 
              function() { console.log("test2"); } );

// should print test3 fCb forever (until final setTimeout) every 4 seconds: works 
p[1] = t_.becomes(4100, function() { return false; }, 
              { tCb: function() { console.log("test3 tCb"); },
                fCb: function() { console.log("test3 fCb"); } } );


// should print test4 tCb once and stop:  works?
t_.becomes(4300, function() { return true; }, 
              { tCb: function() { console.log("test4 tCb"); },
                fCb: function() { console.log("test4 fCb"); } } );


// should print test4.2 cb never: works
t_.until(1300, function() { return true; }, 
               function() { console.log("test4.2 cb"); } );


// should print test4.3 cb forever (until end of testing clearout): works
p[2] = t_.until(1100, function() { return false; }, 
               function() { console.log("test4.3 cb"); } );



//  should print test6 every 1 seconds for 2 seconds: works
t_.when(1000, t_.now() +2500, function() { return true; }, 
             function() { console.log("test6"); } );


// should print test7 fCb every 1 seconds for 2 seconds: works
t_.when(1000, t_.now() + 2500, function() { return false; }, 
              { tCb: function() { console.log("test7 tCb"); },
                fCb: function() { console.log("test7 fCb"); } } );


// should print test8 tCb every 1 seconds for 2 seconds: works
t_.when(1000, t_.now() + 2500, function() { return true; }, 
              { tCb: function() { console.log("test8 tCb"); },
                fCb: function() { console.log("test8 fCb"); } } );


// should run 3 times then stop: works
var curTime = t_.now()
t_.every(2000, 9100 + curTime, 15500 + curTime,
        function() { 
          console.log("test9 cb, time = " + t_.nowChopped() ); 
        } );


// should run 0 times then stop: works
var curTime = t_.now()
t_.every(3000, 2400 + curTime, 11600 + curTime,
        function() { 
          console.log("test10 cb, time = " + t_.nowChopped() ); 
        } );



// should run 1 time: works
t_.at(t_.now() + 2700, 1000,
      function() { 
          console.log("test11 cb, time = " + t_.nowChopped() ); 
        } );



// should run 2 times: works
t_.before(t_.now() + 2700, 1000,
          function() { 
             console.log("test12 cb, time = " + t_.nowChopped() ); 
          } );


// should run forever (until end of testing clearout): works
p[3] = t_.after(t_.now() + 3700, 1000,
          function() { 
             console.log("test13 cb, time = " + t_.nowChopped() ); 
           } );



// should display the array items on the console
var favoriteThings = ["raindrops", "whiskers", "kettles", "mittens"];




workingThings = favoriteThings.concat();             // clone the array
p[4] = t_.longEach(500, workingThings, 1,
                    function(item) {
                      console.log("test14 processing next item in array: " + item);
                    });


workingThings = favoriteThings.concat();             // clone the array
p[5] = t_.longEach(100, workingThings, workingThings.length+1,         // should return error
                    function(item) {
                      console.log("test15 processing next item in array: " + item);
                    });


workingThings = favoriteThings.concat();             // clone the array
p[6] = t_.longEach(100, workingThings, workingThings.length,       // should do entire array at once
                    function(item) {
                      console.log("test16 processing next item in array: " + item);
                    });



function add(x,y) {
   console.log("Just called function add");
   return x+y;
}

var addDebounced = t_.debounce(add, 200, true);
for (var i=0; i<4; i++) {
   console.log("step " + i + " " + ", 2 + 2 debounced 200 and invoked immediately: " + addDebounced(2,2));
}

t_.setTimeout(400, function() {
   console.log("2 + 2 debounced 200 and delayed 400: " + addDebounced(2,2));
});


setTimeout(function() {
              for (i=0; i<p.length; i++) {
                 t_.clear(p[i]);
              };
          }, 35000);



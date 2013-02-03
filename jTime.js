/*

jTime: run your code when you want it to run.

cb: callback
tCb: trueCallback
fCb: falseCallback
startCb: startCallback
endCb: endCallback

actionObj = cb | { tcb: function, fCb: function } 

*/

var jTime = (function() {                 

function JTime() { 

  this.SECOND = 1000;
  this.MINUTE = 60 * this.SECOND;
  this.HOUR = 60 * this.MINUTE;
  this.DAY = 24 * this.HOUR;
  this.WEEK = 7 * this.DAY;

  this.DEFAULT_POLLING_INTERVAL = 100;

  function Poller() {
     this.poller;
     this.killMe = false;

     this.clear = function() {
        this.killMe = true;
	clearTimeout(this.poller);
     }

  }

  this.mySetInterval = function(period, callback, context) {
    var start = new Date().getTime();  
    var time = 0;
    var elapsed = '0.0';

    // this sets p.killMe to false
    var p = new Poller();

    function next()  
    {  
      if (p.killMe == false) {
        callback.call(context);
        time += period; 
        elapsed = Math.floor(time / period) / 10;  
        if (Math.round(elapsed) == elapsed) { elapsed += '.0'; };    
        var diff = (new Date().getTime() - start) - time;      
        if (p.killMe == false) { p.poller = setTimeout(next, period - diff) };   
      }
    }  
    p.poller = setTimeout(next, period);
    return p;  
  }


}  // JTime()


var jTime = new JTime();


// aliases
var T_ = JTime;


JTime.prototype.clear = function(p) {
    p.clear();
}


JTime.prototype.setTimeout = function(timeout, callback) {
  var p = new Poller();
  p.poller = setTimeout(callback, timeout);
  return p;
}

JTime.prototype.setInterval = function(timeout, callback) {
  var p = t_.mySetInterval(timeout, callback);
  return p;
}


JTime.prototype.becomes = function(pollInterval, condition, actionObj, context) {
   var p;
   if (typeof(actionObj.startCb) == "function") {
      startCb.call(context);
   };
   p = t_.mySetInterval(pollInterval, function() {
         if (condition()) {
           if (typeof(actionObj) === "function") { actionObj.call(context); };
           if (typeof(actionObj.tCb) === "function") { actionObj.tCb.call(context); };
           t_.clear(p);
         } else {
           if (typeof(actionObj.fCb) === "function") { actionObj.fCb.call(context); };
         }
       }, context);
   return p;
}


JTime.prototype.until = function(pollInterval, condition, callback, context) {
   var p;
   if (typeof(callback) == "function") {
      p = t_.becomes(pollInterval, condition,
                { fCb: callback }, context);
   };
   return p;
}



JTime.prototype.when = function(pollInterval, timeout, condition, actionObj, context) {
   var p;
   var curTime = (new Date()).getTime();

   if (typeof(actionObj.startCb) == "function") {
      startCb.call(context);
   };
   p = t_.mySetInterval(pollInterval, function() {
          if (condition()) {
             if (typeof(actionObj) === "function") { actionObj.call(context); };
             if (typeof(actionObj.tCb) === "function") { actionObj.tCb.call(context); };
          }  else {
             if (typeof(actionObj.fCb) === "function") { actionObj.fCb.call(context); };
          }
       }, context);
   setTimeout(function() { 
                 t_.clear(p); 
                 if (typeof(actionObj.endCb) === "function") {
                   actionObj.endCb.call(context);
                 }
              }, 
              timeout-curTime);
   return p;
}


 
JTime.prototype.every = function(period, start, timeout, actionObj, context) {
   var p;
   var curTime = (new Date()).getTime();
   if (timeout <= start) {
      console.log("jTime.every() ERROR: timeout must be greater than start");
      return;
   };
   if (typeof(actionObj.startCb) == "function") {
      startCb.call(context);
   };
   setTimeout(function() { 
        p = t_.mySetInterval(period, function() {
          if (typeof(actionObj) === "function") { 
             actionObj.call(context); 
          };
          if (typeof(actionObj.cb) === "function") { actionObj.cb.call(context); };
        }, context);
   }, start-curTime);
   setTimeout(function() { 
                 t_.clear(p); 
                 if (typeof(actionObj.endCb) === "function") {
                   actionObj.endCb.call(context);
                 }
              }, 
              timeout-curTime);
   return p;
}


JTime.prototype.byDeadline = function(pollInterval, deadline, condition, actionObj, context) {
  var happened = false;
  var p1 = t_.mySetInterval(function() { 
     if (condition()) {
       happened = true;
       if (typeof(actionObj) == "function") {
          actionObj.call(context);
       };
       if (typeof(actionObj.tCb) == "function") {
          actionObj.tCb.call(context);
       };
       clear(p1);
     }
  }, pollInterval);
  var p2 = setTimeout(deadline, function() {
     if (happened == false) {
       if (typeof(actionObj.fCb) == "function") {
          actionObj.fCb.call(context);
       }
     };
     clear(p1);
  });
  return p1;
}

JTime.prototype.notByDeadline = function(pollInterval, deadline, condition, actionObj, context) {
  var p = t_.byDeadline(pollInterval, deadline, condition, 
       { tCb: actionObj.fCb, fCb: actionObj.tCb });
  return p;
}



/*  Fires based on whichever condition happen first
    conditionsActionsMap: [{condition: f; action: actionObj}]
*/
JTime.prototype.happensFirst = function(pollInterval, conditionsActionsMap, context) {
  var p = t_.mySetInterval(pollInterval, function() {
    for (var cA in conditionsActionsMap) {
      if (cA.condition()) {
        if (typeof(cA.actionObj) == "function") {
	  cA.actionObj.call(context);
	}
      };
      break;
    }
  });
  return p;
};
 



// functions for temporal relationships between conditions 

//    allInOrder
// Run actionObj or tCb once if all the conditions are true in order
// Run fCb until all of the conditions have yet come true
// a condition can stop being true, and a previous condition can come
// true again, as long as each next condition is true sometime after previous
// condition is true
// n.b. this is different from conditions _becoming_ true in order
JTime.prototype.allInOrder = function(pollInterval, conditions, actionObj, context) {
  var p = t_.mySetInterval(function() {
    var i=0;
    if (conditions[i]()) {
      i++;
      if (i >= conditions.length) {
        if (typeof(actionObj) == "function") {
	   actionObj.call(context);
	};
	if (typeof(actionObj.tCb) == "function") {
	   actionObj.tCb.call(context);
	};
	clearInterval(p);
      }
    } else {
      if (typeof(actionObj.fCb) == "function") {
        actionObj.fCb.call(context);
      }
    }
  }, pollInterval);
  return p;
};


JTime.prototype.at = function(time, pollInterval, callback, context) {
   var p = this.becomes(pollInterval, 
               function() { 
                 var curDate = new Date();
                 return (curDate.getTime() >= time);
               }, 
               callback, context);
   return p;
}



JTime.prototype.after = function(time, pollInterval, callback, context) {
   var p = this.when(pollInterval, 
            time + 29999,            
            function() { 
               return ((new Date()).getTime() > time) 
            }, 
            callback, context);
   return p;
}



JTime.prototype.before = function(time, pollInterval, callback, context) {
   var p = this.when(pollInterval, 
            time + 2999,                 // timeout after big 3 second fudge factor
            function() { 
               return ((new Date()).getTime() < time) 
            }, 
            callback, context);
   return p;
}



JTime.prototype.Schedule = function() {
  this.sched = new Array();
  this.timeouts = new Array();

  this.addTime = function(time) {
     this.sched.push(time);
  };


// doesn't matter if the array is sorted 
  this.setTimes = function(timeArray) {
     this.sched = timeArray;
  };


  this.run = function(callback, context) {
     for (i = 0; i<this.sched.length; i++) {
         t_.at(this.sched[i], 100, callback, context);
     };
  };


}



JTime.prototype.timeIsWithin = function(min, max) {
  var curTime = (new Date()).getTime();
  return ((curTime > min) && (curTime < max));
}



JTime.prototype.longEach = function(pollInterval, array, step, callback, context) {
    var p = t_.until(pollInterval, 
                     function() { return (array.length === 0) },
                     function() {
                         for (var i=0; (i < step && array.length>0); i++) {
                           var item = array.shift();
                           callback.call(context, item);
                         }
                     });
    return p;
}



JTime.prototype.now = function() {
  return (new Date()).getTime();
}

JTime.prototype.nowChopped = function(modulus) {
  if (modulus) 
     return t_.now() % modulus;
  else
     return t_.now() % 100000;
}

JTime.prototype.zeroPad = function(int) {
    int = int.toString();
    if (int.length > 1) 
       return int;
    else
       return "0" + int;
}

  
// get the starting second of the next minute, hour, day, or week
// n.b. these don't account for leap seconds

JTime.prototype.nextPasses = function(milliseconds) {
  var now = t_.now();
  return  now + milliseconds - now % (milliseconds);
}

JTime.prototype.nextMinute = function() {
  var now = t_.now();
  return  now + t_.oneMinute - now % (t_.oneMinute);
}

JTime.prototype.nextHour = function() {
  var now = t_.now();
  return  now + t_.oneHour - now % (t_.oneHour);
}

JTime.prototype.nextDay = function() {
  var now = t_.now();
  return  now + t_.oneDay - now % (t_.oneDay);
}

JTime.prototype.nextWeek = function() {
  var now = t_.now();
  return  now + t_.oneWeek - now % (t_.oneWeek);
}

return jTime;

}());

var t_ = jTime;             // alias

// exports for node.js
if (typeof module != 'undefined'){
  module.exports = t_;
}



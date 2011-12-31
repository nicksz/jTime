/*
 
jTime: run your code when you want it to run.

cb = callback
tCb = trueCallback
fCb = falseCallback

actionObj = cb | { tcb: function, fCb: function } 
Plan to add { errCb, tEvent, fEvent, errEvent } and perhaps others in future.
Caller can include any or all or none of these.  e.g. can have a tCb or tE or both for the true case.

*/



function JTime() { 


  function Poller() {
     this.poller;
     this.killMe = false;

     this.clear = function() {
        this.killMe = true;
     }

  }

  this.mySetInterval = function(period, callback) {
    var start = new Date().getTime();  
    var time = 0;
    var elapsed = '0.0';

    // this sets p.killMe to false
    var p = new Poller();

    function next()  
    {  
      if (p.killMe == false) {
        callback();
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
var t_ = jTime;



JTime.prototype.clear = function(p) {
    p.clear();
}



JTime.prototype.becomes = function(pollInterval, condition, actionObj) {
   var p;
   p = t_.mySetInterval(pollInterval, function() {
         if (condition()) {
           if (typeof(actionObj) === "function") { actionObj(); };
           if (typeof(actionObj.tCb) === "function") { actionObj.tCb(); };
           t_.clear(p);
         } else {
           if (typeof(actionObj.fCb) === "function") { actionObj.fCb(); };
         }
     });
   return p;
}


JTime.prototype.until = function(pollInterval, condition, callback) {
   var p;
   if (typeof(callback) == "function") {
      p = t_.becomes(pollInterval, condition,
                { fCb: callback });
   };
   return p;
}



JTime.prototype.when = function(pollInterval, timeout, condition, actionObj, finish) {
   var p;
   var curTime = (new Date()).getTime();
   p = t_.mySetInterval(pollInterval, function() {
      if (condition()) {
         if (typeof(actionObj) === "function") { actionObj(); };
         if (typeof(actionObj.tCb) === "function") { actionObj.tCb(); };
      }  else {
         if (typeof(actionObj.fCb) === "function") { actionObj.fCb(); };
      }
   });
   setTimeout(function() { 
                 t_.clear(p); 
                 if (typeof(finish) === "function") {
                   finish();
                 }
              }, 
              timeout-curTime);
   return p;
}


// TODO: actionObj when whenCondition, run until untilCondition
JTime.prototype.whenUntil = function(pollInterval, untilCondition, 
                                        whenCondition, actionObj, finish) {}
 

JTime.prototype.every = function(period, start, timeout, actionObj, finish) {
   var p;
   var curTime = (new Date()).getTime();
   if (timeout <= period + start) {
     console.log("jTime.every() ERROR: timeout must be greater than period + start");
     return;
   };
   setTimeout(function() { 
        p = t_.mySetInterval(period, function() {
          if (typeof(actionObj) === "function") { 
             actionObj(); 
          };
          if (typeof(actionObj.cb) === "function") { actionObj.cb(); };
        });
   }, start-curTime);
   setTimeout(function() { 
                 t_.clear(p); 
                 if (typeof(finish) === "function") {
                   finish();
                 }
              }, 
              timeout-curTime);
   return p;
}


/* TODO:
   performs actionObjs.tCb when changes from false to true
   performs actionObjs.fCb when changes from true to false
   performs actionObjs.ncCB when remains true or false from last poll
*/
JTime.prototype.whenChanges = function(pollInterval, condition, actionObj) {};



/*
TODO: 
Checks whether a condition occurs or event fires before a deadline.
Catches/binds the event, handler checks the time.
expected is { event: event, condition: function }
actionObj is {  firedCb: ...,  missedCb: ..., errCb:..., 
                firedE: event, missedE: event, errE: event }
*/
JTime.prototype.byDeadline = function(pI, deadline, expected, actionObj) {}



/* TODO: fires based on whichever conditions and/or events happen first
   { conditions: actionObjs }
   { events: actionObjs }
*/
JTime.prototype.happensFirst = function(pollInterval, conditionsActionsMap, eventsActionsMaps) {};



/*   this function should trigger from system clock, not setTimeout(), 
     so need to poll but this kind of polling for this purpose is 
     very inefficient
     TODO: exponential or adaptive polling
*/
JTime.prototype.at = function(time, pollInterval, callback) {
   var p = this.becomes(pollInterval, 
               function() { 
                 var curDate = new Date();
                 return (curDate.getTime() >= time);
               }, 
               callback);
   return p;
}



JTime.prototype.after = function(time, pollInterval, callback) {
   var p = this.when(pollInterval, 
            time + 29999,              //### isn't supposed to time out at all...
            function() { 
               return ((new Date()).getTime() > time) 
            }, 
            callback);
   return p;
}



JTime.prototype.before = function(time, pollInterval, callback) {
   var p = this.when(pollInterval, 
            time + 2999,                 // timeout after big 3 second fudge factor
            function() { 
               return ((new Date()).getTime() < time) 
            }, 
            callback);
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


  this.run = function(callback) {
     for (i = 0; i<this.sched.length; i++) {
         t_.at(this.sched[i], 100, callback);
     };
  };


}



JTime.prototype.timeIsWithin = function(min, max) {
  var curTime = (new Date()).getTime();
  return ((curTime > min) && (curTime < max));
}



/* TODO: bind a single event in a way that 
works both for browsers and Node.js emitters: i.e. 
emittingObj.addEventListener() when available
*/
function bind(emittingObj, event, eventHandler){}


/* TODO: bind list of events to emittingObj
         unbind events
         custom events
*/
JTime.prototype.on = function(emittingObj, event, eventHandler) {
 if (emittingObj.addEventListener) {
    emittingObj.addEventListener(event, eventHandler, false);
  } else if (emittingObj.attachEvent) {
    event = "on" + event;
    emittingObj.attachEvent(event, eventHandler);
  }
}


// TODO:
// event handler that triggers only if condition is true when event fires
JTime.prototype.onEventAndContition = function() {}  


JTime.prototype.showCurrentTime = function() {
  return (new Date()).getTime() % 100000;
}





// exports for node.js
if(typeof exports != 'undefined'){
// var exports = this;
  this.becomes = t_.becomes;
  this.until = t_.until;
  this.every = t_.every;
  this.when = t_.when;  
  this.at = t_.at;
  this.after = t_.after;
  this.before = t_.before;
  this.Schedule = t_.Schedule;
  this.on = t_.on;
}



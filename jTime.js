/*

jTime: run your code when you want it to run.

cb = callback
tCb = trueCallback
fCb = falseCallback
startCb = startCallback
endCb = endCallback

actionObj = cb | { tcb: function, fCb: function } 
Plan to add { errCb, tEvent, fEvent, errEvent } and perhaps others in future.
Caller can include any or all or none of these.  e.g. can have a tCb or tEvent or both for the true case.

context = the "this" object to be used in the callback.  The default context 
object in browsers is window for callbacks invoked in setTimeout().

*/

var jTime = (function() {                 

function JTime() { 


  function Poller() {
     this.poller;
     this.killMe = false;

     this.clear = function() {
        this.killMe = true;
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


// try this instead
// jTime = new JTime();

// seems incorrect but probably worked
var jTime = new JTime();


// aliases
var T_ = JTime;


JTime.prototype.clear = function(p) {
    p.clear();
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
      startCb();
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


// TODO: actionObj when whenCondition, run until untilCondition
JTime.prototype.whenUntil = function(pollInterval, untilCondition, 
                                        whenCondition, actionObj) {}
 

JTime.prototype.every = function(period, start, timeout, actionObj, context) {
   var p;
   var curTime = (new Date()).getTime();
   if (timeout <= period + start) {
      console.log("jTime.every() ERROR: timeout must be greater than period + start");
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


/* TODO:
   performs actionObjs.tCb when changes from false to true
   performs actionObjs.fCb when changes from true to false
   performs actionObjs.ncCB when remains true or false from last poll
*/
JTime.prototype.whenChanges = function(pollInterval, condition, actionObj, context) {};



/*
TODO: 
Checks whether a condition occurs or event fires before a deadline.
Catches/binds the event, handler checks the time.
expected is { event: event, condition: function }
actionObj is {  firedCb: ...,  missedCb: ..., errCb:..., 
            or just tCb: ....,      fcB: ..., errCb:...,
                firedE: event, missedE: event, errE: event }
*/
JTime.prototype.byDeadline = function(pollInterval, deadline, condition, actionObj, context) {
  var poller1 = t_.mySetInterval(function() { 
     if (condition()) {
       //### actionObj logic
     }
  }, pollInterval);
  var poller2 = setTimeout(deadline, function() {
     clear(poller1);
  });
  return poller1;
}

JTime.prototype.notByDeadline = function(pollInterval, deadline, condition, actionObj, context) {
  poller = t_.byDeadline(pollInterval, deadline, condition, 
   //  { firedCb: missedCb; missedCb: firedCb });
       { tCb: actionObj.fCb, fCb: actionObj.tCb });
  return poller;
}



/* TODO: fires based on whichever conditions and/or events happen first
    conditionsActionsMap: [{condition: f; action: actionObj}]
*/
JTime.prototype.happensFirst = function(pollInterval, conditionsActionsMap, eventsActionsMaps, context) {
  var poller = t_.mySetInterval(pollInterval, function() {
    for (var cA in conditionsActionsMap) {
      if (cA.condition()) {
        //#### cA.actionObj logic
      };
      break;
    }
  });
  return poller;
};
 



//### functions for temporal relationships between conditions (and events?)

//    allInOrder
// a condition can stop being true, and a previous condition can come
// true again, as long as each next condition occurs sometime after previous
// condition
JTime.prototype.allInOrder = function(pollInterval, conditions, actionObj) {
  var poller = t_.mySetInterval(function() {
    i=0;
    if (conditions[i]()) {
      i++;
      if (i >= conditions.length) {
        //### actionObjs execution logic goes here
	clearInterval(poller);
      }
    };
  }, pollInterval);
  return poller;
};

//    allAnyOrder
JTime.prototype.allAnyOrder = function(pollInterval, conditions, actionObj) {
  var poller = t_.mySetInterval(function() {
 /* 
    foreach condition in conditions {
      if (condition()) {
         //### remove condition from conditions
      }
      if (conditions.length == 0) {
         //##### actionObj logic
         clearInterval(poller);
	 break;
      }
    }
 */
  }, pollInterval);
  return poller;
}


//##############################################33

/*   at(), before(), and after() should trigger from system clock, not setTimeout(), 
     so need to poll but this kind of polling for this purpose is 
     very inefficient
     TODO: exponential or adaptive polling
//####### TODO: MAKE ORTHOGONAL W/REST OF LIBRARY
    function(pollInterval, time, callback, context)

*/
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
            time + 29999,              //### isn't supposed to time out at all...
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



// should work both in browswer and in node.js
function bind(emittingObj, event, eventHandler){
  if (emittingObj.addEventListener) {
    emittingObj.addEventListener(event, eventHandler, false);
  } else if (emittingObj.attachEvent) {
    event = "on" + event;
    emittingObj.attachEvent(event, eventHandler);
  }

}

function unbind(emittingObj, event, eventHandler) {};


/* TODO: test bind list of events to emittingObj
         unbind events
         custom events
*/
JTime.prototype.on = function(emitters, event, eventHandler) {
/*### TODO: check to see if it's a new kind of event, and if so create it */
/*### create using event or the optional object event.condition, event.event */
  if (typeof(emitters) == "Array") {
      emitters.forEach(function(emittingObj) {
           bind(emittingObj, event, eventHandler);
      } ); 
   } else {
       bind(emitters, event, eventHandler); 
   }   
}

JTime.prototype.off = function(emitters, event, eventHandler) { }




// TODO:
// event handler that triggers only if condition is true when event fires
JTime.prototype.onEventAndContition = function() {}  


JTime.prototype.showCurrentTime = function() {
  return (new Date()).getTime() % 100000;
}


return jTime;

}());

var t_ = jTime;             // alias

// exports for node.js
if(typeof exports != 'undefined'){
  this.becomes = t_.becomes;
  this.until = t_.until;
  this.every = t_.every;
  this.when = t_.when;  
  this.at = t_.at;
  this.after = t_.after;
  this.before = t_.before;
  this.Schedule = t_.Schedule;
  this.on = t_.on;
  this.longEach = t_.longEach;
}


/* doesn't work -- can be made to work?
if(typeof exports != 'undefined'){
  exports.jTime = jTime;
  exports.t_ = t_;
}
*/

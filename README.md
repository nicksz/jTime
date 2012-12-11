## jTime.js
### Run your code when you want it to run


jTime lets coders control when asynchronous calls get executed. jTime 
includes methods implemented over setTimeout() that run callbacks 
until or when a condition comes true, according to regular or irregular 
schedules, or according to other temporal criteria.  jTime also 
includes the longEach() function that lets a long computation 
over an array yield intermettently to allow other callbacks to run in 
the single-threaded environment of a web browser. You can provide an 
optional context ("this" object) in which your callback will execute.  
Otherwise your callback will run in the default context: normally the 
global object, but no object ("this" undefined) in ECMAScript 5 strict mode.

jTime bridges the gap between the various timing hacks used in kernel and 
device driver programming and the long period temporal programming in 
cron. Applications of jTime may include:

* Animation
* Games
* Simulation
* Dynamic data visualization
* Web searching and scraping
* Music
* Workflow
* Dynamic business logic
* Smart contracts/property
* Monitoring for and processing of security events
* Systems administration (much more temporal variety than cron)
* Network protocols and administration 
* Caching
* All sorts of other things

jTime runs in both client side (web browsers) and server side (node.js) 
JavaScript, and does not depend on any other libraries. It is licensed 
under a hybrid of the FreeBSD and MIT licenses: i.e. open source that is 
much less restricted than copyleft licenses.

jTime is a work in progress. It is currently at an early alpha
stage, with many features remaining to add.

The library synchronizes polling to the Date object time
        (new Date).getTime()
during each polling interval. The duration between more than one
polling is thus determined by Date(). Only the duration between 
two consecutive pollings is determined by setTimeout(). Although
Date() in most browsers has a resolution of 1ms, the use of
setTimeout() between polling intervals gives this library's polling 
for most browsers a maximum resolution of 4 ms.  JavaScript execution in 
browsers is generally single-threaded, so that the browser will not execute 
callbacks until the currently running code has completed.  Operating system and
browser activities such as context switching, cache misses, garbage
collection, and other factors often also greatly reduce the actual
resolution of when your callbacks will run from the theoretical 
resolution of 4 ms.


For more on JavaScript timer and Date resolution, see 

http://www.nczonline.net/blog/2011/12/14/timer-resolution-in-browsers/

http://ejohn.org/blog/accuracy-of-javascript-time/

http://www.belshe.com/2010/06/04/chrome-cranking-up-the-clock/

## Usage
First set up an array of pollers so that you can kill on demand the timers
you'll set up:

``` javascript
var pollers = [];
```


##### becomes (pollInterval, condition, callback) 
Runs callback when condition first occurs

``` javascript
//  Prints "Hello World" once (at around 700ms) and stops
pollers[0] = t_.becomes(700, function() { return true; }, 
              function() { console.log("Hello World"); } );
```


##### until (pollInterval, condition, callback)
Runs callback until condition first occurs

``` javascript
//  Prints "Hello World" every 1 second until poller cleared
pollers[1] = t_.until(1000, function() { return false; }, 
               function() { console.log("Hello World"); } );
```

##### when (pollInterval, endTime, condition, callback)
Runs callback whenever the condition is true and before endTime

``` javascript
// Prints "Hello World" every 1 second for 2 seconds
pollers[2] = t_.when(1000, t_.now() + 2500, function() { return true; }, 
             function() { console.log("Hello World"); } );
```

##### before (endTime, period, callback)
Runs callback periodically until specified time

``` javascript
// Prints "Hello World" and shows time when run, once per second
// before 2700ms (i.e. twice)
pollers[3] = t_.before(t_.now() + 2700, 1000,
          function() { 
	    console.log("Hello World, time = " + t_.nowChopped() ); 
	  } );
```

##### after (startTime, period, callback)
Runs callback periodically after specified time

``` javascript
// Runs ever 1 second after 3.7 seconds until poller cleared
pollers[4] = t_.after(t_.now() + 3700, 1000,
          function() { 
	    console.log("test13 cb, time = " + t_.nowChopped() ); 
	   } );
```

##### every (period, startTime, endTime, callback)
Runs callback periodically from startTime until endTime

``` javascript
// runs every 2 seconds starting in 9.1 seconds and ending near 15.1 seconds
var curTime = t_.now();
t_.every(2000, 9100 + curTime, 15500 + curTime,
        function() { 
	          console.log("test9 cb, time = " + t_.nowChopped() ); 
	} );
```

Finally, clean up by killing all the remaining timers:

``` javascript
// terminate further execution of all runs set up with the above pollers
// after 35 seconds
setTimeout(function() {
              for (i=0; i<poller.length; i++) {
	        t_.clear(poller[i]);
	      };
           }, 35000);
```

How to make a condition be whether an event has occurred:
General pattern for making a condition in t_ the occurrence of an event:

0. set a shared-scope var flag = false;
1. catch event, with callback function() { flag = true; }
2. condition is function() { return (flag == true) }

To check whether an event has occurred since the last polling change step 2 to the following:

General pattern for making a condition in t_ the occurrence of an event:

0. set a shared-scope var flag = false;
1. catch event, with callback function() { flag = true; }
2. condition is function() { return (flag == true) }

To check whether an event has occurred since the last polling change step 2 to the following:


General pattern for making a condition in t_ the occurrence of an event:

0. set a shared-scope var flag = false;
1. catch event, with callback function() { flag = true; }
2. condition is function() { return (flag == true) }

To check whether an event has occurred since the last polling change step 2 to the following:
2. condition is function() { var returnValue = (flag == true); flag = false; return returnValue; }



## jTime.js
### Run your code when you want it to run

jTime lets coders achieve more control over when asynchronous calls 
get executed. jTime includes methods implemented over setTimeout()
that run callbacks until or when a condition comes true, according to 
regular or irregular schedules, and according to other temporal criteria. 
jTime also includes the longEach() function that lets a long computation 
over an array yield intermettently to allow other callbacks to run in 
the single-threaded environment of a web browser.

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



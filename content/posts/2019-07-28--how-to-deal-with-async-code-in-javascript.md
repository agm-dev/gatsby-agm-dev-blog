---
title: 'How to deal with async code in Javascript'
date: "2019-07-28T22:40:32.169Z"
template: "post"
draft: false
slug: "/posts/how-to-deal-with-async-js-code/"
category: "Javascript"
tags:
  - "programming"
  - "javascript"
  - "asynchronous"
  - "promises"
  - "async"
  - "await"
  - "callback"
description: "Some notes and code examples about different ways to deal with asynchronous code in Javascript."
socialImage: "/media/42-line-bible.jpg"
---

## 1. Introduction

- Javascript is asynchronous and single-threaded.
- Stack, heap, queue, event loop.

Synchronous code example:

```javascript
var a = 1;
var b = 2;

function sum(x, y) {
    return x + y;
}

b++;
console.log(sum(a,b));
```

Asynchronous code example:

```javascript
var a = 1;
var b = 2;

function sum(x, y) {
    return x + y;
}

setTimeout(function() { // this places the code at the end of the queue
    b++;
    console.log('first on code: ' + sum(a,b));
}, 0);

console.log('second on code: ' + sum(a,b));
```

Common case where we have to deal with asynchronous flow: __http requests__.

## 2. Callbacks

### 2.1. Passing functions as parameters

```javascript
// function that makes asynchronous stuff
function doYourStuff() {
    setTimeout(function() {
        console.log(`i'm doing my stuff...`);
        // here goes the code which does your stuff
    }, 1000);
}

doYourStuff();
// what if i want to do something AFTER doing my stuff?
// can't place it here, because would be executed BEFORE doing my stuff
// example:
console.log('my stuff has been done!');

```

How do we solve this? Spoiler: callbacks.

```javascript
// function that makes asynchronous stuff
function doYourStuff(cb) {
    setTimeout(function() {
        console.log(`i'm doing my stuff...`);
        var result = 123;
        if (typeof cb === 'function') cb(result);
    }, 1000);
}

doYourStuff(function (data) {
    console.log('my stuff has been done!');
    console.log(`the result of doing my stuff is ${data}`);
});

console.log('this keeps executing before :(');

```

JQuery example:

```javascript
$.ajax({
    method: 'GET',
    url: 'https://some.where',
    data: { a: 1, b: 2 },
    success: function (data) {
        console.log(data);
    },
    error: function (err) {
        console.error(err);
    }
});
```

XMLHttpRequest example:

```javascript
function request(url, success, err) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {
                if (typeof success === 'function') success(xmlhttp.responseText);
                return;
            }
            if (typeof err === 'function') err(new Error('request has failed'));
        }
    }
    xmlhttp.open('GET', url);
    xmlhttp.send();
}

request(
    'https://some.where',
    function (data) {
        console.log(data);
    },
    function (err) {
        console.error(err);
    }
);
```

Only one callback with error first approach:

```javascript
function request(url, cb) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {
                if (typeof cb === 'function') cb(null, xmlhttp.responseText);
                return;
            }
            if (typeof cb === 'function') cb(new Error('request has failed'));
        }
    }
    xmlhttp.open('GET', url);
    xmlhttp.send();
}

request('https://some.where', function(err, data) {
    if (err) return console.error(err);
    console.log(data);
});
```

## 2.2. Oh, oh! Callback hell

```javascript
someAsyncFunc(data, function(results) {
    results.forEach(function(item, index) {
        otherAsyncOperation(item, function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            console.(data);
        });
    });
});
```

How to minimize it?

```javascript
function otherAsyncOperationHandler(err, data) {
    if (err) return console.error(err);
    console.log(data);
}

function processItem(item, index) {
    otherAsyncOperation(item, otherAsyncOperationHandler);
}

function someAsyncFuncHandler(results) {
    results.forEach(processItem);
}

someAsyncFunc(data, someAsyncFuncHandler);
```

## 3. Events

### 3.1. How to create and listen events

```javascript
var event = new Event('serious-movida');
window.dispatchEvent(event);
```

Another way to deal with asynchronous code issues:

```javascript
// function that makes asynchronous stuff
function doYourStuff() {
    setTimeout(function() {
        console.log(`i'm doing my stuff...`);
        // doing your stuff...
        var event = new Event('serious-movida');
        window.dispatchEvent(event);
    }, 1000);
}

window.addEventListener('serious-movida', function() {
    console.log('the movida has been done');
});

doYourStuff();
console.log('this keeps executing before :(');
```

### 3.2. What if we need to send some information with the event?

Custom events:

```javascript
var data = { a: 1, b: 2 };
var event = new CustomEvent('serious-movida', { detail: data });
window.dispatchEvent(event);
```

On the last example:

```javascript
// function that makes asynchronous stuff
function doYourStuff() {
    setTimeout(function() {
        console.log(`i'm doing my stuff...`);
        var data = { a: 1, b: 2 };
        var event = new CustomEvent('serious-movida', { detail: data });
        window.dispatchEvent(event);
    }, 1000);
}

window.addEventListener('serious-movida', function(e) {
    console.log('the movida has been done');
    console.table(e.detail);
});

doYourStuff();
console.log('this keeps executing before :(');
```

## 4. Promises (no more callback hell)

### 4.1. How to use promises

Fetch:

```javascript
fetch('https://quotes.rest/qod.json?category=inspire')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data.contents.quotes[0].quote);
    })
    .catch(function(err) {
        console.error(err);
    });

// ES6 arrow functions
fetch('https://quotes.rest/qod.json?category=inspire')
    .then(response => response.json())
    .then(data => console.log(data.contents.quotes[0].quote))
    .catch(err => console.error(err));
```

### 4.2. How to create your own promises

```javascript
function wait(seconds) {
    return new Promise(function (resolve, reject) {
        setTimeout(function() {
            resolve();
        }, seconds * 1000);
    });
}

console.log('start!');
wait(3)
    .then(function () {
        console.log('Three seconds later...');
    });

// ES6
console.log('start!');
wait(3).then(() => console.log('Three seconds later...'));

// Chaineable:
wait(2)
    .then(function() {
        console.log('Two seconds later...');
        return wait(3);
    })
    .then(function() {
        console.log('Three seconds later after waiting two seconds...');
    });
```

#### 4.2.1. Promisify your callback based function

Any callback based function is easy to be converted into a promise:

```javascript
// callback based function:
function request(url, cb) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {
                if (typeof cb === 'function') cb(null, xmlhttp.responseText);
                return;
            }
            if (typeof cb === 'function') cb(new Error('request has failed'));
        }
    }
    xmlhttp.open('GET', url);
    xmlhttp.send();
}

// lets promisify it!
function requestAsAPromise(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

requestAsAPromise('https://quotes.rest/qod.json?category=inspire')
    .then(response => JSON.parse(response)) // return value doesn't have to be a promise!!
    .then(data => console.log(data.contents.quotes[0].quote))
    .catch(err => console.error(err));

```

### 4.3. Promise.all

> Check script.js file, threePromisesInARow() and testPromiseAll()

## 5. async / await

### 5.1. How to use async functions (they're just promises!)

```javascript
function wait(seconds) {
    return new Promise(function (resolve, reject) {
        setTimeout(function() {
            resolve();
        }, seconds * 1000);
    });
}

async function init() {
    console.log('start!');
    await wait(3);
    console.log('Three seconds later...');
    await wait(2);
    console.log('Three seconds later after waiting two seconds...');
}

init();
```

### 5.2. Error handling

The usual way:

```javascript
async function init() {
    console.log('start!');
    try {
        await wait(3);
    } catch (err) {
        console.err(err);
    }
    console.log('Three seconds later...');
    try {
        await wait(2);
    } catch (err) {
        console.err(err);
    }
    console.log('Three seconds later after waiting two seconds...');
}
```

The cleaner way:

```javascript
function errorHandler(fn) {
    return function (...params) {
        return fn(...params).catch(function(err) {
            console.error(err);
        })
    }
}

async function init() {
    console.log('start!');
    await wait(3);
    console.log('Three seconds later...');
    await wait(2);
    console.log('Three seconds later after waiting two seconds...');
}

var safeInit = errorHandler(init);
safeInit();
```

## 6. Generators

- who knows about them?
- who cares about them?

## 7. Resources

Resources used to build this document:

- [Concurrency model and Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [Javascript Event Loop Explained](https://medium.com/front-end-weekly/javascript-event-loop-explained-4cd26af121d4)
- [Async programming basics every JS developer should know](https://dev.to/siwalikm/async-programming-basics-every-js-developer-should-know-in-2018-a9c)
- [Callback Hell: a guide to writing asynchronous Javascript programs](http://callbackhell.com/)
- [What are Javascript Generators and how  to use them](https://codeburst.io/what-are-javascript-generators-and-how-to-use-them-c6f2713fd12e)
- [Understanding Generators in ES6 Javascript (with examples)](https://codeburst.io/understanding-generators-in-es6-javascript-with-examples-6728834016d5)
- [Javascript ES6: You don't really need to learn Generators](https://hackernoon.com/javascript-es6-you-dont-really-need-to-learn-generators-96aa2e9114fa)
- [Bootstrap Doc: Events](https://getbootstrap.com/docs/4.0/components/modal/#events)
- [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Understanding promises](https://hackernoon.com/understanding-promises-in-javascript-13d99df067c1)
- [Promise all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Async / Await](https://javascript.info/async-await)
- [dotJS 2017 - Wes Bos - Async + Await](https://www.youtube.com/watch?v=9YkUCxvaLEk)

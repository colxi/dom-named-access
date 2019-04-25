# DOM named access
This microlibrary provides a safe way to access all the named elements (those with a non empty id attribute) in the window DOM. 

By default, the engine will keep track of the changes in the DOM tree, and mantain an updated collection of available named elements ( through in  `DOM.id` ).


# Why ?

The HTML5 specification brought us a standarized way to access our named elements directlly from the window object ( called  [Named access on the Window object](https://www.w3.org/TR/html5/browsers.html#named-access-on-the-window-object) ). However it exists a [general consensus](https://stackoverflow.com/questions/3434278/do-dom-tree-elements-with-ids-become-global-variables
) in avoiding the usage of this feature, because can generate collisions with root native method and property names, dragging you to a hell of bugs, hard to deal with.

Is well known that **caching** our references to DOM elements can provide us great benefits in performance, and even make our code more readable. It will free you from the continued use of `document.getElementById()` or `document.querySelector()`.

Here is where `Dom-named-access` appears : It aims to provide a **safe alternative** to the HTML5 Named access on the `window` object feature, and a **fast** way to reach our named elements.

# Usage

Imagine you have the following HTML in your document :

```html
<div>
    <div id="myFirstDiv"></div>
    <div id="mySecondDiv"></div>
    <div id="myThirdDiv"></div>
</div>
```

To access any of the previous named divs, you only need to import the library and you will find your named elements inside the  `DOM.id` object :

```javascript
import {DOM} from './dom-named-access.js';

// delete the div with id="mySecondDiv"
DOM.id.myFirstDiv.remove();
```

Because a `DOM Mutation Observer` is initialized internally by the library, any node removal or addition in your document will be detected and handled automatically : the new named elements will be available in the `DOM.id` object, and removed nodes with id will be taken away from the `DOM.id` list. (check the Performance section for more details about this feature)

> **Attention** : The `DOM Mutation Observer` runs **asynchronously** ! Changes performed in the DOM will not be handled in the event loop cycle where actually happened, but rather be enqueued to run in the next one. Then is when the collection in `DOM.id` will be updated.

# Installation
You can download and install this library in several ways...

Use npm package manager :
```
$ npm install dom-named-access -s
```

Clone the app from Github :
```
$ git clone https://github.com/colxi/dom-named-access.git
```
...or download the latest Release in a `.zip` package [here](https://github.com/colxi/dom-named-access/releases/latest)


# Public API details 

The DOM object provides the main public elements collection  :

`DOM.id` : Live Collection of named elements in the DOM

Two handful DOM references :

`DOM.body` : Reference to document.body

`DOM.head` : Reference to document.head

And some internal/configuration properties and methods :

`DOM.__idTrack__` : Boolean property to enable/disable the DOM observer  

`DOM.__idCacheUpdate__` : Method to perform a manual DOM named elements scan & update

# Performance

The internal DOM Mutation Observer setted by this library can become a performance killer in scenarios where the DOM tree is masive, and continuous changes (node additions / removals) are performed in it.
If a lost of performance is detected, you can disable the DOM observer and handle the named elements detection manually.

To disable automatic element tracking use
```javascript
// Disable automatic DOM tracking
DOM.__idTrack__ = false; 

// When you need to update the DOM.id 
// elements list simply call :
DOM.__idCacheUpdate__();
```


// Flag to set if DOM ids are being tracked with the 
// DOM Mutation Observer
let _TRACKING_  = false;
let _DEBUG_     = false;


const _debug =  _DEBUG_ ? function( ...args ){
    if(!_DEBUG_) return false;
    console.log(...args);
    return true;
} : function(){ return false };

// DOM Observer Handler
const _OBSERVER_ = new MutationObserver( mutations=>{
    mutations.forEach( mutation=>{
        // handle Attribute changes...
        if(mutation.type === 'attributes'){
            // if attribute is not ID return
            if( mutation.attributeName !== 'id' ) return;
            
            // if id has been removed, remove it from DOM.id elements
            if( mutation.target.id === '' || !mutation.target.id ){
                _debug('ID REMOVED', mutation.oldValue);
                delete DOM.id[mutation.oldValue];
            }else{
                if( mutation.oldValue ){
                    // id has been changed, delete old, add new to list
                    _debug('ID CHANGED', mutation.oldValue,'>', mutation.target.id);
                    delete DOM.id[ mutation.oldValue ];
                    DOM.id[ mutation.target.id ] = mutation.target;
                }else{
                    // id added, add to list
                    _debug('ID ADDED', mutation.target.id);
                    DOM.id[ mutation.target.id ] = mutation.target;
                }
            }
        }
        // HANDLE NODE TREE CHANGES
        else if( mutation.type === 'childList' ){
            // REMOVED NODES
            if( mutation.removedNodes.length ){      
                // iterate all deleted root nodes
                for(let i=0; i<mutation.removedNodes.length; i++ ){
                    // ignore if is not an Element node
                    if( mutation.removedNodes[i].nodeType !== Node.ELEMENT_NODE ) continue;
                    
                    // remove deleted node ids
                    if( mutation.removedNodes[i].id ){
                        _debug('NODE ID REMOVED', mutation.removedNodes[i].id );
                        delete DOM.id[ mutation.removedNodes[i].id ];
                    }
                    // get all subdones with id and remove the ids
                    let els = mutation.removedNodes[i].querySelectorAll('[id]');
                    for(let e=0; e<els.length;e++){
                        let id = els[e].id;
                        if(id){
                            _debug('NODE ID REMOVED', id );
                            delete DOM.id[id];
                        }
                    }
                }
            }
            // ADDED NODES
            if( mutation.addedNodes.length ){
                // iterate all root added nodes
                for(let i=0; i<mutation.addedNodes.length; i++ ){
                    // ignore if is not an Element node
                    if( mutation.addedNodes[i].nodeType !== Node.ELEMENT_NODE ) continue;
                    
                    // add added node id
                    if( mutation.addedNodes[i].id ){
                        _debug('NODE ID ADDED', mutation.addedNodes[i].id );
                        DOM.id[ mutation.addedNodes[i].id ] = mutation.addedNodes[i];
                    }
                    // get all subdones with id and add the ids
                    let els = mutation.addedNodes[i].querySelectorAll('[id]');
                    for(let e=0; e<els.length;e++){
                        let id = els[e].id;
                        if(id){
                            _debug('NODE ID ADDED', id );
                            DOM.id[id] = els[e];
                        }
                    }
                }
            }
        }
        // OTHER MUTATIONS...
        else{
            _debug( 'UNKNOWN NODE CHANGE', mutation.type, mutation);
        }
    });
    return true;
});


/**
 * DOM{} : Public API
 */
const DOM = {
    // DOM.id : Live Collection of ids available in the DOM
    id : {},
    // Reference to the doctype element
    doctype : document.doctype,
    // DOM.head : Reference to the document.head object
    head : document.head,
    // DOM.body : Reference to the document.body object
    body : document.body,
    // DOM.html : Reference to the html element (top node)
    html : document.querySelector('html'),
    // DOM[:root] : Reference to the DOM top element (whatever it is)
    ':root' : document.documentElement
};


/**
 * DOM.__idTrack__ : Getter / setter to enable and disable 
 * the live observing of DOM to retrieve and update element ids
 */
Object.defineProperty(DOM, '__idTrack__', {
    get : function(){ return _TRACKING_},
    set : function( track ){
        // Enable tracking request
        if( track ){
            if( !_TRACKING_ ){
                _debug('Start Tracking Ids');
                // update the elements with id cache
                DOM.__idCacheUpdate__();
                // start the DOM observer
                const config = { 
                    attributes        : true, 
                    attributeOldValue : true, 
                    childList         : true, 
                    subtree           : true, 
                    characterData     : false 
                };
                _OBSERVER_.observe(document, config);
                _TRACKING_ = true;
            }
        }
        // Disable tracking request
        else{
            if( _TRACKING_ ){
                _debug('Stop Tracking Ids');
                // disable the DOM observer
                _OBSERVER_.disconnect();
                _TRACKING_ = false;
            }
        }
        return _TRACKING_;
    },
    enumerable: false,
    configurable: true
});


/**
 * DOM.__idCacheUpdate__ :  Method to update the cache of DOM ids
 * manually. Usefull when DOM.__idTrack__ is set to false
 */
Object.defineProperty(DOM, '__idCacheUpdate__', {
    value : function( ){
        _debug('Updating Ids Cache');
        // Empty DOM.id collection
        DOM.id = {};
        // get all elements wit id in the DOM
        let els = document.querySelectorAll('[id]');
        // iterate them
        for(let i=0; i<els.length;i++){
            // if element id is set but emty continue
            if( els[i].id === '' ) continue;
            _debug( 'ID FOUND', els[i].id );
            // insert the element in the cache
            DOM.id[ els[i].id ] = els[i];
        }
        return true;
    },
    enumerable: false,
    configurable: false
});


// Initialize the engine, setting  DOM.__idTrack__ to true. It will
// trigger the DOM.__idCacheUpdate__ method, to inspect the DOM
// and retrieve the available elements with ids, and make them available
// in the object found in DOM.id
DOM.__idTrack__ = true;


export {DOM};


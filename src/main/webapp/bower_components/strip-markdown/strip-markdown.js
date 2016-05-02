(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stripMarkdown = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Throw.
 *
 * @param {string} message
 */
function exception(message) {
    throw new Error(message);
}

/**
 * Return nothing.
 *
 * @return {null}
 */
function empty() {
    return null;
}

/**
 * Return an stringified image.
 *
 * @param {Image} token
 * @return {Node}
 */
function image(token) {
    return {
        'type': 'text',
        'value': token.alt || token.title || ''
    };
}

/**
 * Return the concatenation of `token`s children.
 *
 * @param {Object} token
 * @return {Array.<Node>}
 */
function children(token) {
    return token.children;
}

/**
 * Return the concatenation of `token`s children.
 *
 * @param {Object} token
 * @return {Node}
 */
function paragraph(token) {
    return {
        'type': 'paragraph',
        'children': token.children
    };
}

/**
 * Return `token`s value.
 *
 * @param {Object} token
 * @return {Node}
 */
function inline(token) {
    return {
        'type': 'text',
        'value': token.value
    };
}

/*
 * Expose modifiers for available node types.
 *
 * Node types not listed here are not
 * changed (but their children are).
 */

var map = {};

map.blockquote = children;
map.list = children;
map.listItem = children;
map.strong = children;
map.emphasis = children;
map.delete = children;
map.link = children;

map.heading = paragraph;

map.text = inline;
map.inlineCode = inline;

map.code = empty;
map.html = empty;
map.horizontalRule = empty;
map.table = empty;
map.tableCell = empty;

map.image = image;

/**
 * Clean nodes: merges text's.
 *
 * @param {Array.<Node>} values
 * @return {Array.<Node>}
 */
function clean(values) {
    var index = -1;
    var length = values.length;
    var result = [];
    var prev = null;
    var value;

    while (++index < length) {
        value = values[index];

        if (prev && 'value' in value && value.type === prev.type) {
            prev.value += value.value;
        } else {
            result.push(value);
            prev = value;
        }
    }

    return result;
}

/*
 * Define cleaners.
 */

var strip;
var stripAll;

/**
 * Strip markdown formatting from a node.
 *
 * @param {Node} node
 * @return {null|Node|Array.<Node>}
 */
strip = function (node) {
    var type = node && node.type;

    if (type in map) {
        node = map[type](node);
    } else if (typeof type !== 'string') {
        exception('Invalid type: ' + type);
    }

    if (node) {
        if (node.length) {
            node = stripAll(node);
        }

        if (node.children) {
            node.children = stripAll(node.children);
        }
    }

    return node;
};

/**
 * Strip markdown formatting from multiple nodes.
 *
 * @param {Array.<Node>} nodes
 * @return {Array.<Node>}
 */
stripAll = function (nodes) {
    var index = -1;
    var length = nodes.length;
    var result = [];
    var value;

    while (++index < length) {
        value = strip(nodes[index]);

        if (value && value.length) {
            result = result.concat(value.map(strip));
        } else if (value) {
            result.push(value);
        }
    }

    return clean(result);
};

/**
 * Attacher
 *
 * @return {function(Node)}
 */
function attacher() {
    return strip;
}

/*
 * Expose `strip`.
 */

module.exports = attacher;

},{}]},{},[1])(1)
});
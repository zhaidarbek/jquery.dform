/*
 * jQuery dform plugin
 * Copyright (C) 2010 David Luecke <daff@neyeon.de>
 * 
 * Licensed under the MIT license
 */

/**
 * file: Plugin
 * 
 * This is the documentation for the core helpers and jQuery
 * functions of the plugin.
 * 
 * Author:
 * David Luecke (daff@neyeon.de)
 */
(function($)
{
	var _subscriptions = {};
	var _types = {};
	
	function _addToObject(obj, data, fn)
	{
		if (typeof (data) == "string")
		{
			if (!$.isArray(obj[data])) {
				obj[data] = [];
			}
			obj[data].push(fn);
		} else if (typeof (data) == "object")
		{
			$.each(data, function(name, fn)
			{
				_addToObject(obj, name, fn);
			});
		}
	}

	/**
	 * section: JQuery Plugin functions
	 *
	 * Functions that will be used as jQuery plugins.
	 */
	$.fn.extend(
	{
		/**
		 * function: runSubscription
		 * 
		 * Run all subscriptions with the given name and options
		 * on an element.
		 * 
		 * Parameters:
		 * 	name - The name of the subscriber functions
		 * 	options - Options for the function
		 * 	type - The type of the current element (as in
		 * 	the registered types)
		 * 
		 * Returns:
		 * 	The jQuery element this function has been called on
		 */
		runSubscription : function(name, options, type)
		{
			var element = $(this);
			if ($.dform.hasSubscription(name))
			{
				$.each(_subscriptions[name], function(i, sfn) {
					// run subscriber function with options
					sfn.call(element, options, type);
				});
			}
			return $(this);
		},
		/**
		 * function: runAll
		 * 
		 * Run all subscription functions with given options.
		 * 
		 * Parameters:
		 * 	options - The options to use
		 * 
		 * Returns:
		 * 	The jQuery element this function has been called on
		 */
		runAll : function(options)
		{
			var type = options.type;
			var scoper = $(this);
			// Run preprocessing subscribers
			$(this).runSubscription("[pre]", options, type);
			$.each(options, function(name, sopts) {
				// TODO each loop for list of dom elements
				$(scoper).runSubscription(name, sopts, type);
			});
			// Run post processing subscribers
			$(this).runSubscription("[post]", options, type);
			return $(this);
		},
		/**
		 * function: formElement
		 * 
		 * Creates a form element on an element with given options
		 * 
		 * Parameters:
		 * 	options - The options to use
		 * 
		 * Returns:
		 * 	The jQuery element this function has been called on
		 */
		formElement : function(options)
		{
			// Create element (run builder function for type)
			var element = $.dform.createElement(options);
			$(this).append($(element));
			// Run all subscriptions
			$(element).runAll(options);
			return $(this);
		},
		/**
		 * function: buildForm
		 * 
		 * Build an entire form, if the current element is a form.
		 * Otherwise the formElement function will be called on the
		 * current element.
		 * 
		 * Parameters:
		 * 	options - The options to use or a url that returns
		 *  the forms JSON. 
		 *  params - Parameters that should be passed if a URL
		 *  is loaded
		 * 
		 * Returns:
		 * 	The jQuery element this function has been called on
		 */
		buildForm : function(options, params)
		{
			var ops;
			if(typeof(options) == "string") {
				var scoper = this;
				$.get(options, data, function(data, textStatus, XMLHttpRequest) {
					$(scoper).buildForm(data);
				});
			}
			else {
				if ($(this).is("form")) {
					var ops = $.extend({ "type" : "form" }, options);
					$(this).attr($.dform.htmlAttributes(ops));
					$(this).runAll(ops);
				} else {
					$(this).formElement(options);
				}
			}
		}
	});
	
	/**
	 * section: Global helper functions
	 *
	 * Helper functions that can be used globally and are added to the jQuery object.
	 */
	$.extend($, {
		/**
		 * function: keyset
		 * 
		 * Returns an array of keys (properties) contained in the given object.
		 * 
		 * Parameters:
		 * 	object - The object to use
		 * 
		 * Returns:
		 * 	An array containing all properties in the object
		 */
		keyset : function(object)
		{
			var keys = [];
			$.each(object, function(key, value) {
				keys.push(key);
			});
			return keys;
		},
		/**
		 * function: withKeys
		 * 
		 * Returns an object that contains all values from the given
		 * object that have a key which is also in the array keys.
		 * 
		 * Parameters:
		 * 	object - The object to traverse
		 * 	keys - The keys the new object should contain
		 * 
		 * Returns:
		 * 	A new object containing only the properties
		 * 	with names given in keys
		 */
		withKeys : function(object, keys)
		{
			var result = {};
			$.each(keys, function(index, value) {
				if(object[value]) {
					result[value] = object[value];
				}
			});
			return result;
		},
		/**
		 * function: withoutKeys
		 * 
		 * Returns an object that contains all value from the given
		 * object that do not have a key which is also in the array keys.
		 * 
		 * Parameters:
		 * 	object - The object to traverse
		 * 	keys - A list of keys that should not be contained in the new object
		 * 
		 * Returns:
		 * 	A new object with all properties of the given object, except
		 * 	for the ones given in the list of keys
		 */
		withoutKeys : function(object, keys)
		{
			var result = {};
			$.each(object, function(index, value) {
				if($.inArray(index, keys) == -1) {
					result[index] = value;
				}
			});
			return result;
		}
	});
	
	$.dform =
	{
		/**
		 * section: Options
		 * 
		 * Default options the plugin is initialized with
		 */
		options :
		{
			/**
			 * var: prefix
			 * 
			 * The Default prefix used for element classnames generated by the dform plugin.
			 * Defaults to ui-dform-
			 * E.g. an element with type text will have the class ui-dform-text
			 */
			prefix : "ui-dform-",
			/**
			 * Function: defaultType
			 * 
			 * A function that is called, when no registered type has been found.
			 * The default behaviour returns an HTML element with the tag
			 * as specified in type and the HTML attributes given in options
			 * (without subscriber options).
			 */
			defaultType : function(options)
			{
				var attr = $.dform.htmlAttributes(options);
				return $("<" + options.type + ">").attr(attr);
			}
		},
		/**
		 * section: Static helper functions
		 *
		 * Static helpers for the plugin, that can be found in the *$.dform* namespace.
		 */
		
		/**
		 * function: htmlAttributes
		 * 
		 * Returns the HTML attributes based on a given object.
		 * The returned object will contain any key value pair
		 * where the key is not the name of a subscriber function
		 * and the key is not in a string in the excludes array.
		 * 
		 * Parameters:
		 * 	object - The attribute object
		 * 	excludes - A list of keys that should also be excluded
		 * 
		 * Returns:
		 * 	All HTML attributes for the given object
		 */
		htmlAttributes : function(object, excludes)
		{
			// Ignore any subscriber name and the objects given in excludes
			var ignores = $.keyset(_subscriptions);
			if($.isArray(excludes)) {
				$.merge(ignores, excludes);
			}
			return $.withoutKeys(object, ignores);
		},
		/**
		 * function: removeType
		 * 
		 * Delete an element type.
		 * 
		 * Parameters:
		 * 	name - The name of the type to delete 
		 */
		removeType : function(name)
		{
			delete _types[name];
		},
		/**
		 * function: typeNames
		 * 
		 * Returns the names of all types registered
		 */
		typeNames : function()
		{
			return $.keyset(_types);
		},
		/**
		 * function: addType
		 * 
		 * Register a element type function.
		 * 
		 * Parameters:
		 * 	data - Can either be the name of the type
		 * 	function or an object that contains name : type function
		 * 	pairs
		 * 	fn - The function that creates a new type element
		 */
		addType : function(data, fn)
		{
			_addToObject(_types, data, fn);
		},
		/**
		 * function: addTypeIf
		 * 
		 * Register a element type function.
		 * 
		 * Parameters:
		 * 	condition - The condition under which to subscribe
		 * 	data - Can either be the name of the type builder
		 * 	function or an object that contains name : type function
		 * 	pairs
		 * 	fn - The function to subscribe or nothing if an object is passed for data
		 * 
		 * See also:
		 * 	<addType>
		 */
		addTypeIf : function(condition, data, fn)
		{
			if(condition) {
				$.dform.addType(data, fn);
			}
		},
		/**
		 * function: subscriberNames
		 * 
		 * Returns the names of all subscriber functions registered
		 */
		subscriberNames : function()
		{
			return $.keyset(_subscriptions);
		},
		/**
		 * function: subscribe
		 * 
		 * Register a subscriber function.
		 * 
		 * Parameters:
		 * 	data - Can either be the name of the subscriber
		 * 	function or an object that contains name : subscriber function
		 * 	pairs
		 * 	fn - The function to subscribe or nothing if an object is passed for data
		 */
		subscribe : function(data, fn)
		{
			_addToObject(_subscriptions, data, fn);
		},
		/**
		 * function: subscribeIf
		 * 
		 * Register a subscriber if a given condition is true.
		 * Use it if you want to subscribe only, if e.g. a required plugin
		 * is installed (pass $.isFunction($.fn.pluginName)).
		 * 
		 * Parameters:
		 * 	condition - The condition under which to subscribe
		 * 	data - Can either be the name of the subscriber
		 * 	function or an object that contains name : subscriber function
		 * 	pairs
		 * 	fn - The function to subscribe or nothing if an object is passed for data
		 * 
		 * See also:
		 * 	<subscribe>
		 */
		subscribeIf : function(condition, data, fn)
		{
			if(condition) {
				$.dform.subscribe(data, fn);
			}
		},
		/**
		 * function: removeSubscription
		 * 
		 * Delete all subscriptions for a given name.
		 * 
		 * Parameters:
		 * 	name - The name of the subscriber to delete 
		 */
		removeSubscription : function(name)
		{
			delete _subscriptions[name];
		},
		/**
		 * function: hasSubscription
		 * 
		 * Returns if a subscriber function with the given name
		 * has been registered.
		 * 
		 * Parameters:
		 * 	name - The subscriber name
		 * 
		 * Returns:
		 * 	True if the given name has at least one subscriber registered,
		 * 	false otherwise
		 */
		hasSubscription : function(name)
		{
			return _subscriptions[name] ? true : false;
		},
		/**
		 * function: createElement
		 * 
		 * Create a new element.
		 * 
		 * Parameters:
		 * 	options - The options to use
		 * 
		 * Returns:
		 * 	The element as created by the builder function specified
		 * 	or returned by the <defaultType> function.
		 */
		createElement : function(options)
		{
			var type = options.type;
			if (!type) {
				throw "No element type given! Must always exist.";
			}
			var element = null;
			if (_types[type])
			{
				// We don't need the type key in the options
				var ops = $.withoutKeys(options, "type");
				// Run all type element builder functions called typename
				$.each(_types[type], function(i, sfn) {
					element = sfn.call(element, ops);
				});
			}
			else {
				// Call defaultType function if no type was found
				element = $.dform.options.defaultType(options);
			}
			return $(element);
		}
	};
})(jQuery);
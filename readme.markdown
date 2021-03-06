The jQuery.dForm plugin generates HTML markup from JavaScript objects and [JSON](http://json.org)
with a focus on HTML forms.

__Some things you can do:__

* use JavaScript and JSON instead of HTML markup since your page doesn't run without JS anyway
* naturally generate JavaScript enhanced markup with your own extensions and custom types
* have an easy way to include jQuery UI elements and other jQuery plugins (some supported out of the box)
* scaffold forms from business objects of your server side framework

## Get started

[Download](http://github.com/downloads/daffl/jquery.dform/jquery.dform-0.1.4.tar.gz)
the latest version 0.2.0 (6 Kb minified)

Include it in your jQuery powered page and try this:

	<script type="text/javascript">
		$(function() {
			$("#myform").dform({
			    "action" : "index.html",
			    "method" : "get",
			    "html" :
			    [
			        {
			            "type" : "p",
			            "html" : "You must login"
			        },
			        {
			            "name" : "username",
			            "id" : "txt-username",
			            "caption" : "Username",
			            "type" : "text",
			            "placeholder" : "E.g. user@example.com"
			        },
			        {
			            "name" : "password",
			            "caption" : "Password",
			            "type" : "password"
			        },
			        {
			            "type" : "submit",
			            "value" : "Login"
			        }
			    ]
			});
		});
	</script>
	<form id="myform"></form>

__Learn more:__

* Play around with this example as a JSFiddle
* Check out the get started page for more examples
* Visit the [jQuery.dForm Google Group](http://groups.google.com/group/jquery-dform)
* Watch and fork the project on [GitHub](http://github.com/daffl/jquery.dform/)
* Follow [@daffl](http://twitter.com/daffl) on Twitter
* Read on in this documentation

## Types

Type generators are functions that return a new jQuery DOM object for a specific type. If there is no type generator
for that type, a basic HTML tag the type name will be created. Every other key in the JavaScript or JSON object
you pass (the dForm object) will be used as an HTML attribute, except if there is a [subscriber](#subscribers)
registered for that key. A plugin call like this:

	$('#my-div').dform({
		type : "span",
		id : "the-span"
	});

Will append an empty `<span id="the-span"></span>` to the selected element.

### Core types

Besides standard HTML tags the following core types are supported:

**container** `{ "type" : "container" }`<br />
Creates a `<div>` container (you can also use `{ "type" : "div" }`)

**text** `{ "type" : "text" }`<br />
Creates a text input field

**password** `{ "type" : "password" }`<br />
Creates a password input field

**submit** `{ "type" : "submit" }`<br />
Creates a submit button input element

**reset** `{ "type" : "reset" }`<br />
Creates a reset button input element

**hidden** `{ "type" : "hidden" }`<br />
Creates a hidden input element

**file** `{ "type" : "file" }`<br />
Create a file upload field

**radio** `{ "type" : "radio" }`<br />
Creates a radio button

**checkbox** `{ "type" : "checkbox" }`<br />
Creates a checkbox

**radiobuttons** `{ "type" : "radiobuttons" }`<br />
Creates a group of radiobuttons (uses options subscriber explained below)

**checkboxes** `{ "type" : "checkboxes" }`<br />
Creates a group of checkboxes (uses options subscriber explained below)

**number** `{ "type" : "number" }`<br />
Creates an HTML 5 number input field

**url** `{ "type" : "url" }`<br />
Creates an HTML 5 url input field

**tel** `{ "type" : "tel" }`<br />
Creates an HTML 5 phone number input field

**email** `{ "type" : "email" }`<br />
Creates an HTML 5 email input field

### Add your own

You can add your own types by calling  *$.dform.addType* and pass the type name and a function
that takes the dForm object as a parameter and returns a new jQuery DOM element:

	$.dform.addType("hellobutton", function(options) {
		// Return a new button element that has all options that
		// don't have a registered subscriber as attributes
		return $("<button>").dform('attr', options).html("Say hello");
	});

The type generator uses the *attr* [plugin method](#plugin-methods)) to add the proper HTML attributes to the button.
Now the new type can be used:

	$('#myform').dform({
		"type" : "hellobutton",
		"id" : "my-button"
	});

And generates:

	<button id="my-button" class="ui-dform-hellobutton">Say hello</button>

Type generators can be chained. That means, that if you add an already existing type, *this* in the generator function
will refer to the element returned by its previous generator (otherwise it will refer to the *window* object):

	$.dform.addType("text", function(options) {
		return $(this).addClass('my-textfield-class');
	});

	$('#myform').dform({
		type : 'text'
	});

Now generates

	<input type="text" class="ui-dform-text my-textfield-class" />

## Subscribers

Not everything can be solved using a custom type. Adding a class for example doesn't need to be implemented
every time and this is where Subscribers come in. Subscribers are functions that will be called for the key they
have been registered for when traversing the dForm object.

### Core subscribers

**type** *{String}*<br />
Besides looking up the correct Type Generator it also adds a dform specific class to the element using
*$.dform.options.prefix* (*ui-dform-* by default) and the type name.

	{
		"type" : "text"
	}

Generates:

	<input type="text" class="ui-dform-text" />

**class** *{String}*<br />
Adds a class to the current element (instead of setting the attribute) using [.addClass()](http://api.jquery.com/addClass).

	{
		"type" : "div",
		"class" : "the-div container"
	}

Generates:

	<div class="ui-dform-div the-div container"></div>

**html/elements** *{String|Array|Object}*<br />
Based on the options it either sets the HTML string content of the current element or appends one or an array
of dForm objects. The *elements* subscriber does the same but is kept for backwards compatibility.

	{
        "type" : "div",
        "html" : "Div content"
    }

Generates:

	<div class="ui-dform-div">Div content</div>

This subscriber can also be used to create nested objects by using one or an array of dForm objects:

	{
		"type" : "div",
		"html" :
		[
			{
				"type" : "text"
			},
			{
				"type" : "div",
				"html" : {
					"type" : "p",
					"html" : "A paragraph"
				}
			}
		]
	}

Generates:

	<div class="ui-dform-div">
		<input type="text" class="ui-dform-text" />
		<div class="ui-dform-div">
			<p class="ui-dform-p">A paragraph</p>
		</div>
	</div>

**value** *{String|Function}*<br />
Sets the value of the element using [.val()](http://api.jquery.com/val/)

	{
		"type" : "text",
		"value" : "Text content"
	}

Generates:

	<input type="text" value="Text content" />

**css** {Object}<br />
Sets CSS properties on an element with [.css()](http://api.jquery.com/css/):

	{
		"type" : "div",
		"css" : {
			"background-color" : "#FF0000",
			"display" : "none"
		}
	}

Generates:

	<div class="ui-dform-div" style="background-color: #FF0000; display: none;"></div>

**options** *{Object}*<br />
Generates a list of options from a value to text (or dForm Object) mapping for elements of type *select*, *radiobuttons*
or *checkboxes*.

	{
		"type" : "select",
		"options" : {
			"us" : "USA",
			"ca" : "Canada",
			"de" : {
				"selected" : "selected",
				"html" : "Germany"
			}
		}
	}

Generates:

	<select>
		<option value="us">USA</option>
		<option value="ca">Canada</option>
		<option value="de" selected="selected">Germany</option>
	</select>

You can also use options on *checkboxes* and *radiobuttons* which will create a list of *checkbox*
or *radio* elements:

	{
		"type" : "checkboxes",
		"options" : {
			"newsletter" : "Receive the newsletter",
			"terms" : "I read the terms of service",
			"update" : "Keep me up to date on new events"
		}
	}

Generates:

	// TODO

> *Note:* The Google Chrome JavaScript engine V8 orders object keys that can be cast to numbers by their value and
> not by the order of their definition.

**caption** *{String|Object}*<br />
Adds a caption to the element. The type used depends on the element type:

* A *legend* on *fieldset* elements
* A *label* next to *radio* or *checkbox* elements
* A *label* before any other element

If the element has its id set the *for* attribute of the label will be set as well.

	{
		"type" : "text",
		"name" : "username",
		"id" : "username",
		"caption" : "Enter your username"
	}

Generates:

	<label for="username" class="ui-dform-label">Enter your username</label>
	<input type="text" class="ui-dform-text" id="username" />

For fieldsets:

	{
		"type" : "fieldset",
		"caption" : "Address"
	}

Generates:

	<fieldset class="ui-dform-fieldset">
		<legend type="ui-dform-legend">Address</label>
	</fieldset>

**url**<br />
TODO

### Add your own

It is easy to add your own subscribers. Similar to a type generator you just pass the key name you want to subscribe
to and a function that takes the options and the type name as a parameter to *$.dform.subscribe*. *this* in the
subscriber function will refer to the current element. That way it e.g. would be possible to add an alert to the
*hellobutton* created in the [types section](#subscribers/add-your-own):

	$.dform.subscribe("alert", function(options, type) {
		if(type === "hellobutton") { // Just run if the type is a hellobutton
			this.click(function() {
				alert(options);
			});
		}
	});

And then you can use the plugin like this:

	$("#mydiv").dform({
		"type" : "hellobutton",
		"alert" : "Hello world!"
	});

Which generates:

	<button class="ui-dform-hellobutton">Say Hello</button>

And alerts "Hello world!" when the button is clicked. Like type generators, subscribers will also be chained.
You can therefore add multiple subscribers with the same name adding behaviour or reacting to different types.

### Special subscribers

Currently there are two types of special subscribers

**\[pre\]** *{Object}*<br />
Functions registered with this name will be called before any processing occurs and get the original options passed.

**\[post\]** *{Object}*<br />
Functions registered with this name will be called after all processing is finished and also get the original
options passed.

## Plugin methods

Default

run<br />
append<br />
attr({Object})<br />
ajax<br />

## jQuery UI

jQuery.dForm adds automatic support for jQuery UI if it is available. If the form has the *ui-widget* class
the plugin will automatically turn buttons into jQuery UI buttons and add corners to *text*, *textarea*, *password*
and *fieldset* elements.

### Types

Most jQuery UI widgets have an appropriate type generator implemented. Each take the same options as described
in [the jQuery UI documentation](http://jqueryui.com/demos/).

**progressbar** `{ "type" : "progressbar" }`<br />
**slider** `{ "type" : "slider" }`<br />
**accordion** `{ "type" : "accordion" }`<br />
**tabs** `{ "type" : "tabs" }`<br />

### Subscribers

Some other features have been implemented as subscriber, e.g. adding entries to an accordion or making an element
resizable:

## Other plugins

### Form plugin

### Form validation

### jQuery Globalize

## Changelog

**0.2.0**

- Full QUnit test suite
- Improved documentation
- Changed API
- Added deferred loading of subscribers

**0.1.4**

* Merged pull request [#30](https://github.com/daffl/jquery.dform/pull/30):
Wrap 'type' as an array so it doesn't break jQuery 1.7.1's $.inArray() when running in IE8
* Added first QUnit tests
* Fixed issue #22 with jQuery UI accordion causing problems with captions
* Removed placeholder plugin. Use HTML 5 placeholders or the jQuery
[placeholder plugin](https://github.com/danielstocks/jQuery-Placeholder)
* Updated documentation engine to DocumentJS and build system to StealJS
* Merged pull request [#19](https://github.com/daffl/jquery.dform/pull/19) and
[#20](https://github.com/daffl/jquery.dform/pull/20),
support to set up a validate options for validate() in "form" type
* Merged pull request [#26](https://github.com/daffl/jquery.dform/pull/26) to support HTML 5 input types
* Added simple getting started example

**0.1.3**

* Created some public [JSFiddles for trying the plugin](http://jsfiddle.net/user/Daff/fiddles)
* Created [jQuery.dForm Google Group](http://groups.google.com/group/jquery-dform)
* Added *form* type, unified *buildForm* usage
* Fixed [issue #14](https://github.com/daffl/jquery.dform/issues/closed#issue/14), setting type attribute properly in IE
* Added *getValueAt*
* Added *i18n* support using the [jQuery globalize](https://github.com/jquery/jquery-global) plugin
* Fixed minor bugs in dform plugins

**0.1.2**

* Added *dformAttr* to add HTML attributes to elements
* Moved *placeholder* into a separate plugin
* Added *reset* button type
* Added dynamic form definition loading by passing a URL to the *buildForm* plugin function
* Added *ajax* subscriber using the *jQuery form plugin at http://jquery.malsup.com/form*
* Added the *defaultType* method to create any HTML element without having to register a type
* Improved build process

**0.1.1**

* Separated type and subscriber functions
* Added types *file*, *container*, *hidden*, *accordion*, *checkboxes* and *radiobuttons*
* Added auto class generation based on element type
* Finished jQuery UI *accordion* and unified with *tabs* usage
* Switched documentation to *Natualdocs at http://naturaldocs.org*
* Added build.xml for generating documentation and minifying JavaScript

**0.1**

* Initial release

## License

Copyright (C) 2012 [David Luecke](daff@neyeon.com), [http://daffl.github.com/jquery.dform]

The MIT license:

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
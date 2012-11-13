/*
---

name: Component

description:

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Element
	- Element.From
	- Element.Role
	- EventFirer

provides:
	- Component

...
*/

/**
 * @see    http://moobilejs.com/doc/latest/Component/Component
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @edited 0.3.0
 * @edited 0.2.1
 * @edited 0.2.0
 * @since  0.1.0
 */
Moobile.Component = new Class({

	Extends: Moobile.EventFirer,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_name: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_built: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_ready: false,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_window: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_parent: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_children: [],

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_visible: true,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_display: true,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_style: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	_events: {
		listeners: {},
		callbacks: {}
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_size: {x: 0, y: 0},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#element
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	element: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#options
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	options: {
		className: null,
		styleName: null,
		tagName: 'div'
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#initialization
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.1
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	initialize: function(element, options, name) {

		this.element = Element.from(element);
		if (this.element === null) {
			this.element = this.create();
		}

		this._name = name || this.element.get('data-name');

		options = options || {};

		for (var option in this.options) {
			if (options[option] === undefined) {
				var value = this.element.get('data-option-' + option.hyphenate());
				if (value !== null) {
					try { value = JSON.parse(value) } catch (e) {}
					options[option] = value;
				}
			}
		}

		this.setOptions(options);

		var marker = this.element;
		var exists = document.contains(this.element);
		if (exists) this.element = this.element.clone(true, true);

		this._willBuild();
		this._build();
		this._didBuild();

		if (exists) this.element.replaces(marker);

		window.addEvent('resize', this.bound('_onWindowResize'));
		window.addEvent('orientationchange', this.bound('_onWindowResize'));

		this.element.store('moobile:component', this);

		this._built = true;

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#create
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	create: function() {
		return document.createElement(this.options.tagName);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.1
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	_build: function() {

		var owner = this;
		var roles = this.__roles__;
		var attrs = this.__attributes__;

		for (var key in attrs) {
			var value = this.element.get(key);
			if (value !== null) {
				var handler = attrs[key];
				if (handler instanceof Function) {
					handler.call(this, value);
				}
			}
		}

		var className = this.options.className;
		if (className) this.addClass(className);

		var styleName = this.options.styleName
		if (styleName) this.setStyle(styleName);

		this.getRoleElements().each(function(element) {
			var handler = roles[element.getRole()].handler;
			if (handler instanceof Function) {
				handler.call(owner, element);
			}
		});

		// <0.2-compat>
		if (this.build) {
			this.build.call(this);
			console.log('[DEPRECATION NOTICE] The method "build" will be removed in 0.5, use the "_build" method instead');
		}
		// </0.2-compat>
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	addEvent: function(type, fn, internal) {

		var name = type.split(':')[0];

		if (this.eventIsNative(name)) {

			var self = this;
			var listeners = this._events.listeners;
			var callbacks = this._events.callbacks;
			if (callbacks[name] === undefined) {
				callbacks[name] = [];
				listeners[name] = function(e) {
					self.fireEvent(name, e);
				};
			}

			callbacks[name].include(fn);

			if (callbacks[name].length === 1) this.element.addEvent(name, listeners[name]);
		}

		return this.parent(type, fn, internal);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeEvent: function(type, fn) {

		if (Moobile.Component.hasNativeEvent(type) && this.eventIsNative(type)) {
			var listeners = this._events.listeners;
			var callbacks = this._events.callbacks;
			if (callbacks[type] && callbacks[type].contains(fn)) {
				callbacks[type].erase(fn);
				if (callbacks[type].length === 0) {
					this.element.removeEvent(type, listeners[type]);
					delete listeners[type];
					delete callbacks[type];
				}
			}
		}

		return this.parent(type, fn);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#eventIsNative
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	eventIsNative: function(name) {
		return Moobile.Component.hasNativeEvent(name);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	addChildComponent: function(component, where) {
		return this._addChildComponent(component, null, where);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addChildComponentInside
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	addChildComponentInside: function(component, context, where) {
		return this._addChildComponent(component,  document.id(context) || this.getElement(context), where);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addChildComponentAfter
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	addChildComponentAfter: function(component, after) {
		return this._addChildComponent(component, after, 'after');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addChildComponentBefore
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	addChildComponentBefore: function(component, before) {
		return this._addChildComponent(component, before, 'before');
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.3.0
	 * @edited 0.2.1
	 * @since  0.2.0
	 */
	_addChildComponent: function(component, context, where) {

		component.removeFromParentComponent();

		this._willAddChildComponent(component);

		if (context) {
			context = document.id(context) || this.element.getElement(context);
		} else {
			context = this.element;
		}

		var found = this.hasElement(component);
		if (found === false || where) {
			document.id(component).inject(context, where);
		}

		this._children.splice(this._getChildComponentIndexForElement(component) || 0, 0, component);
		component._setParent(this);
		component._setWindow(this._window);
		this._didAddChildComponent(component);

		this._didUpdateLayout();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildComponent: function(name) {
		return this._children.find(function(child) { return child.getName() === name; });
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponentOfType
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildComponentOfType: function(type, name) {

		var types = Array.from(type);

		var by = function(child) {
			return types.some(function(type) {
				return child instanceof type && child.getName() === name;
			});
		};

		return this._children.find(by);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponentAt
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildComponentAt: function(index) {
		return this._children[index] || null;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponentOfTypeAt
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildComponentOfTypeAt: function(type, index) {
		return this.getChildComponentsOfType(type)[index] || null;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponentIndex
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildComponentIndex: function(component) {
		return this._children.indexOf(component);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	_getChildComponentIndexForElement: function(element) {

		element = document.id(element);

		var index = -1;
		var nodes = this.element.querySelectorAll('*');
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node === element) {
				return index + 1;
			} else {
				var component = node.retrieve('moobile:component');
				if (component) {
					var value = this.getChildComponentIndex(component);
					if (index < value) {
						index = value;
					}
				}
			}
		}

		return null;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponents
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildComponents: function() {
		return this._children;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getChildComponentsOfType
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	getChildComponentsOfType: function(type) {

		var types = Array.from(type);

		var by = function(child) {
			return types.some(function(type) {
				return child instanceof type;
			});
		};

		return this._children.filter(by);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hasChildComponent: function(component) {
		return this._children.contains(component);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasChildComponentOfType
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hasChildComponentOfType: function(type) {
		return this._children.some(function(child) { return child instanceof type; });
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getDescendantComponent
	 * @author Tin LE GALL (imbibinebe@gmail.com)
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.1
	 */
	getDescendantComponent: function(name) {

	    var component = this.getChildComponent(name);
	    if (component === null) {
	    	for (var i = 0, len = this._children.length; i < len; i++) {
	    		var found = this._children[i].getDescendantComponent(name);
	    		if (found) return found;
	    	}
	    }

	    return component;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#replaceChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	replaceChildComponent: function(component, replacement, destroy) {
		return this.addChildComponentBefore(replacement, component).removeChildComponent(component, destroy);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#replaceWithComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	replaceWithComponent: function(component, destroy) {
		var parent = this.getParentComponent();
		if (parent) parent.replaceChildComponent(this, component, destroy);
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#removeChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.3.0
	 * @edited 0.2.1
	 * @since  0.1.0
	 */
	removeChildComponent: function(component, destroy) {

		if (!this.hasChildComponent(component))
			return this;

		this._willRemoveChildComponent(component);

		var element = component.getElement();
		if (element) {
			element.dispose();
		}

		this._children.erase(component);
		component._setParent(null);
		component._setWindow(null);
		this._didRemoveChildComponent(component);

		if (destroy) {
			component.destroy();
		}

		this._didUpdateLayout();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#removeAllChildComponents
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeAllChildComponents: function(destroy) {
		return this.removeAllChildComponentsOfType(Moobile.Component, destroy);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#removeChildComponentsOfType
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeAllChildComponentsOfType: function(type, destroy) {

		this._children.filter(function(child) {
			return child instanceof type;
		}).invoke('removeFromParentComponent', destroy);

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#removeFromParentComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeFromParentComponent: function(destroy) {
		var parent = this.getParentComponent();
		if (parent) parent.removeChildComponent(this, destroy);
		return this;
	},

	/**
	 * @deprecated
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.3.0
	 * @edited 0.2.1
	 * @since  0.1.0
	 */
	setParentComponent: function(parent) {
		console.log('[DEPRECATION NOTICE] The method "setParentComponent" will be removed in 0.5, this is not part of the public API anymore');
		return this._setParent(parent);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	_setParent: function(parent) {

		if (this._parent === parent)
			return this;

		this._parentComponentWillChange(parent);
		this._parent = parent;

		if (parent) {
			if (this._display) {
				this._visible = this._isVisible();
			}
		} else {
			this._visible = this._display;
		}

		this._parentComponentDidChange(parent);

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getParentComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getParentComponent: function() {
		return this._parent;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasParentComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hasParentComponent: function() {
		return !!this._parent;
	},

	/**
	 * @deprecated
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.3.0
	 * @edited 0.2.1
	 * @since  0.1.0
	 */
	setWindow: function(window) {
		console.log('[DEPRECATION NOTICE] The method "setWindow" will be removed in 0.5, this is not part of the public API anymore');
		return this._setWindow(window);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	_setWindow: function(window) {

		if (this._window === window)
			return this;

		this._windowWillChange(window);
		this._window = window;
		this._windowDidChange(window);

		this._children.invoke('_setWindow', window);

		if (this._window) {
			this._didBecomeReady();
			this._didUpdateLayout();
		}

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getWindow
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getWindow: function() {
		return this._window;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasWindow
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hasWindow: function() {
		return !!this._window;
	},

	/**
	 * @deprecated
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.3.0
	 * @edited 0.2.1
	 * @since  0.1.0
	 */
	setReady: function() {
		console.log('[DEPRECATION NOTICE] The method "setReady" will be removed in 0.5, this is not part of the public API anymore');
		this._didBecomeReady();
		return this;
	},


	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#isReady
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isReady: function() {
		return this._ready;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#isBuilt
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	isBuilt: function() {
		return this._built;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getName
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getName: function() {
		return this._name;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#setStyle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setStyle: function(name) {

		if (this._style) {
			this._style.detach.call(this, this.element);
			this._style = null;
		}

		var style = Moobile.Component.getStyle(name, this);
		if (style) {
			style.attach.call(this, this.element);
		}

		this._style = style;

		this._didUpdateLayout();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getStyle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getStyle: function() {
		return this._style ? this._style.name : null;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasStyle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	hasStyle: function(name) {
		return this._style ? this._style.name === name : false;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	addClass: function(name) {
		this.element.addClass(name);
		this._didUpdateLayout();
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#addClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeClass: function(name) {
		this.element.removeClass(name);
		this._didUpdateLayout();
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#toggleClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	toggleClass: function(name, force) {
		this.element.toggleClass(name, force);
		this._didUpdateLayout();
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	hasClass: function(name) {
		return this.element.hasClass(name);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getElements
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getElements: function(selector) {
		return this.element.getElements(selector || '*');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getElement
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getElement: function(selector) {
		return selector
			? this.element.getElement(selector)
			: this.element;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hasElement
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hasElement: function(element) {
		return this.element === document.id(element) || this.element.contains(document.id(element));
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getRoleElement
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	getRoleElement: function(name) {
		return this.getRoleElements(name, 1)[0] || null;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getRoleElements
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	getRoleElements: function(name, limit) {

		var roles = this.__roles__;
		var found = [];

		var walk = function(element) {

			if (limit && limit <= found.length)
				return;

			var nodes = element.childNodes;
			for (var i = 0, len = nodes.length; i < len; i++) {

				var node = nodes[i];
				if (node.nodeType !== 1)
					continue;

				var role = node.getRole();
				if (role === null) {
					walk(node);
					continue;
				}

				var behavior = roles[role];
				if (behavior) {

					if (name === role || !name) found.push(node);

					if (behavior.options.traversable) {
						walk(node);
						continue;
					}
				}
			}
		};

		walk(this.element);

		return found;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#setSize
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	setSize: function(x, y) {

		if (x > 0 || x === null) this.element.setStyle('width', x);
		if (y > 0 || y === null) this.element.setStyle('height', y);

		this._didResize();
		this._didUpdateLayout();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getSize
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getSize: function() {
		return this.element.getSize();
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#getPosition
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getPosition: function(relative) {
		return this.element.getPosition(document.id(relative) || this._parent);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#show
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.1
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	show: function() {

		if (this._visible)
			return this;

		this._display = true;

		this._willShow();
		this.element.removeClass('hidden');
		this._didShow();

		this._didUpdateLayout();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#hide
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.1
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	hide: function() {

		if (this._visible === false)
			return this;

		this._display = false;

		this._willHide();
		this.element.addClass('hidden');
		this._didHide();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#isVisible
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isVisible: function() {
		return this._visible;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_isVisible: function() {
		return this._visible ? (this._parent && this._parent._isVisible()) : false;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_willBuild: function() {
		this.willBuild();
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#willBuild
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willBuild: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didBuild: function() {
		this.didBuild();
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didBuild
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didBuild: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didBecomeReady: function() {

		if (this._ready)
			return this;

		this._ready = true;
		this.didBecomeReady();
		this._children.invoke('_didBecomeReady');
		this.fireEvent('ready');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didBecomeReady
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didBecomeReady: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didResize: function() {

		var size = this.getSize();
		if (size.x === this._size.x &&
			size.y === this._size.y)
			return;

		this._size = size;

		this.didResize(size.x, size.y);
		this._children.invoke('_didResize');
		this.fireEvent('resize', [size.x, size.y]);

		this._didUpdateLayout();
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didResize
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	didResize: function(x, y) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didUpdateLayout: function() {

		if (this._built === false ||
			this._ready === false)
			return;

		this.didUpdateLayout();
		this.fireEvent('layout');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didUpdateLayout
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	didUpdateLayout: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_willAddChildComponent: function(component) {
		this.willAddChildComponent(component);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#willAddChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willAddChildComponent: function(component) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didAddChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didAddChildComponent: function(component) {
		this.didAddChildComponent(component);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didAddChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didAddChildComponent: function(component) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_willRemoveChildComponent: function(component) {
		this.willRemoveChildComponent(component);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#willRemoveChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willRemoveChildComponent: function(component) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didRemoveChildComponent: function(component) {
		this.didRemoveChildComponent(component);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didRemoveChildComponent
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didRemoveChildComponent: function(component) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_parentComponentWillChange: function(parent) {
		this.parentComponentWillChange(parent);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#parentComponentWillChange
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	parentComponentWillChange: function(parent) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_parentComponentDidChange: function(parent) {
		this.parentComponentDidChange(parent);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#parentComponentDidChange
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	parentComponentDidChange: function(parent) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_windowWillChange: function(window) {
		this.windowWillChange(window);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#windowWillChange
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	windowWillChange: function(window) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	_windowDidChange: function(window) {
		this.windowDidChange(window);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#windowDidChange
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	windowDidChange: function(window) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_willShow: function() {

		if (this._display === false)
			return;

		this.willShow();
		this._children.invoke('_willShow');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#willShow
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willShow: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didShow: function() {

		if (this._display === false)
			return;

		this._visible = true;
		this.didShow();
		this._children.invoke('_didShow');
		this.fireEvent('show');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didShow
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didShow: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_willHide: function() {
		this.willHide();
		this._children.invoke('_willHide');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#willHide
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willHide: function() {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_didHide: function() {
		this._visible = false;
		this.didHide();
		this._children.invoke('_didHide');
		this.fireEvent('hide');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#didHide
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didHide: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Component/Component#destroy
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.1
	 * @since  0.1.0
	 */
	destroy: function() {

		window.removeEvent('resize', this.bound('_onWindowResize'));
		window.removeEvent('orientationchange', this.bound('_onWindowResize'));

		this.removeAllChildComponents(true);
		this.removeFromParentComponent();
		this.element.destroy();
		this.element = null;
		this._window = null;
		this._parent = null;

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	toElement: function() {
		return this.element;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	_onWindowResize: function() {
		this._didResize();
	}

});

/**
 * @see    http://moobilejs.com/doc/latest/Component/Component#defineRole
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @edited 0.2.0
 * @since  0.1.0
 */
Moobile.Component.defineRole = function(name, context, options, handler) {

	context = (context || Moobile.Component).prototype;
	if (context.__roles__ === undefined) {
	 	context.__roles__ = {};
	}

	if (options) {

		switch (typeof options) {

			case 'function':
				handler = options;
				options = {};
				break;

			case 'object':
				if (typeof options.behavior === 'function') handler = options.behavior;
				break;
		}
	}

	context.__roles__[name] = {
		handler: handler || function() {},
		options: options || {}
	};
};


/**
 * @see    http://moobilejs.com/doc/latest/Component/Component#defineAttribute
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.2.0
 */
Moobile.Component.defineAttribute = function(name, context, handler) {
	context = (context || Moobile.Component).prototype;
	if (context.__attributes__ === undefined) {
		context.__attributes__ = {};
	}
	context.__attributes__[name] = handler;
};

/**
 * @see    http://moobilejs.com/doc/latest/Component/Component#defineStyle
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @edited 0.2.0
 * @since  0.1.0
 */
Moobile.Component.defineStyle = function(name, target, handler) {
	var context = (target || Moobile.Component).prototype;
	if (context.__styles__ === undefined) {
		context.__styles__ = {};
	}
	context.__styles__[name] = Object.append({
		name: name,
		attach: function() {},
		detach: function() {}
	}, handler);
};

/**
 * @see    http://moobilejs.com/doc/latest/Component/Component#getRole
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1.0
 */
Moobile.Component.getStyle = function(name, target) {
	return target.__styles__
		 ? target.__styles__[name]
		 : null;
};

/**
 * @see    http://moobilejs.com/doc/latest/Component/Component#create
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1.0
 */
Moobile.Component.create = function(klass, element, descriptor, options, name) {

	element = Element.from(element);

	if (descriptor) {
		var subclass = element.get(descriptor);
		if (subclass) {
			var instance = Class.instantiate(subclass, element, options, name);
			if (instance instanceof klass) {
				return instance;
			}
		}
	}

	return new klass(element, options, name);
};

(function() {

// TODO: Also add native events to Element.NativeEvent when using addNativeEvent

var events = Object.keys(Element.NativeEvents);

Moobile.Component.addNativeEvent = function(name) {
	events.include(name);
};

Moobile.Component.hasNativeEvent = function(name) {
	return events.contains(name);
};

Moobile.Component.removeNativeEvent = function(name) {
	events.erase(name);
};

Moobile.Component.addNativeEvent('tapstart');
Moobile.Component.addNativeEvent('tapmove');
Moobile.Component.addNativeEvent('tapend');
Moobile.Component.addNativeEvent('tap');
Moobile.Component.addNativeEvent('pinch');
Moobile.Component.addNativeEvent('swipe');
Moobile.Component.addNativeEvent('animationend');
Moobile.Component.addNativeEvent('transitionend');
Moobile.Component.addNativeEvent('owntransitionend');
Moobile.Component.addNativeEvent('ownanimationend');

})();

/**
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.2.0
 */
Moobile.Component.defineAttribute('data-style', null, function(value) {
	this.options.styleName = value;
});

/*
---

name: Alert

description: Provides a control that displays a modal alert message.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Control

provides:
	- Alert

...
*/

/**
 * @name  Alert
 * @class Provides a modal alert control.
 *
 * @classdesc
 *
 * [TODO: Description]
 * [TODO: Events]
 * [TODO: Roles]
 * [TODO: Styles]
 * [TODO: Options]
 * [TODO: Element Structure]
 *
 * @extends Overlay
 *
 * @author  Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @version 0.1
 */
Moobile.Alert = new Class( /** @lends Alert.prototype */ {

	Extends: Moobile.Control,

	/**
	 * @var    {Label} The title.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	title: null,

	/**
	 * @var    {Text} The message.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	message: null,

	/**
	 * @var    {Array} The buttons.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	buttons: [],

	/**
	 * @var    {Element} The dialog element.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	dialog: null,

	/**
	 * @var    {Element} The dialog header element.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	dialogHeader: null,

	/**
	 * @var    {Element} The dialog footer element.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	dialogFooter: null,

	/**
	 * @var    {Element} The dialog content element.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	dialogContent: null,

	/**
	 * @var    {Overlay} The alert overlay.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	overlay: null,

	destroy: function() {

		this.element.addEvent('animationend', this.bound('onAnimationEnd'));

		this.title = null;
		this.message = null;

		this.dialog = null;
		this.dialogHeader = null;
		this.dialogFooter = null;
		this.dialogContent = null;

		this.overlay.destroy();
		this.overlay = null;

		this.parent();
	},

	/**
	 * Sets the title.
	 *
	 * This method will set the title using either a string or an instance of a
	 * `Label`. When provided with a string, this methods creates a `Label`
	 * instance and assign the given string as its text.
	 *
	 * @param {Mixed} title The title as a string or a `Label` instance.
	 *
	 * @return {Alert} This alert.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setTitle: function(title) {

		if (this.title === title)
			return this;

		if (typeof title == 'string') {
			var text = title;
			title = new Moobile.Label();
			title.setText(text);
		}

		if (this.title == null) {
			this.title = title;
			this.addChild(title, 'top', this.dialogHeader);
		} else {
			this.replaceChild(this.title, title);
			this.title.destroy();
			this.title = title;
		}

		return this;
	},

	/**
	 * Returns the title.
	 *
	 * @return {Label} The title.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getTitle: function() {
		return this.title;
	},

	/**
	 * Sets the message.
	 *
	 * This method will set the message using either a string or an instance of
	 * a `Text`. When provided with a string, this methods creates a `Text`
	 * instance and assign the given string as its text.
	 *
	 * @param {Mixed} message The message as string or a `Text` instance.
	 *
	 * @return {Alert} This alert.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setMessage: function(message) {

		if (this.message === message)
			return this;

		if (typeof message == 'string') {
			var text = message;
			message = new Moobile.Label();
			message.setText(text);
		}

		if (this.message == null) {
			this.message = message;
			this.addChild(message, 'top', this.dialogContent);
		} else {
			this.replaceChild(this.message, message);
			this.message.destroy();
			this.message = message;
		}

		return this;
	},

	/**
	 * Returns the message.
	 *
	 * @return {Text} The message.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getMessage: function() {
		return this.message;
	},

	/**
	 * Adds a button.
	 *
	 * This method will add the given button at the bottom of the element that
	 * contains buttons. The presentation of the buttons, either vertical or
	 * horizontal is defined by setting the proper style to this alert.
	 *
	 * @param {Button} button The button.
	 *
	 * @return {Alert} This alert.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	addButton: function(button) {
		this.addChild(button, 'bottom', this.dialogFooter);
		return this;
	},

	/**
	 * Shows the overlay with an animation.
	 *
	 * This method will show the overlay by adding the `show-animated` CSS
	 * class to the element. Update the properties of this CSS class to
	 * customize the animation.
	 *
	 * @return {Overlay} This overlay.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	showAnimated: function() {
		this.willShow();
		this.element.show();
		this.element.addClass('show-animated');
		this.overlay.showAnimated();
		return this;
	},

	/**
	 * Hides the overlay with an animation.
	 *
	 * This method will hide the overlay by adding the `hide-animated` CSS
	 * class to the element. Update the properties of this CSS class to
	 * customize the animation.
	 *
	 * @return {Overlay} This overlay.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hideAnimated: function() {
		this.willHide();
		this.element.addClass('hide-animated');
		this.overlay.hideAnimated();
		return this;
	},

	didLoad: function() {

		this.parent();

		this.element.addClass('alert');
		this.element.addEvent('animationend', this.bound('onAnimationEnd'));

		this.overlay = new Moobile.Overlay();
		this.overlay.setStyle('radial');
		this.addChild(this.overlay);

		this.dialogHeader  = new Element('div.dialog-header');
		this.dialogFooter  = new Element('div.dialog-footer');
		this.dialogContent = new Element('div.dialog-content');

		this.dialog = new Element('div.dialog');
		this.dialog.grab(this.dialogHeader);
		this.dialog.grab(this.dialogContent);
		this.dialog.grab(this.dialogFooter);

		this.element.grab(this.dialog);
	},

	didAddChild: function(entity) {

		this.parent(entity);

		if (entity instanceof Moobile.Button) {
			entity.addEvent('click', this.bound('onButtonClick'));
			entity.addEvent('mouseup', this.bound('onButtonMouseUp'));
			entity.addEvent('mousedown', this.bound('onButtonMouseUp'));
			this.buttons.include(entity);
		}
	},

	didRemoveChild: function(entity) {

		this.parent(entity);

		if (entity instanceof Moobile.Button) {
			entity.removeEvent('click', this.bound('onButtonClick'));
			entity.removeEvent('mouseup', this.bound('onButtonMouseUp'));
			entity.removeEvent('mousedown', this.bound('onButtonMouseUp'));
			this.buttons.erase(entity);
		}
	},

	willShow: function() {

		this.parent();

		if (this.buttons.length == 0) {
			var button = new Moobile.Button();
			button.setLabel('OK');
			this.addButton(button);
		}
	},

	didHide: function() {
		this.parent();
		this.destroy();
	},

	onButtonClick: function(e) {
		this.fireEvent('buttonclick', e.target);
		if (this.buttons.length == 1) this.hideAnimated();
	},

	onButtonMouseUp: function(e) {
		this.fireEvent('buttonmouseup');
	},

	onButtonMouseDown: function(e) {
		this.fireEvent('buttonmousedown');
	},

	onAnimationEnd: function(e) {

		e.stop();

		if (this.element.hasClass('show-animated')) {
			this.element.removeClass('show-animated');
			this.didShow();
		}

		if (this.element.hasClass('hide-animated')) {
			this.element.removeClass('hide-animated');
			this.element.hide();
			this.didHide();
		}
	}

});

//------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------

Moobile.Entity.defineStyle('horizontal', Moobile.Alert, {
	attach: function() { this.element.addClass('style-horizontal'); },
	detach: function() { this.element.removeClass('style-horizontal'); }
});

const Main = imports.ui.main;
const Lang = imports.lang;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;

const Self = ExtensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;
const ui = imports.ui;

// const SHADE_TIME = 0.3;
// const SHADE_BRIGHTNESS = -0.35;
const DIMMER_SHORTCUT = 'dimmer-shortcut';
const BRIGHTER_SHORTCUT = 'brighter-shortcut'

// function inject_after(proto, name, func) {
// 	let orig = proto[name];

// 	proto[name] = function() {
// 		let ret = orig.apply(this, arguments);
// 		return func.apply(this, [ret].concat([].slice.call(arguments)));
// 	}

// 	return orig;
// }

// function remove_injection(proto, name, orig) {
// 	proto[name] = orig;
// }

const InvertWindowEffect = new Lang.Class({
	Name: 'InvertWindowEffect',
	Extends: Clutter.BrightnessContrastEffect,

	_init: function (actor) {
		this._effect = new Clutter.BrightnessContrastEffect();
		actor.add_effect_with_name('adjust-brightness', this._effect);
		this.actor = actor;
		// this._enabled = true;
		// this._effect.enabled = (this._shadeLevel > 0);
		this._shade_brightness = 0.0
		// this._shadeLevel = 1.0;
		// this._effect.set_brightness(this._shade_brightness);
	},

	_brighter: function(){
		if(this._shade_brightness < 0.6){
			this._shade_brightness += 0.1
		}
		this._effect.set_brightness(this._shade_brightness)
	},

	_dimmer: function () {
		if (this._shade_brightness > -0.6) {
			this._shade_brightness -= 0.1
		}
		this._effect.set_brightness(this._shade_brightness)
	}

		// set shadeLevel(level) {
		// 	this._shadeLevel = level;
		// 	this._effect.set_brightness(level * SHADE_BRIGHTNESS);
		// 	this._effect.enabled = (this._shadeLevel > 0);
		// },

		// get shadeLevel() {
		// 	return this._shadeLevel;
		// }
});

function InvertWindow() {
	this.settings = Convenience.getSettings();
	this.workspace_injection = null;
	this.alttab_injection = null;
}

// function setShade(effect, )

InvertWindow.prototype = {
	dimmer_effect: function() {
		global.get_window_actors().forEach(function (actor) {
			let meta_window = actor.get_meta_window();

			if (meta_window.has_focus()) {
				// if (actor.get_effect('invert-color')) {
				// 	actor.remove_effect_by_name('invert-color');
				// 	delete meta_window._invert_window_tag;
				// } 
				// let shader = new Clutter.BrightnessContrastEffect();
				
				// actor.add_effect_with_name('invert-color', effect);
				// effect.set_brightness(1.0 * SHADE_BRIGHTNESS);
				// effect.enabled = true;
				if (! actor.get_effect('adjust-brightness')) {
					meta_window.effect_ref = new InvertWindowEffect()
				}

				meta_window.effect_ref._dimmer()
				// meta_window._adjust_window_tag = true;
			}
		}, this);
	},

	brighter_effect: function (){
		global.get_window_actors().forEach(function (actor) {
			let meta_window = actor.get_meta_window();

			if (meta_window.has_focus()) {
				if (! actor.get_effect('adjust-brightness')) {
					meta_window.effect_ref = new InvertWindowEffect()
				}

				meta_window.effect_ref._brighter()
				// meta_window._adjust_window_tag = true;
			}
		}, this);
	},

	enable: function() {
		Main.wm.addKeybinding(
			DIMMER_SHORTCUT,
			this.settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL,
			Lang.bind(this, this.dimmer_effect)
		);
		Main.wm.addKeybinding(
			BRIGHTER_SHORTCUT,
			this.settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL,
			Lang.bind(this, this.brighter_effect)
		);

		// this.workspace_injection = inject_after(ui.workspace.WindowClone.prototype, '_init', function(ret) {
		// 	if(this.realWindow.get_effect('invert-color')) {
		// 		let shader = InvertWindowEffect();
		// 		this.actor.add_effect_with_name('invert-color', effect);
		// 		effect.set_brightness(1.0 * SHADE_BRIGHTNESS);
		// 		effect.enabled = true;
		// 	}
		// 	return ret;
		// });

		// this.alttab_injection = inject_after(ui.altTab, '_createWindowClone', function(clone, window, size) {
		// 	if(window.get_effect('invert-color')) {
		// 		let effect = new Clutter.BrightnessContrastEffect();
		// 		clone.add_effect_with_name('invert-color', effect);
		// 		effect.set_brightness(1.0 * SHADE_BRIGHTNESS);
		// 		effect.enabled = true;
		// 	}
		// 	return clone;
		// });

		// apply shder for all windows with tag
		// global.get_window_actors().forEach(function(actor) {
		// 	let meta_window = actor.get_meta_window();
		// 	if(meta_window.hasOwnProperty('_invert_window_tag')) {
		// 		let effect = new Clutter.BrightnessContrastEffect();
		// 		actor.add_effect_with_name('invert-color', effect);
		// 		effect.set_brightness(1.0 * SHADE_BRIGHTNESS);
		// 		effect.enabled = true;
		// 	}
		// }, this);
	},

	disable: function() {
		Main.wm.removeKeybinding(DIMMER_SHORTCUT);
		Main.wm.removeKeybinding(BRIGHTER_SHORTCUT);

		global.get_window_actors().forEach(function(actor) {
			actor.remove_effect_by_name('adjust-brightness');
		}, this);

		// remove_injection(ui.workspace.WindowClone.prototype, '_init', this.workspace_injection);
		// this.workspace_injection = null;

		// remove_injection(ui.altTab, '_createWindowClone', this.alttab_injection);
		// this.alttab_injection = null;
	}
};

/** Main program */

let invert_window;

function init() {
}

function enable() {
	invert_window = new InvertWindow();
	invert_window.enable();
}

function disable() {
	invert_window.disable();
	invert_window = null;
}


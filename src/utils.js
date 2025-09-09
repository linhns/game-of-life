import { IO } from "monio";

const getElementById = (id) => IO(() => document.getElementById(id));
const querySelectorAll = (sel) => IO(() => document.querySelectorAll(sel));

const prop = (p) => (obj) => obj[p];
const setProp = (p, val) => (obj) => {
	obj[p] = val;
	return obj;
};

const bindEvent = (el, evt, fn) => IO(() => el.addEventListener(evt, fn));
const unbindEvent = (el, evt, fn) => IO(() => el.removeEventListener(evt, fn));

export {
	getElementById,
	querySelectorAll,
	prop,
	setProp,
	bindEvent,
	unbindEvent,
};

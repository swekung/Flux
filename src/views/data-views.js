import { xf, exists, existance, equals, avg } from '../functions.js';
import { formatTime, stringToBool } from '../utils.js';

//
// DataView
//
// Usage:
// <data-view id="count-value"
//            prop="db:count">--</data-view>
//
// Template Method:
// overwrite methods to augment the general logic
//
// getDefaults() -> setup default and fallback values
// config()      -> work with attributes and props here
// subs()        -> subscribe to events or db
// unsubs()      -> clean up subscribe to events or db
// getValue()    -> getter for the value for state from a complex prop say an object or array
// onUpdate()    -> determine the rules for state update that will trigger rendering
// transform()   -> apply transforming functions to state just before rendering
//
class DataView extends HTMLElement {
    constructor() {
        super();
        this.state = '';
        this.postInit();
    }
    postInit() { return; }
    static get observedAttributes() {
        return ['disabled'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(equals(name, 'disabled')) {
            this.disabled = exists(newValue) ? false : true;
        }
    }
    getDefaults() {
        return {};
    }
    config() {
        return;
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
    }
    connectedCallback() {
        this.prop     = existance(this.getAttribute('prop'), this.getDefaults().prop);
        this.disabled = this.hasAttribute('disabled');

        this.config();
        this.subs();
    }
    unsubs() { return; }
    disconnectedCallback() {
        window.removeEventListener(`${this.prop}`, this.onUpdate);
        this.unsubs();
    }
    getValue(propValue) {
        return propValue;
    }
    shouldUpdate(value) {
        return !equals(value, this.state) && !this.disabled;
    }
    onUpdate(propValue) {
        const value = this.getValue(propValue);

        if(this.shouldUpdate(value)) {
            this.state = value;
            this.render();
        }
    }
    transform(state) {
        return state;
    }
    render() {
        this.textContent = this.transform(this.state);
    }
}

customElements.define('data-view', DataView);

class TimerTime extends DataView {
    getDefaults() {
        return {
            format: 'hh:mm:ss',
            prop:   'db:watch',
        };
    }
    config() {
        this.format = existance(this.getAttribute('format'), this.getDefaults().format);
    }
    getValue(propValue) {
        return propValue.timer.timerTime;
    }
    transform(state) {
        return formatTime({value: this.state, format: this.format, unit: 'seconds'});
    }
}

customElements.define('timer-time', TimerTime);

class IntervalTime extends DataView {
    getDefaults() {
        return {
            format: 'mm:ss',
            prop:   'db:watch',
        };
    }
    config() {
        this.format = existance(this.getAttribute('format'), this.getDefaults().format);
    }
    getValue(propValue) {
        return propValue.workout.lapTime;
    }
    transform(state) {
        return formatTime({value: this.state, format: this.format, unit: 'seconds'});
    }
}

customElements.define('interval-time', IntervalTime);


class CadenceView extends DataView {
    getDefaults() {
        return {
            prop: 'db:cadence',
        };
    }
}

customElements.define('cadence-view', CadenceView);


class HeartRateView extends DataView {
    getDefaults() {
        return {
            prop: 'db:heartRate',
        };
    }
}

customElements.define('heart-rate-view', HeartRateView);


class WorkoutName extends DataView {
    getDefaults() {
        return {
            prop: 'db:workout',
        };
    }
    getValue(propValue) {
        return propValue.name;
    }
}

customElements.define('workout-name', WorkoutName);

class PowerView extends DataView {
    config() {
        this.buffer = [];
        this.smoothing = 0;
        this.tolerance = 10;
        this.lastUpdate = Date.now();
        xf.sub('db:powerSmoothing', this.onPowerSmoothing.bind(this));
    }
    getDefaults() {
        return {
            prop: 'db:power',
        };
    }
    isSmoothingOff() {
        return equals(this.smoothing, 0);
    }
    canUpdate() {
        const elapsed = Date.now() - this.lastUpdate;
        return (this.smoothing - elapsed) < this.tolerance;
    }
    shouldUpdate(value) {
        if(this.isSmoothingOff()) {
            return !equals(value, this.state) && !this.disabled;
        } else if(this.canUpdate()) {
            return !equals(value, this.state) && !this.disabled;
        } else {
            return false;
        }
    };
    onUpdate(propValue) {
        const value = this.getValue(propValue);

        this.buffer.push(value);

        if(this.shouldUpdate()) {
            this.state = avg(this.buffer);
            this.buffer = [];
            this.lastUpdate = Date.now();
            this.render();
        }
    }
    onPowerSmoothing(value) {
        this.smoothing = value;
    }
}

customElements.define('power-view', PowerView);

export {
    DataView,
    TimerTime,
    IntervalTime,
    CadenceView,
    HeartRateView,
    PowerView,

    WorkoutName,
}


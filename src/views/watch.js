import { equals, xf } from '../functions.js';

class Watch extends HTMLElement {
    constructor(args = {}) {
        super();
        this.selectors = {
            start:        '#watch-start',
            pause:        '#watch-pause',
            lap:          '#watch-lap',
            stop:         '#watch-stop',
            save:         '#activity-save',
            workoutStart: '#workout-start',
            workoutPause: '#workout-pause',
        };
    }
    connectedCallback() {
        const self = this;
        this.dom = {
            start:        document.querySelector(this.selectors.start),
            pause:        document.querySelector(this.selectors.pause),
            lap:          document.querySelector(this.selectors.lap),
            stop:         document.querySelector(this.selectors.stop),
            save:         document.querySelector(this.selectors.save),
            workoutStart: document.querySelector(this.selectors.workoutStart),
            workoutPause: document.querySelector(this.selectors.workoutPause),
        };

        this.dom.start.addEventListener('pointerup', this.onStart);
        this.dom.pause.addEventListener('pointerup', this.onPause);
        this.dom.lap.addEventListener('pointerup', this.onLap);
        this.dom.stop.addEventListener('pointerup', this.onStop);
        this.dom.workoutStart.addEventListener('pointerup', this.onWorkoutStart);
        this.dom.workoutPause.addEventListener('pointerup', this.onWorkoutPause);
        this.dom.save.addEventListener(`pointerup`, this.onSave);

        this.renderInit(this.dom);

        xf.sub('watch:status', this.onWatchStatus.bind(this));
    }
    disconnectedCallback() {
        this.dom.start.removeEventListener(`pointerup`, this.onStart);
        this.dom.pause.removeEventListener(`pointerup`, this.onPause);
        this.dom.lap.removeEventListener(`pointerup`, this.onLap);
        this.dom.stop.removeEventListener(`pointerup`, this.onStop);
        this.dom.workoutStart.removeEventListener(`pointerup`, this.onWorkoutStart);
        this.dom.workoutPause.removeEventListener(`pointerup`, this.onWorkoutPause);
        this.dom.save.removeEventListener(`pointerup`, this.onSave);

        xf.unsub('watch:status', this.onWatchStatus);

    }
    onStart(e) { xf.dispatch('ui:timerStart'); }
    onPause(e) { xf.dispatch('ui:timerPause'); }
    onLap(e)   { xf.dispatch('ui:watchLap'); }
    onStop(e)  {
        const stop = confirm('Confirm Stop?');
        if(stop) {
            xf.dispatch('ui:timerStop');
        }
    }
    onSave(e)  { xf.dispatch('ui:activitySave'); }
    onWorkoutStart(e) { xf.dispatch('ui:workoutStart'); }
    onWorkoutPause(e) { xf.dispatch('ui:workoutPause'); }
    onWatchStatus({timer, workout}) {
        if(equals(workout, 'init')) {
            this.renderInit(this.dom);
        }
        if(equals(timer, 'started')) {
            this.renderStarted(this.dom);
        }
        if(equals(timer, 'paused')) {

            if(equals(workout, 'started')) {
                this.renderPausedAll(this.dom);
                return;
            } else {
                this.renderPaused(this.dom);
            }
        }
        if(equals(timer, 'stopped')) {
            this.renderStopped(this.dom);
            return;
        }

        if(equals(workout, 'started')) {
            this.renderWorkoutStarted(this.dom);
        }
        if(equals(workout, 'paused')) {
            this.renderWorkoutPaused(this.dom);
        }
        if(equals(workout, 'finished')) {
            this.renderWorkoutFinished(this.dom);
        }

    }
    renderInit(dom) {
        dom.start.style.display = 'inline-block';
        dom.pause.style.display = 'none';
        dom.lap.style.display   = 'none';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'none';

        dom.workoutStart.style.display = 'inline-block';
        dom.workoutPause.style.display = 'none';
    };
    renderStarted(dom) {
        dom.start.style.display = 'none';
        dom.pause.style.display = 'inline-block';
        dom.lap.style.display   = 'inline-block';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'none';
    };
    renderPaused(dom) {
        dom.pause.style.display = 'none';
        dom.lap.style.display   = 'none';
        dom.start.style.display = 'inline-block';
        dom.stop.style.display  = 'inline-block';
    };
    renderStopped(dom) {
        dom.start.style.display = 'inline-block';
        dom.pause.style.display = 'none';
        dom.lap.style.display   = 'none';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'inline-block';

        dom.workoutStart.style.display = 'none';
    };
    renderWorkoutStarted(dom) {
        dom.workoutStart.style.display = 'none';
        dom.workoutPause.style.display = 'inline-block';
        dom.lap.style.display          = 'inline-block';
    };
    renderWorkoutPaused(dom) {
        dom.workoutStart.style.display = 'inline-block';
        dom.workoutPause.style.display = 'none';

        dom.lap.style.display   = 'none';
    };
    renderWorkoutFinished(dom) {
        dom.workoutStart.style.display = 'inline-block';
        dom.workoutPause.style.display = 'none';
    }
    renderPausedAll(dom) {
        dom.pause.style.display = 'none';
        dom.lap.style.display   = 'none';
        dom.start.style.display = 'inline-block';
        dom.stop.style.display  = 'inline-block';

        dom.workoutStart.style.display = 'none';
        dom.workoutPause.style.display = 'none';
    }
    renderStartedAll(dom) {
        dom.start.style.display = 'none';
        dom.pause.style.display = 'inline-block';
        dom.lap.style.display   = 'inline-block';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'none';

        dom.workoutStart.style.display = 'none';
        dom.workoutPause.style.display = 'inline-block';
    }
}

customElements.define('watch-control', Watch);

export { Watch };

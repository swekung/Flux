/**
 * @jest-environment jsdom
 */

import { first, last, xf } from '../src/functions.js';
import { Timer, WorkoutRunner } from '../src/watch.js';
import { ActivityData, Record, Lap, Events } from '../src/models/activity-data.js';
import { Session } from '../src/session.js';

import { page } from './page.js';
import { watch } from '../src/views/watch.js';

import { JSDOM } from 'jsdom';

describe('Watch View', () => {

    const dom = new JSDOM();
    window.document.body.innerHTML = page;

    test('connection-switch', () => {
        expect(document.querySelector('#switch-controllable .switch--label').textContent).toBe('Controllable');
        expect(document.querySelector('#switch-hrm .switch--label').textContent).toBe('HRM');
    });

    test('time-display', () => {
        expect(document.querySelector('#interval-time').textContent).toBe('--:--');
        expect(document.querySelector('#elapsed-time').textContent).toBe('--:--:--');
    });


    test('watch-control', () => {
        // init
        // jest.fn()

        let db = { power: 180 };

        let session = Session({workout: workoutJS});
        // end init

        expect(document.querySelector('#watch-pause').style.display).toBe('none');
        expect(document.querySelector('#watch-lap').style.display).toBe('none');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:timerStart');

        expect(document.querySelector('#watch-start').style.display).toBe('none');
        expect(document.querySelector('#watch-pause').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-lap').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:timerPause');

        expect(document.querySelector('#watch-start').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-pause').style.display).toBe('none');
        expect(document.querySelector('#watch-lap').style.display).toBe('none');
        expect(document.querySelector('#watch-stop').style.display).toBe('inline-block');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:timerResume');

        expect(document.querySelector('#watch-start').style.display).toBe('none');
        expect(document.querySelector('#watch-pause').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-lap').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:workoutStart');

        expect(document.querySelector('#workout-start').style.display).toBe('none');
        expect(document.querySelector('#workout-pause').style.display).toBe('inline-block');

        expect(document.querySelector('#watch-start').style.display).toBe('none');
        expect(document.querySelector('#watch-pause').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-lap').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:workoutPause');

        expect(document.querySelector('#workout-start').style.display).toBe('inline-block');
        expect(document.querySelector('#workout-pause').style.display).toBe('none');

        expect(document.querySelector('#watch-start').style.display).toBe('none');
        expect(document.querySelector('#watch-pause').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-lap').style.display).toBe('none');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:workoutStart');

        expect(document.querySelector('#workout-start').style.display).toBe('none');
        expect(document.querySelector('#workout-pause').style.display).toBe('inline-block');

        expect(document.querySelector('#watch-start').style.display).toBe('none');
        expect(document.querySelector('#watch-pause').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-lap').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        xf.dispatch('ui:timerPause');

        expect(document.querySelector('#watch-start').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-pause').style.display).toBe('none');
        expect(document.querySelector('#watch-lap').style.display).toBe('none');
        expect(document.querySelector('#watch-stop').style.display).toBe('inline-block');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        expect(document.querySelector('#workout-start').style.display).toBe('inline-block');
        expect(document.querySelector('#workout-pause').style.display).toBe('none');

        xf.dispatch('ui:timerResume');

        expect(document.querySelector('#watch-start').style.display).toBe('none');
        expect(document.querySelector('#watch-pause').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-lap').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        expect(document.querySelector('#workout-start').style.display).toBe('none');
        expect(document.querySelector('#workout-pause').style.display).toBe('inline-block');

        xf.dispatch('ui:timerPause');

        expect(document.querySelector('#watch-start').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-pause').style.display).toBe('none');
        expect(document.querySelector('#watch-lap').style.display).toBe('none');
        expect(document.querySelector('#watch-stop').style.display).toBe('inline-block');
        expect(document.querySelector('#activity-save').style.display).toBe('none');

        expect(document.querySelector('#workout-start').style.display).toBe('inline-block');
        expect(document.querySelector('#workout-pause').style.display).toBe('none');

        xf.dispatch('ui:timerStop');

        expect(document.querySelector('#watch-start').style.display).toBe('inline-block');
        expect(document.querySelector('#watch-pause').style.display).toBe('none');
        expect(document.querySelector('#watch-lap').style.display).toBe('none');
        expect(document.querySelector('#watch-stop').style.display).toBe('none');
        expect(document.querySelector('#activity-save').style.display).toBe('inline-block');

        expect(document.querySelector('#workout-start').style.display).toBe('none');
        expect(document.querySelector('#workout-pause').style.display).toBe('none');
    });

});

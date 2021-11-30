/**
 * @jest-environment jsdom
 */

import { first, last, xf } from '../src/functions.js';
import { Timer, WorkoutRunner } from '../src/watch/timer.js';
import { ActivityData, Record, Lap, Events } from '../src/watch/activity-data.js';
import { Watch } from '../src/watch/watch.js';

import { page } from './page.js';
import { watch } from '../src/views/watch.js';

import { JSDOM } from 'jsdom';

import indexedDB from 'fake-indexeddb';

window.indexedDB = indexedDB;

const workoutJS = {
    id: "{1ec20f99-b3d8-4eb9-c000-be96e947897a}",
    name: "Test Workout",
    description: "Description of test workout.",
    duration: 1, // 60s
    effort: "Sweet Spot",
    intervals: [
        {duration: 10, steps: [{duration: 3, power: 0.50},
                               {duration: 3, power: 0.60},
                               {duration: 4, power: 0.70},]},
        {duration: 15, steps: [{duration: 15, power: 0.90}]},
        {duration: 10, steps: [{duration: 10, power: 0.70}]},
        {duration: 15, steps: [{duration: 15, power: 0.92}]},
        {duration: 10, steps: [{duration: 10, power: 0.50}]},
    ],
};

describe('Watch View', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

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


    test('watch-control', async () => {
        // init
        // jest.fn()

        let db = { power: 180 };

        let watch = Watch({});

        await watch.init({db: db});

        watch.setWorkout(workoutJS);
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

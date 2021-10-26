import { first, last, xf } from '../src/functions.js';
import { Timer, WorkoutRunner } from '../src/watch.js';
import { ActivityData, Record, Lap, Events } from '../src/models/activity-data.js';
import { Session } from '../src/session.js';

import { page } from './page.js';
import { watch } from '../src/views/watch.js';

import { JSDOM } from 'jsdom';


describe('Timer', () => {

    test('init with startTime, timerTime, elapsedTime', () => {
        const startTime   = 1632833074934;
        const elapsedTime = 10000;
        const endTime     = startTime + elapsedTime; // 10000 ms
        const timerTime   = 10; // 10 seconds

        Date.now = jest.fn(() => endTime);

        const timer = Timer({startTime, timerTime});

        expect(timer.getStartTime()).toBe(startTime);
        expect(timer.getTimerTime()).toBe(timerTime);
        expect(timer.getElapsedTime()).toBe(elapsedTime);
        expect(timer.getState()).toEqual({status: 'stopped', timerTime, elapsedTime, startTime});
    });

    test('init status', () => {
        expect(Timer().getStatus()).toBe('stopped');
        expect(Timer({status: 'started'}).getStatus()).toBe('started');
        expect(Timer({status: 'paused'}).getStatus()).toBe('paused');
        expect(Timer({status: 'stopped'}).getStatus()).toBe('stopped');
    });

    jest.useFakeTimers();

    test('start -> pause -> resume -> pause -> stop -> reset', () => {
        const startTime = 1632833074934;
        const endTime   = startTime + 7000;

        Date.now = jest.fn(() => endTime);
        const onTick   = jest.fn();
        const onStart  = jest.fn();
        const onPause  = jest.fn();
        const onResume = jest.fn();
        const onStop   = jest.fn();

        const timer = Timer({startTime, onTick, onStart, onPause, onResume, onStop});


        // init
        expect(timer.getStatus()).toBe('stopped');

        // start
        timer.start();

        expect(timer.getStatus()).toBe('started');

        // pause 1
        setTimeout(_ => timer.pause(), 2000);
        jest.advanceTimersByTime(2000);

        expect(timer.getStatus()).toBe('paused');
        expect(onTick).toHaveBeenCalledTimes(2);

        // resume
        setTimeout(_ => timer.resume(), 2000);
        jest.advanceTimersByTime(2000);

        expect(onTick).toHaveBeenCalledTimes(2);
        expect(timer.getStatus()).toBe('started');

        // pause 2
        setTimeout(_ => timer.pause(), 2000);
        jest.advanceTimersByTime(2000);

        expect(timer.getStatus()).toBe('paused');
        expect(onTick).toHaveBeenCalledTimes(4);

        // stop
        setTimeout(_ => timer.stop(), 1000);
        jest.advanceTimersByTime(1000);

        expect(timer.getStatus()).toBe('stopped');
        expect(timer.getTimerTime()).toBe(4);

        expect(onTick.mock.calls).toEqual(
            [[{timerTime:  1, elapsedTime: 0}],
             [{timerTime:  2, elapsedTime: 0}],
             [{timerTime:  3, elapsedTime: 0}],
             [{timerTime:  4, elapsedTime: 0}]]);

        expect(onStart).toHaveBeenCalledTimes(1);
        expect(onPause).toHaveBeenCalledTimes(2);
        expect(onResume).toHaveBeenCalledTimes(1);
        expect(onStop).toHaveBeenCalledTimes(1);
        expect(onTick).toHaveBeenCalledTimes(4);

        // reset
        setTimeout(_ => timer.reset(), 1000);
        jest.advanceTimersByTime(1000);

        expect(timer.getStatus()).toBe('stopped');
        expect(timer.getTimerTime()).toBe(0);
        expect(timer.getElapsedTime()).toBe(0);
    });

    jest.useFakeTimers();
});

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

describe('WorloutRunner', () => {
    test('init with defaults', () => {

        const workoutRunner = WorkoutRunner({workout: workoutJS});

        expect(workoutRunner.getIntervals().length).toBe(5);
        expect(workoutRunner.getLapIndex()).toBe(0);
        expect(workoutRunner.getStepIndex()).toBe(0);
        expect(workoutRunner.getLapTime()).toBe(10);
        expect(workoutRunner.getStepTime()).toBe(3);
        expect(workoutRunner.getLapDuration()).toBe(10);
        expect(workoutRunner.getStepDuration()).toBe(3);
        expect(workoutRunner.getLap()).toEqual(workoutJS.intervals[0]);
        expect(workoutRunner.getStep()).toEqual(workoutJS.intervals[0].steps[0]);
    });

    test('init from running timer status', () => {

        const workoutRunner = WorkoutRunner({
            workout: workoutJS,
            lapIndex: 0,
            stepIndex: 2,
            lapTime: 2,
            stepTime: 2,
        });

        expect(workoutRunner.getIntervals().length).toBe(5);
        expect(workoutRunner.getLapIndex()).toBe(0);
        expect(workoutRunner.getStepIndex()).toBe(2);
        expect(workoutRunner.getLapTime()).toBe(2);
        expect(workoutRunner.getStepTime()).toBe(2);
        expect(workoutRunner.getLapDuration()).toBe(10);
        expect(workoutRunner.getStepDuration()).toBe(4);
        expect(workoutRunner.getLap()).toEqual(workoutJS.intervals[0]);
        expect(workoutRunner.getStep()).toEqual(workoutJS.intervals[0].steps[2]);
    });

    jest.useFakeTimers();

    test('start', () => {
        // Timers
        // Lap     Total
        // 05:00 - 0:00:00
        // 04:59 - 0:00:01
        // 03:57 - 0:01:03
        // 01:00 - 0:04:00
        // 00:01 - 0:04:59
        // 01:00 - 0:05:00
        //
        // Lap timer doesn’t go to 0, counts down to 1, and jumps to next interval

        function onTick(x) {
            workoutRunner.tick();
        }

        const timer = Timer({onTick});
        const workoutRunner = WorkoutRunner({workout: workoutJS});

        timer.start();
        workoutRunner.start();
        setTimeout(_ => 0, 60000);

        // Step 0, Lap 0
        expect(workoutRunner.getLapIndex()).toBe(0);
        expect(workoutRunner.getStepIndex()).toBe(0);
        expect(workoutRunner.getLapDuration()).toBe(10);
        expect(workoutRunner.getStepDuration()).toBe(3);
        expect(workoutRunner.getLapTime()).toBe(10);


        jest.advanceTimersByTime(0);
        expect(workoutRunner.getStepTime()).toBe(3);
        expect(timer.getTimerTime()).toBe(0);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(2);
        expect(timer.getTimerTime()).toBe(1);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(1);
        expect(timer.getTimerTime()).toBe(2);

        // Step 1, Lap 0
        jest.advanceTimersByTime(1000);

        expect(workoutRunner.getLapIndex()).toBe(0);
        expect(workoutRunner.getStepIndex()).toBe(1);
        expect(timer.getTimerTime()).toBe(3);
        expect(workoutRunner.getStepDuration()).toBe(3);
        expect(workoutRunner.getLapTime()).toBe(7);
        expect(workoutRunner.getStepTime()).toBe(3);

        expect(workoutRunner.getStepTime()).toBe(3);
        expect(timer.getTimerTime()).toBe(3);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(2);
        expect(timer.getTimerTime()).toBe(4);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(1);
        expect(timer.getTimerTime()).toBe(5);

        // Step 2, Lap 0
        jest.advanceTimersByTime(1000);

        expect(workoutRunner.getLapIndex()).toBe(0);
        expect(workoutRunner.getStepIndex()).toBe(2);
        expect(workoutRunner.getStepDuration()).toBe(4);

        expect(workoutRunner.getStepTime()).toBe(4);
        expect(timer.getTimerTime()).toBe(6);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(3);
        expect(timer.getTimerTime()).toBe(7);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(2);
        expect(timer.getTimerTime()).toBe(8);
        jest.advanceTimersByTime(1000);
        expect(workoutRunner.getStepTime()).toBe(1);
        expect(timer.getTimerTime()).toBe(9);

        // Step 0, Lap 1
        jest.advanceTimersByTime(1000);

        expect(workoutRunner.getLapIndex()).toBe(1);
        expect(workoutRunner.getStepIndex()).toBe(0);
        expect(workoutRunner.getLapDuration()).toBe(15);
        expect(workoutRunner.getStepDuration()).toBe(15);

        expect(workoutRunner.getStepTime()).toBe(15);
        expect(timer.getTimerTime()).toBe(10);

        jest.advanceTimersByTime(15000);

        // Step 0, Lap 2
        expect(workoutRunner.getLapIndex()).toBe(2);
        expect(workoutRunner.getStepIndex()).toBe(0);
        expect(workoutRunner.getLapDuration()).toBe(10);
        expect(workoutRunner.getStepDuration()).toBe(10);

        expect(workoutRunner.getStepTime()).toBe(10);
        expect(timer.getTimerTime()).toBe(25);

        jest.advanceTimersByTime(10000);

        // Step 0, Lap 3
        expect(workoutRunner.getLapIndex()).toBe(3);
        expect(workoutRunner.getStepIndex()).toBe(0);
        expect(workoutRunner.getLapDuration()).toBe(15);
        expect(workoutRunner.getStepDuration()).toBe(15);

        expect(workoutRunner.getStepTime()).toBe(15);
        expect(timer.getTimerTime()).toBe(35);

        jest.advanceTimersByTime(15000);

        // Step 0, Lap 4
        expect(workoutRunner.getLapIndex()).toBe(4);
        expect(workoutRunner.getStepIndex()).toBe(0);
        expect(workoutRunner.getLapDuration()).toBe(10);
        expect(workoutRunner.getStepDuration()).toBe(10);

        expect(workoutRunner.getStepTime()).toBe(10);
        expect(timer.getTimerTime()).toBe(50);

        jest.advanceTimersByTime(9000);

        expect(workoutRunner.getStepTime()).toBe(1);
        expect(timer.getTimerTime()).toBe(59);

        // Workout Done!

        // Open ended Lap
        jest.advanceTimersByTime(1000);
        // expect(workoutRunner.getStepTime()).toBe(0);
        expect(timer.getTimerTime()).toBe(60);
    });

    jest.useFakeTimers();

    test('pausing just the workout', () => {
        // init
        function onTick(x) {
            workoutRunner.tick();
        }

        const timer = Timer({onTick});
        const workoutRunner = WorkoutRunner({workout: workoutJS});

        timer.start();
        workoutRunner.start();
        setTimeout(_ => 0, 60000);
        // init end

        expect(workoutRunner.getLapTime()).toBe(10);
        expect(workoutRunner.getStepTime()).toBe(3);

        // pause in the middle of step 1 in lap 0
        jest.advanceTimersByTime(4000); // 4000
        workoutRunner.pause();

        expect(timer.getTimerTime()).toBe(4);
        expect(workoutRunner.getLapTime()).toBe(6);
        expect(workoutRunner.getStepTime()).toBe(2);

        // resume after 10 seconds
        jest.advanceTimersByTime(10000); // 14000
        workoutRunner.resume();

        expect(timer.getTimerTime()).toBe(14);
        expect(workoutRunner.getLapTime()).toBe(6);
        expect(workoutRunner.getStepTime()).toBe(2);

        jest.advanceTimersByTime(6000); // 20000

        expect(timer.getTimerTime()).toBe(20);
        expect(workoutRunner.getLapTime()).toBe(15);
        expect(workoutRunner.getStepTime()).toBe(15);

        jest.advanceTimersByTime(50000); // 70000

        expect(timer.getTimerTime()).toBe(70);
    });
});


describe('ActivityData', () => {

    jest.useFakeTimers();

    test('adds one record on each timer tick (1 second)', () => {
        // init
        let db = { power: 180 };

        const activityData = ActivityData();

        function onTick(x) {
            workoutRunner.tick();
            activityData.addRecord(Record(db));
        }
        const timer = Timer({onTick});
        const workoutRunner = WorkoutRunner({workout: workoutJS,});

        timer.start();
        workoutRunner.start();
        setTimeout(_ => 0, 60000);
        // init end
        let records = activityData.getRecords();

        expect(activityData.getRecords().length).toBe(0);

        // Lap 0
        jest.advanceTimersByTime(1000);
        expect(activityData.getRecords().length).toBe(1);
        jest.advanceTimersByTime(9000);

        records = activityData.getRecords();
        expect(records.length).toBe(10);
        expect(first(records)).toStrictEqual(Record(db));
        expect(last(records)).toStrictEqual(Record(db));
        expect(records.reduce((acc, x,) => acc += x.power, 0) / 10).toBe(180);
        jest.advanceTimersByTime(1000);

        // Lap 1
        expect(records.length).toBe(11);
        jest.advanceTimersByTime(14000);

        // skip to the end
        jest.advanceTimersByTime(35000);

        expect(records.length).toBe(60);
    });

    jest.useFakeTimers();

    test('adds a lap on interval end', () => {
        // init
        const activityData = ActivityData();

        function onTick(x) {
            workoutRunner.tick();
        }

        function onLap(x) {
            activityData.addLap(Lap());
        }

        const timer = Timer({onTick});
        const workoutRunner = WorkoutRunner({workout: workoutJS, onLap});

        timer.start();
        workoutRunner.start();
        setTimeout(_ => 0, 60000);
        // init end

        // Lap 0
        expect(activityData.getLaps().length).toBe(0);

        // Lap 1
        jest.advanceTimersByTime(10000);
        expect(activityData.getLaps().length).toBe(1);

        // Lap 2
        jest.advanceTimersByTime(15000);
        expect(activityData.getLaps().length).toBe(2);

        // Lap 3
        jest.advanceTimersByTime(10000);
        expect(activityData.getLaps().length).toBe(3);

        // Lap 4
        jest.advanceTimersByTime(15000);
        expect(activityData.getLaps().length).toBe(4);

        // Lap 5
        jest.advanceTimersByTime(10000);
        expect(activityData.getLaps().length).toBe(5);
    });

    jest.useFakeTimers();

    test('adds events on timer start, pause, resume, stop', () => {
        // init
        const activityData = ActivityData();

        function onTick(x) {
            workoutRunner.tick();
        }

        function onStart(x) {
            activityData.addEvent(Events.TimerStart());
        }

        function onPause(x) {
            activityData.addEvent(Events.TimerPause());
        }

        function onResume(x) {
            activityData.addEvent(Events.TimerStart());
        }

        function onStop(x) {
            activityData.addEvent(Events.TimerStop());
        }

        const timer = Timer({onTick, onStart, onPause, onResume, onStop});
        const workoutRunner = WorkoutRunner({workout: workoutJS,});

        expect(activityData.getEvents().length).toBe(0);

        timer.start();
        workoutRunner.start();
        setTimeout(_ => 0, 60000);
        // init end

        expect(activityData.getEvents().length).toBe(1);

        jest.advanceTimersByTime(4000); // timerTime: 4000, elapsedTime: 40000

        timer.pause();
        expect(activityData.getEvents().length).toBe(2);

        jest.advanceTimersByTime(10000); // timerTime: 4000, elapsedTime: 14000

        timer.resume();
        expect(activityData.getEvents().length).toBe(3);

        jest.advanceTimersByTime(6000); // timerTime: 10000, elapsedTime: 20000

        jest.advanceTimersByTime(50000); // timerTime: 60000, elapsedTime: 70000

        timer.stop();
        expect(activityData.getEvents().length).toBe(4);
        expect(activityData.getEvents()[0].event_type).toBe(0); // start
        expect(activityData.getEvents()[1].event_type).toBe(1); // pause
        expect(activityData.getEvents()[2].event_type).toBe(0); // start
        expect(activityData.getEvents()[3].event_type).toBe(4); // stop
    });
});


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

// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });


/**
 * @jest-environment jsdom
 */

import { first, last, xf } from '../src/functions.js';
import { Timer, WorkoutRunner } from '../src/watch/timer.js';
import { ActivityData, Record, Lap, Events } from '../src/watch/activity-data.js';
// import { Watch } from '../src/watch.js';

import { page } from './page.js';
import { watch } from '../src/views/watch.js';

import { JSDOM } from 'jsdom';

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

describe('ActivityData', () => {

    jest.useFakeTimers();

    test('adds one record on each timer tick (1 second)', () => {
        // init

        const startTime = 1632833074934;
        Date.now = jest.fn(() => startTime);

        let db = { power: 180 };

        const activityData = ActivityData({db});

        function onTick(x) {
            workoutRunner.tick();
            activityData.onRecord();
        }
        const timer = Timer({onTick});
        const workoutRunner = WorkoutRunner({workout: workoutJS});

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

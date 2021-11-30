import { xf, equals, existance, exists } from '../functions.js';
import { ActivityData, Record, Lap, Events } from './activity-data.js';
import { Timer, WorkoutRunner } from './timer.js';

import { fileHandler } from '../file.js';

function Watch(args = {}) {
    const defaults = {};

    const activity = existance(args.activity);
    let workout    = existance(args.workout);

    console.log(`timer: ${args.watch.timer.status}, workout: ${args.watch.workout.status}`);
    const timerState  = existance(args.watch.timer, {});
    const runnerState = existance(args.watch.workout, {});

    const timer = Timer({
        onTick, onStart, onPause, onResume, onStop, ...timerState
    });
    const workoutRunner = WorkoutRunner({
        workout:  workout,
        onStart:  onWorkoutStart,
        onPause:  onWorkoutPause,
        onResume: onWorkoutStart,
        onFinish: onWorkoutFinish,
        onLap:    onLap,
        ...runnerState
    });

    //
    xf.reg('watch', (watch, db) => {
        db.watch = watch;
        console.log(args.watch.workout);
        console.log(args.watch.timer);
        console.log('----');
    });

    xf.sub('workout', (value, db) => {
        workout = value;
        setWorkout(value);
    });

    xf.sub('ui:timerStart', timerStart);
    xf.sub('ui:timerPause', timerPause);
    xf.sub('ui:timerResume', timerResume);
    xf.sub('ui:timerLap', timerLap);
    xf.sub('ui:timerStop', timerStop);

    xf.sub('ui:workoutStart', workoutStart);
    xf.sub('ui:workoutPause', workoutPause);
    xf.sub('ui:workoutResume', workoutResume);

    xf.sub('ui:watchLap', watchLap);

    xf.sub('ui:activitySave', save);

    //
    function getState() {
        return {
            timer:   timer.getState(),
            workout: workoutRunner.getState(),
        };
    }

    function getWatchStatus() {
        const watch = getState();
        return {
            timer:   watch.timer.status,
            workout: watch.workout.status,
        };
    }

    //
    function setWorkout(workout) {
        workoutRunner.setWorkout(workout);
    }

    //
    function onTick(x) {
        workoutRunner.tick();
        activity.onRecord();

        xf.dispatch('watch', getState());
    }

    function onLap(x) {
        activity.onRecord();
        activity.onLap();

        if(isWorkoutInProgress()) {
            xf.dispatch('watch:status', getWatchStatus());

            let state = getState();
            if(exists(state.workout.slopeTarget)) {
                xf.dispatch('ui:slope-target-set', state.workout.slopeTarget);
            } else {
                xf.dispatch('ui:power-target-set', state.workout.powerTarget);
            }
        }
    }

    function onStart(x) {
        activity.onEvent(Events.TimerStart());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onPause(x) {
        activity.onEvent(Events.TimerPause());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onResume(x) {
        activity.onEvent(Events.TimerStart());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onStop(x) {
        activity.onEvent(Events.TimerStop());

        xf.dispatch('watch', getState());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onWorkoutStart(x) {
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onWorkoutPause(x) {
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onWorkoutFinish(x) {
        xf.dispatch('watch:status', getWatchStatus());
    }

    //
    function isWorkoutInProgress() {
        const workoutStatus = workoutRunner.getStatus();
        return ['started', 'paused'].includes(workoutStatus);
    }

    //
    function timerStart() {
        timer.start();
    }

    function timerPause() {
        timer.pause();

        if(isWorkoutInProgress()) {
            workoutRunner.pause();
        }
    }

    function timerResume() {
        timer.resume();
    }

    function timerLap() {
        timer.lap();
    }

    function timerStop() {
        if(isWorkoutInProgress()) {
            workoutRunner.stop();
        }

        timer.stop();
        timer.reset();

        xf.dispatch('watch', getState());
    }

    function workoutStart() {
        const workoutStatus = workoutRunner.getStatus();
        const timerStatus = timer.getStatus();

        if(equals(workoutStatus, 'started')) return;
        if(equals(workoutStatus, 'stopped')) workoutRunner.start();
        if(equals(workoutStatus, 'init'))    workoutRunner.start();
        if(equals(workoutStatus, 'paused'))  workoutRunner.resume();
        if(equals(timerStatus,   'init'))    timer.start();
        if(equals(timerStatus,   'stopped')) timer.start();
        if(equals(timerStatus,   'paused'))  timer.resume();
    }

    function workoutPause() {
        workoutRunner.pause();
    }

    function workoutResume() {
        workoutRunner.resume();
    }

    function workoutSkip() {
        workoutRunner.skip();
    }

    function watchLap() {
        if(isWorkoutInProgress()) {
            console.log('watchLap skip');
            workoutRunner.skip();
        } else {
            timer.lap();
        }
    }

    function save() {
        const { activity, activityFileName } = activity.encode();
        const blob = new Blob([activity], {type: 'application/octet-stream'});
        fileHandler.saveFile()(blob, activityFileName);
    }

    // init
    function init() {

        let status = getWatchStatus();
        if(equals(status.timer, 'started'))   timerResume();
        if(equals(status.workout, 'started')) workoutResume();

        xf.dispatch('watch:status', getWatchStatus());
    }

    init();

    return Object.freeze({
        getState,
        getWatchStatus,

        setWorkout,

        timerStart,
        timerPause,
        timerStop,

        workoutStart,
        workoutPause,
        workoutResume,
        workoutSkip,

        watchLap,

        save,
    });
}

export { Watch };

import { xf, equals, existance } from './functions.js';
import { ActivityData, Record, Lap, Events } from './models/activity-data.js';
import { Timer, WorkoutRunner } from './watch.js';
import { fileHandler } from './file.js';

function WorkoutsLib() {
    let current = [];

    function getCurrent() {
    }

    return Object.freeze({getCurrent});
}


function Session(args = {}) {
    const defaults = {
        workout: (_ => workoutsLib.getCurrent()),
    };

    const activityData  = ActivityData();
    const workoutsLib   = WorkoutsLib();
    const workout       = existance(args.workout);
    const timer         = Timer({onTick, onStart, onPause, onResume, onStop});
    const workoutRunner = WorkoutRunner({
        workout:  workout,
        onStart:  onWorkoutStart,
        onPause:  onWorkoutPause,
        onResume: onWorkoutStart,
        onFinish: onWorkoutFinish,
        onLap:    onLap
    });

    let db = args.db;

    //
    xf.reg('watch', (watch, db) => {
        db.watch = watch;
    });

    xf.sub('ui:timerStart', e => { timerStart(); });
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
    function getWatch() {
        return {
            timer:   timer.getState(),
            workout: workoutRunner.getState(),
        };
    }

    function getWatchStatus() {
        const watch = getWatch();
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
        activityData.addRecord(Record(db));

        xf.dispatch('watch', getWatch());
    }

    function onLap(x) {
        activityData.addLap(Lap(x));
        activityData.addRecord(Record(db));
    }

    function onStart(x) {
        activityData.addEvent(Events.TimerStart());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onPause(x) {
        activityData.addEvent(Events.TimerPause());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onResume(x) {
        activityData.addEvent(Events.TimerStart());
        xf.dispatch('watch:status', getWatchStatus());
    }

    function onStop(x) {
        activityData.addEvent(Events.TimerStop());
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

        if(isWorkoutInProgress()) {
            workoutRunner.resume();
        }
    }

    function timerLap() {
        timer.lap();
    }

    function timerStop() {
        timer.stop();

        if(isWorkoutInProgress()) {
            workoutRunner.stop();
        }
    }

    function workoutStart() {
        const workoutStatus = workoutRunner.getStatus();
        const timerStatus = timer.getStatus();

        if(equals(workoutStatus, 'started')) return;
        if(equals(workoutStatus, 'stopped')) workoutRunner.start();
        if(equals(workoutStatus, 'paused'))  workoutRunner.resume();
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
        console.log('watchLap lap', isWorkoutInProgress());
        if(isWorkoutInProgress()) {
            console.log('watchLap skip');
            workoutRunner.skip();
        } else {
            timer.lap();
        }
    }

    function save() {
        const { activity, activityFileName } = activityData.encode();
        const blob = new Blob([activity], {type: 'application/octet-stream'});
        fileHandler.saveFile()(blob, activityFileName);
    }

    return Object.freeze({
        getWatch,
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

export { Session };


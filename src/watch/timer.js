import { xf, exists, existance, equals, isFunction } from '../functions.js';

function Timer(args = {}) {

    const defaults = {
        status: 'init',
        interval: 1000,
        startTime: now,
        timerTime: 0,
        elapsedTime: 0,
        lapTime: now,
        callback: ((x) => x),
    };

    const interval   = existance(args.interval, defaults.interval);
    const onStart    = existance(args.onStart,  defaults.callback);
    const onPause    = existance(args.onPause,  defaults.callback);
    const onResume   = existance(args.onResume, defaults.callback);
    const onStop     = existance(args.onStop,   defaults.callback);
    const onReset    = existance(args.onReset,  defaults.callback);
    const onTick     = existance(args.onTick,   defaults.callback);
    const onLap      = existance(args.onLap,    defaults.callback);
    const statusList = ['init', 'started', 'paused', 'stopped'];

    let status       = existance(args.status,    defaults.status);
    let startTime    = existance(args.startTime, defaults.startTime());
    let timerTime    = existance(args.timerTime, defaults.timerTime);
    let lapTime      = existance(args.timerTime, defaults.lapTime);
    let elapsedTime  = now() - startTime;
    let timerId;

    function now() {
        return Date.now();
    }

    function getStatus() {
        return status;
    }

    function getTimerTime() {
        return timerTime;
    }

    function getElapsedTime() {
        if(equals(status, 'stopped')) {
            return elapsedTime;
        }
        return now() - startTime;
    }

    function getLapTime() {
        if(isFunction(lapTime)) {
            return undefined;
        }
        return lapTime;
    }

    function getStartTime() {
        return startTime;
    }

    function getState() {
        return {
            status:      getStatus(),
            startTime:   getStartTime(),
            timerTime:   getTimerTime(),
            lapTime:     getLapTime(),
            elapsedTime: getElapsedTime(),
        };
    }

    function start() {
        if(equals(status, 'started')) return;
        if(equals(status, 'paused')) {
            resume(); return;
        };

        timerId = setInterval(tick, interval);
        startTime = now();
        status = 'started';
        onStart(getState());
    }

    function pause() {
        if(equals(status, 'paused')) return;
        if(equals(status, 'stopped')) return;

        clearInterval(timerId);
        status = 'paused';
        onPause(getState());
    }

    function resume() {
        // if(equals(status, 'started')) return;
        if(equals(status, 'stopped')) return;

        timerId = setInterval(tick, interval);
        status = 'started';
        onResume(getState());
    }

    function stop() {
        if(equals(status, 'stopped')) return;

        clearInterval(timerId);
        status = 'stopped';
        onStop(getState());
    }

    function reset() {
        clearInterval(timerId);
        status = 'init';
        // timerTime = 0;
        // elapsedTime = 0;

        startTime = undefined;
        timerTime = 0;
        elapsedTime = 0;
        lapTime = undefined;

        onReset(getState());
    }

    function tick() {
        timerTime = timerTime + 1;
        elapsedTime = getElapsedTime();
        onTick({timerTime, elapsedTime});
    }

    function lap() {
        lapTime = timerTime;
        onLap({lapTime, timerTime, elapsedTime});
    }

    return Object.freeze({
        start,
        pause,
        resume,
        lap,
        stop,
        reset,

        getStatus,
        getTimerTime,
        getElapsedTime,
        getStartTime,
        getState,
    });
}

function WorkoutRunner(args = {}) {
    const defaults = {
        status:    'init',
        lapIndex:  0,
        stepIndex: 0,
        lapTime:   (_ => workout.intervals[lapIndex].duration),
        stepTime:  (_ => workout.intervals[lapIndex].steps[stepIndex].duration),
        callback:  ((x) => x),
    };

    let workout       = existance(args.workout);
    let lapIndex      = existance(args.lapIndex, defaults.lapIndex);
    let stepIndex     = existance(args.stepIndex, defaults.stepIndex);
    let lapTime       = existance(args.lapTime, defaults.lapTime());
    let stepTime      = existance(args.stepTime, defaults.stepTime());
    let lap           = workout.intervals[lapIndex];
    let step          = workout.intervals[lapIndex].steps[stepIndex];
    let lapDuration   = lap.duration;
    let stepDuration  = step.duration;
    let lapsLength    = workout.intervals.length;
    let stepsLength   = lap.steps.length;
    let statusList    = ['init', 'started', 'paused', 'finished', 'stopped'];
    let status        = existance(args.status, defaults.status);

    console.log(`${args.stepTime}, ${args.lapTime}, ${args.stepDuration}, ${args.lapDuration}`);
    console.log(`${stepTime}, ${lapTime}, ${stepDuration}, ${lapDuration}`);

    let onTick       = existance(args.onTick, defaults.callback);
    let onLap        = existance(args.onLap, defaults.callback);
    let onStart      = existance(args.onStart, defaults.callback);
    let onPause      = existance(args.onPause, defaults.callback);
    let onResume     = existance(args.onResume, defaults.callback);
    let onFinish     = existance(args.onFinish, defaults.callback);

    function getWorkout()       { return workout; }
    function getIntervals()     { return workout.intervals; }
    function getLapIndex()      { return lapIndex; }
    function getStepIndex()     { return stepIndex; }
    function getLapTime()       { return lapTime; }
    function getStepTime()      { return stepTime; }
    function getLapDuration()   { return lapDuration; }
    function getStepDuration()  { return stepDuration; }
    function getLap()           { return lap; }
    function getStep()          { return step; }
    function getStatus()        { return status; }
    function getPowerTarget()   { return step.power; }
    function getSlopeTarget()   { return step.slope; }
    function getCadenceTarget() { return step.cadence; }
    function getState() {
        return {
            status:        getStatus(),
            lapIndex:      getLapIndex(),
            stepIndex:     getStepIndex(),
            lapTime:       getLapTime(),
            stepTime:      getStepTime(),
            lapDuration:   getLapDuration(),
            stepDuration:  getStepDuration(),

            lap:           getLap(),
            step:          getStep(),
        };
    }

    function setWorkout(value) {
        workout = value;

        // stepTime     = workout.intervals[lapIndex].steps[stepIndex].duration;
        // lapTime      = workout.intervals[lapIndex].duration;
        // lap          = workout.intervals[lapIndex];
        // step         = workout.intervals[lapIndex].steps[stepIndex];
        // lapDuration  = lap.duration;
        // stepDuration = step.duration;
        // lapsLength   = workout.intervals.length;
        // stepsLength  = lap.steps.length;
    }

    function tick(args) {
        if(equals(status, 'started')) {
            if(stepTime <= 1) {
                nextStep();
            } else {
                stepTime = stepTime - 1;
                lapTime  = lapTime - 1;
            }
        }

        onTick(getState());
    }

    function nextStep() {
        stepIndex = stepIndex + 1;

        if(stepIndex >= stepsLength) {
            nextLap();
        } else {
            step         = workout.intervals[lapIndex].steps[stepIndex];
            stepDuration = step.duration;
            stepTime     = step.duration;

            lapTime = lapTime - 1;
        }
    }

    function nextLap() {
        if(lapIndex >= (lapsLength - 1)) {
            finish();
            onLap(getState());
            return;
        }

        lapIndex  = lapIndex + 1;
        stepIndex = 0;

        lap  = workout.intervals[lapIndex];
        step = workout.intervals[lapIndex].steps[stepIndex];

        lapDuration  = lap.duration;
        stepDuration = step.duration;

        lapTime  = lap.duration;
        stepTime = step.duration;

        stepsLength = lap.steps.length;

        onLap(getState());
    }

    function skip() {
        nextLap();
    }

    function skipTo(args) {
        if(exists(args.lapIndex)) {
            lapIndex = args.lapIndex - 1;
            nextLap();
        }
        return;
    }

    function start() {
        status = 'started';
        onStart(getState());
    }

    function pause() {
        status = 'paused';
        onPause(getState());
    }

    function resume() {
        status = 'started';
        onResume(getState());
    }

    function finish() {
        status = 'finished';
        onFinish();
    }

    function stop() {
        status = 'stopped';

        // workout      = {};
        lapIndex     = defaults.lapIndex;
        stepIndex    = defaults.stepIndex;
        lapTime      = 0;
        stepTime     = 0;
        lap          = workout.intervals[lapIndex];
        step         = workout.intervals[lapIndex].steps[stepIndex];
        lapDuration  = lap.duration;
        stepDuration = step.duration;
        lapsLength   = workout.intervals.length;
        stepsLength  = lap.steps.length;

        // onStop(getState());
    }

    return Object.freeze({
        tick,
        skip,
        skipTo,
        start,
        pause,
        resume,
        stop,

        getWorkout,
        getIntervals,
        getLapIndex,
        getStepIndex,
        getLapTime,
        getStepTime,
        getLapDuration,
        getStepDuration,
        getLap,
        getStep,
        getStatus,
        getState,

        setWorkout,
    });
}

export { Timer, WorkoutRunner };


import { existance  } from '../functions.js';
import { fitjs } from '../fit/fitjs.js';
import { fit } from '../fit/fit.js';
import { dateToDashString } from '../utils.js';

function Record(args = {}) {
    const defaults = {
        timestamp: (_ => Date.now()),
        power:     0,
        cadence:   0,
        speed:     0,
        heartRate: 0,
        distance:  0,
    };

    const timestamp = existance(args.timestamp, defaults.timestamp());
    const power     = existance(args.power, defaults.power);
    const cadence   = existance(args.cadence, defaults.cadence);
    const speed     = existance(args.speed, defaults.speed);
    const heartRate = existance(args.heartRate, defaults.heartRate);
    const distance  = existance(args.distance, defaults.distance);

    return {
        timestamp,
        power,
        cadence,
        speed,
        heartRate,
        distance,
    };
}

function Lap(args = {}) {
    const defaults = {
        timestamp:  (_ => Date.now()),
        start_time: 0,
    };

    const timestamp          = existance(args.timestamp, defaults.timestamp());
    const start_time         = existance(args.start_time, defaults.start_time);
    const total_elapsed_time = (timestamp - start_time);

    return {
        timestamp,
        start_time,
        total_elapsed_time: total_elapsed_time,
    };
}

function Event(args = {}) {
    const defaults = {
        timestamp:   (_ => Date.now()),
        event:       0,
        event_type:  0,
        event_group: 0,
    };

    const timestamp   = existance(args.timestamp, defaults.timestamp());
    const event       = existance(args.event, defaults.event);
    const event_type  = existance(args.event_type, defaults.event_type);
    const event_group = existance(args.event_group, defaults.event_group);

    return {
        timestamp,
        event,
        event_type,
        event_group,
    };
}

function TimerStart(args = {}) {
    return Event({timestamp: args.timestamp, event: 0, event_type: 0});
}

function TimerPause(args = {}) {
    return Event({timestamp: args.timestamp, event: 0, event_type: 1});
}

function TimerStop(args = {}) {
    return Event({timestamp: args.timestamp,event: 0, event_type: 4});
}

function WorkoutStart(args = {}) {
    return Event({timestamp: args.timestamp, event: 3, event_type: 0});
}

function WorkoutPause(args = {}) {
    return Event({timestamp: args.timestamp, event: 3, event_type: 1});
}

function WorkoutStop(args = {}) {
    return Event({timestamp: args.timestamp,event: 3, event_type: 4});
}

const Events = {
    Event: Event,
    TimerStart: TimerStart,
    TimerPause: TimerPause,
    TimerStop: TimerStop,
    WorkoutStart: WorkoutStart,
    WorkoutPause: WorkoutPause,
    WorkoutStop: WorkoutStop,
};

function ActivityData(args = {}) {
    const defaults = {
        records: [],
        laps:    [],
        events:  [],
    };

    let records = existance(args.records, defaults.records);
    let laps    = existance(args.laps, defaults.laps);
    let events  = existance(args.events, defaults.events);
    let db      = existance(args.db);

    function getRecords() {
        return records;
    }

    function getLaps() {
        return laps;
    }

    function getEvents() {
        return events;
    }

    function getState() {
        return {
            records: getRecords(),
            laps:    getLaps(),
            events:  getEvents(),
        };
    }

    function addRecord(record) {
        records.push(record);
    }

    function addLap(lap) {
        laps.push(lap);
    }

    function addEvent(event) {
        events.push(event);
    }

    function fileName() {
        const now = new Date();
        return `workout-${dateToDashString(now)}.fit`;
    }

    function encode() {
        const fitjsActivity    = fitjs.encode({records, laps, events});
        const activity         = fit.activity.encode(fitjsActivity);
        const activityFileName = fileName();

        return {
            activityFileName,
            activity,
        };
    }

    function onRecord() {
        const record = Record(db);
        addRecord(record);
    }

    function onLap() {
        const lap = Lap(db);
        addLap(lap);
    }

    function onEvent(e) {
        addEvent(e);
    }

    return Object.freeze({
        getRecords,
        getLaps,
        getEvents,
        getState,
        addRecord,
        addLap,
        addEvent,
        onRecord,
        onLap,
        onEvent,

        encode,
        fileName,
    });
}

export { ActivityData, Record, Lap, Events };

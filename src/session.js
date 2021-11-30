import { xf, existance, exists, equals, empty, isUndefined, last } from './functions.js';
import { IDB, setId } from './storage/idb.js';

import { Watch } from './watch/watch.js';
import { ActivityData } from './watch/activity-data.js';
import { Workouts } from './workouts/workouts.js';

function SessionIDBMapper(args = {}) {
    const defaults = {
        dbName:    'store',
        storeName: 'session',
        version:   1,
    };

    const idb       = IDB();
    const dbName    = existance(args.dbName, defaults.dbName);
    const storeName = existance(args.storeName, defaults.storeName);
    const version   = existance(args.version, defaults.version);

    async function backup(data) {
        await idb.put(storeName, setId(data, 0));
    }

    async function restore() {
        const store = await idb.open(dbName, version, storeName);

        let data = await idb.get(storeName, 0);
        return data;
    }

    return Object.freeze({
        backup,
        restore,
    });
}

const sessionIDBMapper = SessionIDBMapper();

function Session() {

    let workouts;
    let activity;
    let watch;

    let state = {};

    function getWorkout() {
        return state.workout;
    }

    function getActivity() {
        return state.activity;
    }

    function getWatch() {
        return state.watch;
    }

    function getState() {
        let state = {
            workout:  workouts.getCurrent(),
            activity: activity.getState(),
            watch:    watch.getState(),
        };

        return state;
    }

    function config(args = {}) {
        workouts = args.workouts;
        activity = args.activity;
        watch    = args.watch;
    }

    async function backup() {
        let state = getState();

        if(equals(state.watch.timer.status, 'stopped')) {
            state.watch.timer.status = 'init';
            state.watch.workout.status = 'init';
        }

        await sessionIDBMapper.backup(state);
    }

    async function restore() {
        let sessionData = await sessionIDBMapper.restore();
        state = sessionData;
        return state;
    }

    return Object.freeze({
        backup,
        restore,
        getWorkout,
        getActivity,
        getWatch,
        config,
    });
}

function App(args = {}) {

    let activity;
    let watch;
    const session  = Session();
    const workouts = Workouts();

    async function init(db) {
        await session.restore();
        await workouts.restore({workout: session.getWorkout()});

        activity = ActivityData({db, ...session.getActivity()});
        watch    = Watch({
            workout: session.getWorkout(),
            watch:   session.getWatch(),
            activity,
        });

        session.config({workouts, watch, activity});
    }

    async function backup() {
        await session.backup();
        await workouts.backup();
    }

    return Object.freeze({
        init,
        backup,
    });
}

export { App, Session, sessionIDBMapper };


import { xf, equals, existance, empty, compose } from '../functions.js';

import { IDB, setId } from '../storage/idb.js';
import { fileHandler } from '../file.js';
import { uuid } from '../storage/uuid.js';
import { zwo } from './zwo.js';
import { workoutsFile } from './workouts-file.js';

function Workouts(args = {}) {
    const defaults = {
        currentIndex: 0,
        lib:          [],
        current:      ((_) => lib[defaults.currentIndex]),
    };

    let lib     = existance(args.lib, defaults.lib);
    let current = existance(args.current, {});

    xf.reg('workout', (workout, db) => {
        db.workout = workout;
    });

    xf.reg('workouts', (workouts, db) => {
        db.workouts = workouts;
    });

    xf.sub('ui:workoutUpload', onWorkoutUpload);
    xf.sub('ui:workoutSelect', onWorkoutSelect);

    async function restore(args = {}) {
        let lib = await workoutsIDBMapper.restore();

        if(empty(lib)) {
            lib = workoutsFileMapper.restore();
        }

        setLib(lib);
        setCurrent(args.workout);

        xf.dispatch('workout', getCurrent());
        xf.dispatch('workouts', getLib());

        return getState();
    }
    async function backup(args = {}) {
        await workoutsIDBMapper.backup(getState().lib);
    }

    async function onWorkoutUpload(file) {
        await upload(file);
        xf.dispatch('workouts', getLib());
    }

    function onWorkoutSelect(id) {
        const res = select(id);
        xf.dispatch('workout', res);
    }

    function getCurrent() {
        return current;
    }

    function setCurrent(value) {
        current = value;
    }

    function getLib() {
        return lib;
    }

    function setLib(value) {
        lib = value;
    }

    function getState() {
        return {
            lib:     getLib(),
            current: getCurrent(),
        };
    }

    function select(id) {
        for(let workout of lib) {
            if(equals(workout.id, id)) {
                current = workout;
                return workout;
            }
        };

        return undefined;
    }

    function add(workout) {
        lib.push(workout);
        return workout;
    }

    function addAll(coll) {
        coll.forEach(add);
    }

    function remove(id) {
        for(let i=0; i < lib.length; i++)  {
            if(equals(lib[i].id, id)) {
                lib.splice(i, 1);
                return lib;
            }
        }

        return lib;
    }

    function upload() {}

    return Object.freeze({
        getCurrent,
        getLib,
        getState,
        restore,
        backup,

        select,
        remove,
        add,
        upload,
    });
}

// async function upload(file) {
//     const str = await fileHandler.readTextFile(file);
//     return add(str);
// }

function WorkoutsFileMapper(args = {}) {

    function decode(xs) {
        return xs.map(compose(setId, zwo.parse));
    }

    function restore() {
        return decode(workoutsFile);
    }

    return Object.freeze({
        decode,
        restore,
    });
}

function WorkoutsIDBMapper(args = {}) {
    const defaults = {
        dbName:    'workouts',
        storeName: 'workouts',
        version:   1,
    };

    const idb       = IDB();
    const dbName    = existance(args.dbName, defaults.dbName);
    const storeName = existance(args.storeName, defaults.storeName);
    const version   = existance(args.version, defaults.version);

    async function backup(data) {
        await Promise.all(
            data.map(async function(x) {
                await idb.put(storeName, x);
            })
        );
    }

    async function restore() {
        const store = await idb.open(dbName, version, storeName);

        let xs = await idb.getAll(storeName);
        return xs;
    }

    return Object.freeze({
        backup,
        restore,
    });
}

const workoutsFileMapper = WorkoutsFileMapper();
const workoutsIDBMapper  = WorkoutsIDBMapper();

export {
    Workouts,
    workoutsFileMapper,
    workoutsIDBMapper
};

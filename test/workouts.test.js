/**
 * @jest-environment jsdom
 */


import { fileHandler } from '../src/file.js';
import { uuid } from '../src/storage/uuid.js';
import { zwo } from '../src/workouts/zwo.js';
import { workoutsFileMapper, Workouts }  from '../src/workouts/workouts.js';

import { idb } from '../src/storage/idb.js';
import indexedDB from 'fake-indexeddb';

window.indexedDB = indexedDB;

describe('Workouts', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

    test('restore with default Lib (file)', async () => {

        let lib = workoutsFileMapper.restore();
        const workouts = Workouts({lib});

        // let resOpen = await idb.open('store', 1, workouts.storeName);

        expect(workouts.getLib().length).toEqual(0);

        expect(resOpen.objectStoreNames).toStrictEqual([workouts.storeName]);
        expect(workouts.getLib().length).toEqual(workoutsFile.length);
    });

    // test('restore with idb Lib', async () => {

    //     const workouts = Workouts();

    //     let resOpen = await idb.open('store', 1, workouts.storeName);

    //     expect(workouts.getLib().length).toEqual(0);

    //     await workouts.restore();

    //     expect(resOpen.objectStoreNames).toStrictEqual([workouts.storeName]);
    //     expect(workouts.getLib().length).toEqual(workoutsFile.length);
    // });

});

import {
    empty, first, last, dataviewToArray, isObject, nthBit,
} from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';
import {
    localActivity,
    Event,
    Lap,
    Session,
    Activity,
} from '../../src/fit/activity.js';
import { appData, FITjs, fitBinary } from './app-data.js';

const fit = FIT();

describe('AppData', () => {

    test('toFITjs', () => {
        const res = fit.localActivity.toFITjs({
            records: appData.records,
            laps: appData.laps,
        });

        console.log(fitBinary.flat().length);

        expect(res).toEqual(FITjs);
    });

    test('encode', () => {
        const res = fit.localActivity.encode({
            records: appData.records,
            laps: appData.laps,
        });

        expect(dataviewToArray(res)).toEqual(fitBinary.flat());
    });
});


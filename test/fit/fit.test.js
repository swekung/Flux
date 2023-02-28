import { dataviewToArray } from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';
import { appData, FITjs, fitBinary } from './data.js';

const fit = FIT();

describe('AppData', () => {

    test('toFITjs', () => {
        const res = fit.localActivity.toFITjs({
            records: appData.records,
            laps: appData.laps,
        });

        expect(res).toEqual(FITjs);
    });

    test('encode', () => {
        const res = fit.localActivity.encode({
            records: appData.records,
            laps: appData.laps,
        });

        // console.log(fitBinary.flat().length);

        expect(dataviewToArray(res)).toEqual(fitBinary.flat());
        // expect(res.map(dataviewToArray)).toEqual(fitBinary);
    });
});


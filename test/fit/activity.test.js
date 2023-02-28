import {
    empty, first, last, dataviewToArray,
} from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';
import {
    Event,
    Lap,
    Activity,
} from '../../src/fit/activity.js';
import { appData } from './data.js';

describe('Activity Message', () => {
    const fit = FIT();

    const productMessageDefinition = [
        'activity', [
            'timestamp',
            'num_sessions',
            'type',
            'event',
            'event_type',
        ], 6];

    const definitionRecordJS = {
        type: 'definition',
        architecture: 0,
        name: 'activity',
        local_number: 6,
        length: 21,
        data_record_length: 10,
        fields: [
            {number: 253, size: 4, base_type: 'uint32'}, // timestamp
            {number: 1,   size: 2, base_type: 'uint16'}, // num_sessions
            {number: 2,   size: 1, base_type: 'enum'},   // type
            {number: 3,   size: 1, base_type: 'enum'},   // event
            {number: 4,   size: 1, base_type: 'enum'},   // event_type
        ]
    };

    const dataRecordJS = {
        type: 'data',
        name: 'activity',
        local_number: 6,
        length: 10,
        fields: {
            timestamp: 1038070838000, // 407005238, 54, 104, 66, 24,
            num_sessions: 1, //
            type: 0, // manual
            event: 26, // activity
            event_type: 1, // stop
        }
    };

    const definitionRecordBinary = [
        0b01000110,  // header, 70, 0b01000110
        0,           // reserved
        0,           // architecture
        34, 0,       // global number
        5,           // number of fields
        253, 4, 134, // timestamp
          1, 2, 132, // num sessions
          2, 1,   0, // type
          3, 1,   0, // event
          4, 1,   0, // event_type
    ];

    const dataRecordBinary = [
        0b00000110,      // header, 6, 0b00000110
        54, 104, 66, 24, // timestamp
        1, 0,            // num sessions
        0,               // type
        26,              // event
        1,               // stop
    ];

    test('to FITjs definition message', () => {
        const res = fit.definitionRecord.toFITjs(productMessageDefinition);
        expect(res).toEqual(definitionRecordJS);
    });

    test('to FITjs data message', () => {
        const res = fit.dataRecord.toFITjs(
            definitionRecordJS, {
                timestamp: 1038070838000, // 407005238, 54, 104, 66, 24,
                num_sessions: 1, //
                type: 0, // manual
                event: 26, // activity
                event_type: 1, // stop
            },
        );
        expect(res).toEqual(dataRecordJS);
    });

    test('definition message to binary', () => {
        const view = new DataView(new Uint8Array(definitionRecordJS.length).buffer);

        const res = fit.definitionRecord.encode(definitionRecordJS, view);

        expect(dataviewToArray(res)).toEqual(definitionRecordBinary);
    });

    test('data message to binary', () => {
        const view = new DataView(
            new Uint8Array(definitionRecordJS.data_record_length).buffer
        );

        const res = fit.dataRecord.encode(
            definitionRecordJS,
            dataRecordJS.fields,
            view,
        );

        expect(dataviewToArray(res)).toEqual(dataRecordBinary);
    });
});


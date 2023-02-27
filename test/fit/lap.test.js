import {
    empty, first, last, dataviewToArray,
} from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';
import {
    Lap
} from '../../src/fit/activity.js';
import { appData } from './app-data.js';

describe('Activity Message', () => {
    const fit = FIT();

    const productMessageDefinition = [
        'lap', [
            'timestamp',
            'start_time',
            'total_elapsed_time',
            'total_timer_time',
            'message_index',
            'event',
            'event_type',
        ], 4];

    const definitionRecordJS = {
        type: 'definition',
        name: 'lap',
        architecture: 0,
        local_number: 4,
        length: 27,
        data_record_length: 21,
        fields: [
            {number: 253, size: 4, base_type: 'uint32'}, // timestamp
            {number: 2,   size: 4, base_type: 'uint32'}, // start_time
            {number: 7,   size: 4, base_type: 'uint32'}, // total_elapsed_time
            {number: 8,   size: 4, base_type: 'uint32'}, // total_timer_time
            {number: 254, size: 2, base_type: 'uint16'}, // message_index
            {number: 0,   size: 1, base_type: 'enum'},   // event
            {number: 1,   size: 1, base_type: 'enum'},   // event_type
        ]
    };

    const dataRecordJS = {
        type: 'data',
        name: 'lap',
        local_number: 4,
        length: 21,
        fields: {
            timestamp: 1038070838000, // 407005238, 54, 104, 66, 24,
            start_time: 1038070835000, // 407005235, 51, 104, 66, 24,
            total_elapsed_time: 3,
            total_timer_time: 3,
            message_index: 0,
            event: 9,
            event_type: 1,
        },
    };

    const definitionRecordBinary = [
        0b01000100,  // header, 68, 0b01000100
        0,           // reserved
        0,           // architecture
        19, 0,        // global number
        7,           // number of fields
        253, 4, 134, // timestamp
          2, 4, 134, // start_time
          7, 4, 134, // total_elapsed_time
          8, 4, 134, // total_timer_time
        254, 2, 132, // message_index
          0, 1,   0, // event
          1, 1,   0, // event_type
    ];

    const dataRecordBinary = [
        0b00000100,      // header, 68, 0b00001000
        54, 104, 66, 24, // timestamp
        51, 104, 66, 24, // start_time
        184, 11, 0, 0,   // total_elapsed_time
        184, 11, 0, 0,   // total_timer_time
        0, 0,            // message_index
        9,               // event
        1,               // event_type
    ];

    test('to FITjs definition message', () => {
        const res = fit.definitionRecord.toFITjs(productMessageDefinition);
        expect(res).toEqual(definitionRecordJS);
    });

    test('to FITjs data message', () => {
        const res = fit.dataRecord.toFITjs(
            definitionRecordJS, Lap({
                timestamp: 1038070838000,
                start_time: 1038070835000,
            }),
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

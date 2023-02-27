import {
    empty, first, last, dataviewToArray,
} from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';
import {
    FileId
} from '../../src/fit/activity.js';
import { appData } from './app-data.js';

describe('Activity Message', () => {
    const fit = FIT();

    const productMessageDefinition = [
        'file_id', [
            'time_created',
            'manufacturer',
            'product',
            'number',
            'type',
        ], 0];

    const definitionRecordJS = {
        type: 'definition',
        name: 'file_id',
        architecture: 0,
        local_number: 0,
        length: 21,
        data_record_length: 12,
        fields: [
            {number: 4, size: 4, base_type: 'uint32'},
            {number: 1, size: 2, base_type: 'uint16'},
            {number: 2, size: 2, base_type: 'uint16'},
            {number: 5, size: 2, base_type: 'uint16'},
            {number: 0, size: 1, base_type: 'enum'},
        ]
    };

    const dataRecordJS = {
        type: 'data',
        name: 'file_id',
        local_number: 0,
        length: 12,
        fields: {
            time_created: 1038070838000,
            manufacturer: 255,
            product:      0,
            number:       0,
            type:         4,
        },
    };

    const definitionRecordBinary = [
        0b01000000,  // header, 64, 0b01000000
        0,           // reserved
        0,           // architecture
        0, 0,        // global number
        5,           // number of fields
        4, 4, 134,   // time_created
        1, 2, 132,   // manufacturer
        2, 2, 132,   // product
        5, 2, 132,   // number
        0, 1, 0,     // type
    ];

    const dataRecordBinary = [
        0b00000000,      // header, 0, 0b00000000
        54, 104, 66, 24, // time_created
        255, 0,          // manufacturer
        0, 0,            // product
        0, 0,            // number
        4,               // type
    ];

    test('to FITjs definition message', () => {
        const res = fit.definitionRecord.toFITjs(productMessageDefinition);
        expect(res).toEqual(definitionRecordJS);
    });

    test('to FITjs data message', () => {
        const res = fit.dataRecord.toFITjs(
            definitionRecordJS, FileId({
                time_created: 1038070838000,
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


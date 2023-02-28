import { dataviewToArray } from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';
import { appData } from './data.js';

describe('Record Message', () => {
    const fit = FIT();

    const productMessageDefinition = [
        'record', [
            'timestamp',
            'position_lat',
            'position_long',
            'altitude',
            'heart_rate',
            'cadence',
            'distance',
            'speed',
            'power',
            'grade',
            'device_index',
        ], 3];

    const definitionRecordJS = {
        type: 'definition',
        name: 'record',
        architecture: 0,
        local_number: 3,
        length: 39,
        data_record_length: 28,
        fields: [
            {number: 253, size: 4, base_type: 'uint32'}, // timestamp
            {number:   0, size: 4, base_type: 'sint32'}, // position_lat
            {number:   1, size: 4, base_type: 'sint32'}, // position_long
            {number:   2, size: 2, base_type: 'uint16'}, // altitude
            {number:   3, size: 1, base_type: 'uint8'},  // heart_rate
            {number:   4, size: 1, base_type: 'uint8'},  // cadence
            {number:   5, size: 4, base_type: 'uint32'}, // distance
            {number:   6, size: 2, base_type: 'uint16'}, // speed
            {number:   7, size: 2, base_type: 'uint16'}, // power
            {number:   9, size: 2, base_type: 'sint16'}, // grade
            {number:  62, size: 1, base_type: 'uint8'},  // device_index
        ]
    };

    const dataRecordJS = {
        type: 'data',
        name: 'record',
        local_number: 3,
        length: 28,
        fields: {
            timestamp: 1038070835000,  // 407005235, 51, 104, 66, 24,
            position_lat: -128450465,  // sint32, semicircles, 95, 0, 88, 248
            position_long: 1978610201, // sint32, semicircles, 25, 50, 239, 117
            altitude: 87,              // uint16, scale 5, offset 500, m
            heart_rate: 90,            // uint8, bpm
            cadence: 70,               // uint8, rpm
            distance: 7.66,            // uint32, scale 100, m
            speed: 6.717,              // uint16, scale 1000, m/s
            power: 160,                // uint16, w
            grade: 0,                  // sint16, scale 100, %
            device_index: 0,           // uint8, 0
        }
    };

    const values = dataRecordJS.fields;

    const definitionRecordBinary = [
        0b01000011,  // header, 69, 0b01000101
        0,           // reserved
        0,           // architecture
        20, 0,       // global number
        11,          // number of fields
        253, 4, 134, // timestamp
          0, 4, 133, // position_lat
          1, 4, 133, // position_long
          2, 2, 132, // altitude 935
          3, 1,   2, // heart_rate
          4, 1,   2, // cadence
          5, 4, 134, // distance 10000
          6, 2, 132, // speed 6000
          7, 2, 132, // power
          9, 2, 131, // grade 140
         62, 1,   2, // device_index
    ];

    const dataRecordBinary = [
        0b0000011,         // header
        51, 104, 66, 24,   // timestamp
        95, 0, 88, 248,    // position_lat
        25, 50, 239, 117,  // position_long
        167, 3,            // altitude 935
        90,                // heart_rate
        70,                // cadence
        254, 2, 0, 0,      // distance
        61, 26,            // speed
        160, 0,            // power
        0, 0,              // grade
        0,                 // device_index
    ];

    test('to FITjs definition message', () => {
        const res = fit.definitionRecord.toFITjs(productMessageDefinition);
        expect(res).toEqual(definitionRecordJS);
    });

    test('to FITjs data message', () => {
        const res = fit.dataRecord.toFITjs(definitionRecordJS, values);
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
            dataRecordJS,
            view,
        );

        expect(dataviewToArray(res)).toEqual(dataRecordBinary);
    });
});


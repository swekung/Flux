import { first, last, dataviewToArray } from '../../src/functions.js';
import { fit } from '../../src/fit/fit.js';
import { Session } from '../../src/fit/local-activity.js';
import { appData } from './data.js';

describe('Session Message', () => {

    const productMessageDefinition = [
        'session', [
            'timestamp',
            'start_time',
            'total_elapsed_time',
            'total_timer_time',
            'message_index',
            'sport',
            'sub_sport',
            'total_distance',
            'avg_speed',
            'max_speed',
            'avg_heart_rate',
            'max_heart_rate',
            'avg_cadence',
            'max_cadence',
            'avg_power',
            'max_power',
            'first_lap_index',
            'num_laps',
        ], 5];

    const definitionRecordJS = {
        type: 'definition',
        architecture: 0,
        name: 'session',
        local_number: 5,
        length: 60,
        data_record_length: 41,
        fields: [
            {number: 253, size: 4, base_type: 'uint32'}, // timestamp
            {number: 2,   size: 4, base_type: 'uint32'}, // start_time
            {number: 7,   size: 4, base_type: 'uint32'}, // total_elapsed_time
            {number: 8,   size: 4, base_type: 'uint32'}, // total_timer_time
            {number: 254, size: 2, base_type: 'uint16'}, // message_index
            {number: 5,   size: 1, base_type: 'enum'}, // sport
            {number: 6,   size: 1, base_type: 'enum'}, // sub_sport
            {number: 9,   size: 4, base_type: 'uint32'}, // total_distance
            {number: 14,  size: 2, base_type: 'uint16'}, // avg_speed
            {number: 15,  size: 2, base_type: 'uint16'}, // max_speed
            {number: 16,  size: 1, base_type: 'uint8'}, // avg_heart_rate
            {number: 17,  size: 1, base_type: 'uint8'}, // max_heart_rate
            {number: 18,  size: 1, base_type: 'uint8'}, // avg_cadence
            {number: 19,  size: 1, base_type: 'uint8'}, // max_cadence
            {number: 20,  size: 2, base_type: 'uint16'}, // avg_power
            {number: 21,  size: 2, base_type: 'uint16'}, // max_power
            {number: 25,  size: 2, base_type: 'uint16'}, // first_lap_index
            {number: 26,  size: 2, base_type: 'uint16'}, // num_laps
        ]
    };

    const dataRecordJS = {
        type: 'data',
        name: 'session',
        local_number: 5,
        length: 41,
        fields: {
            timestamp: 1038070838000, // 407005238, 54, 104, 66, 24,
            start_time: 1038070835000, // 407005235, 51, 104, 66, 24,
            total_elapsed_time: 3,
            total_timer_time: 3,
            message_index: 0,
            sport: 2,
            sub_sport: 58,
            total_distance: 28.56,
            avg_speed: 7.019, // 7.019
            max_speed: 7.498,
            avg_heart_rate: 91.5, // 91.5
            max_heart_rate: 93,
            avg_cadence: 71.5, // 71.5
            max_cadence: 73,
            avg_power: 161.5, // 161.5
            max_power: 163,
            first_lap_index: 0,
            num_laps: 1,
        }
    };

    const definitionRecordBinary = [
        0b01000101,  // header, 69, 0b01000101
        0,           // reserved
        0,           // architecture
        18, 0,       // global number
        18,          // number of fields
        253, 4, 134, // timestamp
          2, 4, 134, // start_time
          7, 4, 134, // total_elapsed_time
          8, 4, 134, // total_timer_time
        254, 2, 132, // message_index
          5, 1,   0, // sport
          6, 1,   0, // sub_sport
          9, 4, 134, // total_distance
         14, 2, 132, // avg_speed
         15, 2, 132, // max_speed
         16, 1,   2, // avg_heart_rate
         17, 1,   2, // max_heart_rate
         18, 1,   2, // avg_cadence
         19, 1,   2, // max_cadence
         20, 2, 132, // avg_power
         21, 2, 132, // max_power
         25, 2, 132, // first_lap_index
         26, 2, 132, // num_laps
    ];

    const dataRecordBinary = [
        0b00000101,      // header, 5, 0b00000101
        54, 104, 66, 24, // timestamp
        51, 104, 66, 24, // start_time
        184, 11, 0, 0,   // total_elapsed_time
        184, 11, 0, 0,   // total_timer_time
        0, 0,            // message_index
        2,               // sport
        58,              // sub_sport
        40, 11, 0, 0,    // total_distance
        107, 27,         // avg_speed
        74, 29,          // max_speed
        91,              // avg_heart_rate
        93,              // max_heart_rate
        71,              // avg_cadence
        73,              // max_cadence
        161, 0,          // avg_power
        163, 0,          // max_power
        0, 0,            // first_lap_index
        1, 0,            // num_laps
    ];

    test('to FITjs definition message', () => {
        const res = fit.definitionRecord.toFITjs(productMessageDefinition);
        expect(res).toEqual(definitionRecordJS);
    });

    test('to FITjs data message', () => {
        const res = fit.dataRecord.toFITjs(
            definitionRecordJS, Session({
                records: appData.records,
                laps: appData.laps,
                start_time: first(appData.records).timestamp,
                timestamp: last(appData.records).timestamp,
            }));
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


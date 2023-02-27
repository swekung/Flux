import {
    empty, first, last, dataviewToArray, isObject, nthBit,
} from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';

const fit = FIT();

describe('Definition Record', () => {
    test('encode', () => {
        const expected = [64, 0, 0, 0,0, 5,  4,4,134  , 1,2,132  , 2,2,132  , 5,2,132  , 0,1,0];
        const res = fit.definitionRecord.encode({
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
                {number: 0, size: 1, base_type: 'enum'}
            ]
        }, new DataView(new Uint8Array(expected.length).buffer));

        expect(dataviewToArray(res)).toEqual(expected);
    });

    test('decode', () => {
        const view = new DataView(new Uint8Array([64, 0, 0, 0,0, 5,  4,4,134  , 1,2,132  , 2,2,132  , 5,2,132  , 0,1,0]).buffer);
        const res = fit.definitionRecord.decode(view);

        expect(res).toEqual({
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
                {number: 0, size: 1, base_type: 'enum'}
            ]
        });
    });

});

describe('Data Record', () => {
    test('encode File Id', () => {
        const expected = [0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4];
        const definition = {
            type: 'data',
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
                {number: 0, size: 1, base_type: 'enum'}
            ]
        };
        const values = {
            time_created: 1623549578000, // 992483978,
            manufacturer: 260,
            product:      0,
            number:       0,
            type:         4
        };
        const view = new DataView(new Uint8Array(expected.length).buffer);

        const res = fit.dataRecord.encode(definition, values, view);

        expect(dataviewToArray(res)).toEqual(expected);
    });

    test('decode File Id', () => {
        const view = new DataView(new Uint8Array([0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4]).buffer);
        const definition = {
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
                {number: 0, size: 1, base_type: 'enum'}
            ]
        };
        const expected = {
            type: 'data',
            name: 'file_id',
            local_number: 0,
            length: 12,
            fields: {
                time_created: 1623549578000,
                manufacturer: 260,
                product:      0,
                number:       0,
                type:         4
            },
        };
        const res = fit.dataRecord.decode(definition, view);

        expect(res).toEqual(expected);
    });

    test('encode Record', () => {
        const expected = [
            0b0000011, // header
            138, 26, 40, 59, // timestamp
            95, 0, 88, 248, // position_lat
            25, 50, 239, 117, // position_long
            167, 3, // altitude 935
            90, // heart_rate
            80, // cadence
            16, 39, 0, 0, // distance 10000
            112, 23, // speed 6000
            180, 0, // power
            140, 0, // grade 140
            0, // device_index
        ];

        // JS Object rep of definition record as decoded from .FIT binary
        const definition = {
            type: 'definition',
            name: 'record',
            architecture: 0,
            local_number: 3,
            length: 39,
            data_record_length: 27,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number:   0, size: 4, base_type: 'sint32'}, // position_lat
                {number:   1, size: 4, base_type: 'sint32'}, // position_long
                {number:   2, size: 2, base_type: 'uint16'}, // altitude
                {number:   3, size: 1, base_type: 'uint8'}, // heart_rate
                {number:   4, size: 1, base_type: 'uint8'}, // cadence
                {number:   5, size: 4, base_type: 'uint32'}, // distance
                {number:   6, size: 2, base_type: 'uint16'}, // speed
                {number:   7, size: 2, base_type: 'uint16'}, // power
                {number:   9, size: 2, base_type: 'sint16'}, // grade
                {number:  62, size: 1, base_type: 'uint8'}, // device_index
            ]
        };

        // JS Object rep of data record as decoded from .FIT binary
        const values = {
            timestamp: 1623549578000, // 992483978,
            position_lat: -128450465, // sint32, semicircles
            position_long: 1978610201, // sint32, semicircles
            altitude: 87, // uint16, scale 5, offset 500, m
            heart_rate: 90, // uint8, bpm
            cadence: 80, // uint8, rpm
            distance: 100, // uint32, scale 100, m
            speed: 6, // uint16, scale 1000, m/s
            power: 180, // uint16, w
            grade: 1.4, // sint16, scale 100, %
            device_index: 0, // uint8
        };

        const dataRecordJS = {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 27,
            fields: values,
        };

        const view = new DataView(new Uint8Array(expected.length).buffer);

        const res = fit.dataRecord.encode(definition, values, view);

        expect(dataviewToArray(res)).toEqual(expected);
    });

    test('decode Record', () => {
        // .FIT binary data record for record message
        const view = new DataView(new Uint8Array([
            0b0000011, // header
            138, 26, 40, 59, // timestamp
            95, 0, 88, 248, // position_lat
            25, 50, 239, 117, // position_long
            167, 3, // altitude 935
            90, // heart_rate
            80, // cadence
            16, 39, 0, 0, // distance 10000
            112, 23, // speed 6000
            180, 0, // power
            140, 0, // grade 140
            0, // device_index
        ]).buffer);

        // JS Object rep of definition record as decoded from .FIT binary
        const definitionRecordJS = {
            type: 'definition',
            name: 'record',
            architecture: 0,
            local_number: 3,
            length: 39,
            data_record_length: 27,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number:   0, size: 4, base_type: 'sint32'}, // position_lat
                {number:   1, size: 4, base_type: 'sint32'}, // position_long
                {number:   2, size: 2, base_type: 'uint16'}, // altitude
                {number:   3, size: 1, base_type: 'uint8'}, // heart_rate
                {number:   4, size: 1, base_type: 'uint8'}, // cadence
                {number:   5, size: 4, base_type: 'uint32'}, // distance
                {number:   6, size: 2, base_type: 'uint16'}, // speed
                {number:   7, size: 2, base_type: 'uint16'}, // power
                {number:   9, size: 2, base_type: 'sint16'}, // grade
                {number:  62, size: 1, base_type: 'uint8'}, // device_index
            ]
        };

        // JS Object rep of data record as decoded from .FIT binary
        const dataRecordJS = {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 27,
            fields: {
                timestamp: 1623549578000,
                position_lat: -128450465, // sint32, semicircles
                position_long: 1978610201, // sint32, semicircles
                altitude: 87, // uint16, scale 5, offset 500, m
                heart_rate: 90, // uint8, bpm
                cadence: 80, // uint8, rpm
                distance: 100, // uint32, scale 100, m
                speed: 6, // uint16, scale 1000, m/s
                power: 180, // uint16, w
                grade: 1.4, // sint16, scale 100, %
                device_index: 0, // uint8
            }
        };

        const res = fit.dataRecord.decode(definitionRecordJS, view);

        expect(res).toEqual(dataRecordJS);
    });
});

describe('DefinitionRecordJS', () => {
    test('encode', () => {
        const productMessageDefinitions = [
            ['file_id', [], 0],
            ['device_info', [], 1],
            ['event', [], 2],
            ['record', [
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
            ], 3],
        ];

        const definitionRecordJS = {
            type: 'definition',
            name: 'record',
            architecture: 0,
            local_number: 3,
            length: 39,
            data_record_length: 27,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number:   0, size: 4, base_type: 'sint32'}, // position_lat
                {number:   1, size: 4, base_type: 'sint32'}, // position_long
                {number:   2, size: 2, base_type: 'uint16'}, // altitude
                {number:   3, size: 1, base_type: 'uint8'}, // heart_rate
                {number:   4, size: 1, base_type: 'uint8'}, // cadence
                {number:   5, size: 4, base_type: 'uint32'}, // distance
                {number:   6, size: 2, base_type: 'uint16'}, // speed
                {number:   7, size: 2, base_type: 'uint16'}, // power
                {number:   9, size: 2, base_type: 'sint16'}, // grade
                {number:  62, size: 1, base_type: 'uint8'}, // device_index
            ]
        };

        const res = fit.definitionRecord.toFITjs(productMessageDefinitions[3]);

        expect(res).toEqual(definitionRecordJS);
    });
});

describe('DataRecordJS', () => {
    test('encode', () => {
        // JS Object rep of definition record as decoded from .FIT binary
        // generated from product message definitions
        const definitionRecordJS = {
            type: 'definition',
            name: 'record',
            architecture: 0,
            local_number: 3,
            length: 39,
            data_record_length: 27,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number:   0, size: 4, base_type: 'sint32'}, // position_lat
                {number:   1, size: 4, base_type: 'sint32'}, // position_long
                {number:   2, size: 2, base_type: 'uint16'}, // altitude
                {number:   3, size: 1, base_type: 'uint8'}, // heart_rate
                {number:   4, size: 1, base_type: 'uint8'}, // cadence
                {number:   5, size: 4, base_type: 'uint32'}, // distance
                {number:   6, size: 2, base_type: 'uint16'}, // speed
                {number:   7, size: 2, base_type: 'uint16'}, // power
                {number:   9, size: 2, base_type: 'sint16'}, // grade
                {number:  62, size: 1, base_type: 'uint8'}, // device_index
            ]
        };

        // values as recorded by app
        const values = {
            timestamp: 1623549578000, // 992483978,
            position_lat: -128450465, // sint32, semicircles
            position_long: 1978610201, // sint32, semicircles
            altitude: 87, // uint16, scale 5, offset 500, m
            heart_rate: 90, // uint8, bpm
            cadence: 80, // uint8, rpm
            distance: 100, // uint32, scale 100, m
            speed: 6, // uint16, scale 1000, m/s
            power: 180, // uint16, w
            grade: 1.4, // sint16, scale 100, %
            device_index: 0, // uint8
        };

        // JS Object rep of data record as decoded from .FIT binary
        const dataRecordJS = {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 27,
            fields: {
                timestamp: 1623549578000,
                position_lat: -128450465, // sint32, semicircles
                position_long: 1978610201, // sint32, semicircles
                altitude: 87, // uint16, scale 5, offset 500, m
                heart_rate: 90, // uint8, bpm
                cadence: 80, // uint8, rpm
                distance: 100, // uint32, scale 100, m
                speed: 6, // uint16, scale 1000, m/s
                power: 180, // uint16, w
                grade: 1.4, // sint16, scale 100, %
                device_index: 0, // uint8
            }
        };

        const res = fit.dataRecord.toFITjs(definitionRecordJS, values);

        expect(res).toEqual(dataRecordJS);
    });
});


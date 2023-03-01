import { dataviewToArray, isObject, nthBit } from '../../src/functions.js';
import { fit } from '../../src/fit/fit.js';

describe('File Header Message', () => {

    describe('default format header', () => {
        const recordJS = {
            type: 'header',
            length: 14,
            headerSize: 14,
            protocolVersion: '2.0',
            profileVersion: '21.40',
            dataSize: 364,
            dataType: '.FIT',
            crc: 0,
        };

        const recordBinary = [
            14,           // header length
            32,           // profile version
            92,8,         // protocol version
            108,1,0,0,    // data size (without header and crc)
            46,70,73,84,  // data type (ASCII for ".FIT")
            163, 111,     // header crc
        ];

        test('to FITjs record', () => {
            const res = fit.fileHeader.toFITjs({dataSize: 364});
            expect(res).toEqual(recordJS);
        });

        test('FITjs to binary', () => {
            const view = new DataView(new Uint8Array(recordJS.length).buffer);
            const res = fit.fileHeader.encode(recordJS, view);
            expect(dataviewToArray(res)).toEqual(recordBinary);
        });
    });


    describe('Zwift (legacy) header', () => {
        const recordJS = {
            type: 'header',
            length: 12,
            headerSize: 12,
            protocolVersion: '1.0',
            profileVersion: '1.00',
            dataSize: 161521,
            dataType: '.FIT',
            // crc: undefined,
        };

        const recordBinary = [
            12,           // header length
            16,           // profile version
            100,0,        // protocol version
            241,118,2,0,  // data size
            46,70,73,84,  // data type
                          // no crc
        ];

        test('binary to FITjs', () => {
            const view = new DataView(new Uint8Array(recordBinary).buffer);
            const header = fit.fileHeader.decode(view);
            expect(header).toEqual(recordJS);
        });
    });
});

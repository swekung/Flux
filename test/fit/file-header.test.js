import {
    empty, first, last, dataviewToArray, isObject, nthBit,
} from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';

function toUint16(arr) {
    return new DataView(new Uint8Array(arr).buffer).getUint16(0, true);
}

function toUint32(arr) {
    return new DataView(new Uint8Array(arr).buffer).getUint32(0, true);
}

describe('reads fit file header', () => {

    const fit = FIT();

    describe('default format header', () => {
        const headerBuffer = new Uint8Array(
            [14, 32, 92,8,  39,0,0,0,  46,70,73,84,  123,197]
        ).buffer;
        const view = new DataView(headerBuffer);
        const res  = fit.fileHeader.decode(view);

        test('decodes header', () => {
            expect(res).toEqual({
                type: 'header',
                length: 14,
                headerSize: 14,
                protocolVersion: '2.0',
                profileVersion: '21.40',
                dataSize: 39,
                dataType: '.FIT',
                crc: 50555,
            });
        });

        test('encodes header', () => {
            const header = {
                type: 'header',
                length: 14,
                headerSize: 14,
                protocolVersion: '2.0',
                profileVersion: '21.40',
                dataSize: 39,
                dataType: '.FIT',
                crc: undefined,
            };
            const view = new DataView(new Uint8Array(14).buffer);
            const res = fit.fileHeader.encode(header, view);
            const expected = [14, 32, 92,8,  39,0,0,0,  46,70,73,84,  123,197];

            expect(dataviewToArray(res)).toEqual(expected);
        });
    });

    describe('Zwift (legacy) header', () => {
        let headerBuffer = new Uint8Array(
            [12, 16, 100,0,  241,118,2,0,  46,70,73,84]
        ).buffer;
        let view = new DataView(headerBuffer);

        let header = fit.fileHeader.decode(view);

        expect(header).toEqual({
            type: 'header',
            length: 12,
            headerSize: 12,
            protocolVersion: '1.0',
            profileVersion: '1.00',
            dataSize: 161521,
            dataType: '.FIT',
            // crc: undefined,
        });
    });

    describe('Zwift (legacy) unfinished header', () => {
        let headerBuffer = new Uint8Array(
            [12, 16, 100,0,  0,0,0,0,  46,70,73,84]
        ).buffer;
        let view = new DataView(headerBuffer);

        let header = fit.fileHeader.decode(view);

        expect(header).toEqual({
            type: 'header',
            length: 12,
            headerSize: 12,
            protocolVersion: '1.0',
            profileVersion: '1.00',
            dataSize: 0,
            dataType: '.FIT',
            // crc: undefined,
        });
    });
});

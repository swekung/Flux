import { dataviewToArray } from '../../src/functions.js';
import { FIT } from '../../src/fit/fit.js';

describe('Record Header', () => {

    const fit = FIT();

    test('decode: normal, definition, reserved, 15', () => {
        const header = fit.recordHeader.decode(0b01001111);
        expect(header).toEqual({
            headerType: 'normal',
            messageType: 'definition',
            messageTypeSpecific: 'reserved',
            localMessageType: 15,
        });
    });

    test('decode: normal, definition, developer, 3', () => {
        const header = fit.recordHeader.decode(0b01100011);
        expect(header).toEqual({
            headerType: 'normal',
            messageType: 'definition',
            messageTypeSpecific: 'developer',
            localMessageType: 3,
        });
    });

    test('decode: normal, data, reserved, 4', () => {
        const header = fit.recordHeader.decode(0b00000100);
        expect(header).toEqual({
            headerType: 'normal',
            messageType: 'data',
            messageTypeSpecific: 'reserved',
            localMessageType: 4,
        });
    });

    test('encode: normal, data, reserved, 4', () => {
        const res = fit.recordHeader.encode({
            headerType: 'normal',
            messageType: 'data',
            messageTypeSpecific: 'reserved',
            localMessageType: 4,
        });
        expect(res).toEqual(0b00000100);
    });

    test('encode: decode: normal, definition, developer, 3', () => {
        const res = fit.recordHeader.encode({
            headerType: 'normal',
            messageType: 'definition',
            messageTypeSpecific: 'developer',
            localMessageType: 3,
        });
        expect(res).toEqual(0b01100011);
    });
});

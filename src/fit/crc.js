import { equals, isDataView, f, } from '../functions.js';

function CRCFactory(args = {}) {
    const size = 2;
    const architecture = args.architecture;

    function toGetter(file) {
        if(isDataView(file)) {
            return function(file, i) {
                return file.getUint8(i, true);
            };
        }
        return function(file, i) {
            return file[i];
        };
    }

    // uint8array | DataView, Int, Int -> u16
    function calculateCRC(file, start, end) {
        const crcTable = [
            0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
            0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400,
        ];

        const getter = toGetter(file);

        let crc = 0;
        for (let i = start; i <= end; i++) {
            const byte = getter(file, i);
            let tmp = crcTable[crc & 0xF];
            crc = (crc >> 4) & 0x0FFF;
            crc = crc ^ tmp ^ crcTable[byte & 0xF];
            tmp = crcTable[crc & 0xF];
            crc = (crc >> 4) & 0x0FFF;
            crc = crc ^ tmp ^ crcTable[(byte >> 4) & 0xF];
        }

        return crc;
    }

    function isValid(view, crc) {
        // const start = fileHeader.decode(view).size; // without file header
        const start = 0;
        const end   = view.byteLangth - size;
        return equals(crc, calculateCRC(view, start, end));
    }

    function isCRC(view, i) {
        return equals(view.byteLength - i, size);
    }

    function encode(crc, view, i = 0) {
        view.setUint16(i, crc, architecture);
        return crc;
    }

    function decode(view, i = 0) {
        let value = view.getUint16(i, true);
        return {type: 'crc', length: size, value: value};
    }

    return Object.freeze({
        size,
        calculateCRC,
        isValid,
        encode,
        decode,
    });
}

const CRC = CRCFactory();

export {
    CRCFactory,
    CRC,
};

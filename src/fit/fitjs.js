//
// FITjs
//

import { equals, first, f, expect, dataviewToArray } from '../functions.js';
import { CRC } from './crc.js';
import { HeaderType, RecordType } from './common.js';
import { fileHeader } from './file-header.js';
import { recordHeader } from './record-header.js';
import { definitionRecord } from './definition-record.js';
import { dataRecord } from './data-record.js';

function FitRecord() {
    function isHeader(record) {
        return equals(RecordType.header, record.type);
    }
    function isDefinition(record) {
        return equals(RecordType.definition, record.type);
    }
    function isData(record) {
        return equals(RecordType.data, record.type);
    }
    function isCRC(record) {
        return equals(RecordType.crc, record.type);
    }

    const definitions = {};

    // RecordJS, Value{}, DataView, Int -> DataView
    function encode(recordJS, view, i = 0) {
        if(isHeader(recordJS)) {
            return fileHeader.encode(recordJS, view, i);
        }
        if(isDefinition(recordJS)) {
            definitions[recordJS.name] = recordJS;
            return definitionRecord.encode(recordJS, view, i);
        }
        if(isData(recordJS)) {
            const definition = definitions[recordJS.name];
            return dataRecord.encode(definition, recordJS, view, i);
        }
        if(isCRC(recordJS)) {
            return CRC.encode(CRC.calculateCRC(view, 0, i), view, i);
        }

        console.warn(`Unknown RecordType ${recordJS.type}`, recordJS);
        return view;
    }

    // DataView, Int, Map -> FitRecord
    function decode(view, i = 0, definitions = new Map()) {
        const header = recordHeader.decode(view.getUint8(i, true));

        if(CRC.isCRC(view, i)) {
            return CRC.decode(view, i);
        }
        if(fileHeader.isFileHeader(view, i)) {
            return fileHeader.decode(view, i);
        }
        if(recordHeader.isDefinition(header)) {
            return definitionRecord.decode(view, i);
        }
        if(recordHeader.isData(header)) {
            const definition = definitions.get(header.local_number);
            return definitionRecord.decode(definition, view, i);
        }
        return {};
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function FITjsParser() {
    const fitRecord = FitRecord();

    // [FITjs] -> Dataview
    function encode(fitJS) {
        const header = first(fitJS);
        const dataSize = header.dataSize;
        const viewSize = header.dataSize + header.length + CRC.size;

        const view = new DataView(new Uint8Array(viewSize).buffer);

        // debug
        // const arr = [];
        // end debug

        fitJS.reduce(function(acc, recordJS) {
            if((acc.i + recordJS.length) > viewSize) {
                console.log(
                    `LocalActivity encode view size error: ${viewSize}/${acc.i}, ${recordJS.name}:${recordJS.length}`);
                return acc;
            }

            fitRecord.encode(recordJS, acc.view, acc.i);

            // debug
            // const slice = new DataView(
            //     acc.view.buffer.slice(acc.i, acc.i + recordJS.length));
            // arr.push(slice);
            // console.log(dataviewToArray(slice));
            // end debug

            acc.i += recordJS.length;
            return acc;
        }, {view, i: 0});

        return view;
    }

    // Dataview -> [FITjs]
    function decode() {
        // Note:
        // - RGT uses the same local_number 0 for all definitions
        // - Zwift often produces unfinished files with broken file headers
        throw 'Not implemented!';
    }

    return Object.freeze({
        encode,
    });
}

const FITjs = FITjsParser();

export {
    FITjs,
    FitRecord,
};


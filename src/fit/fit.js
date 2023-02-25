//
// FITjs
//
import { exists, empty, equals, isUndefined, isDataView,
         map, first, second, third, last, traverse, toFixed,
         nthBit, nthBitToBool, f, nth, prop, cond, Maybe, expect } from '../functions.js';

import {
    HeaderType, RecordType,
    getField, setField,
    ValueParser, identityParser,
} from './common.js';

import { CRC } from './crc.js';
import { fileHeader } from './file-header.js';
import { recordHeader } from './record-header.js';
import { fieldDefinition } from './field-definition.js';
import { definitionRecord } from './definition-record.js';
import { dataRecord } from './data-record.js';
import { profiles } from './profiles.js';
import { localActivity } from './activity.js';

function FIT(args = {}) {
    const architecture = args.architecture ?? true;

    return {
        fileHeader,
        CRC,
        recordHeader,
        definitionRecord,
        fieldDefinition,
        dataRecord,

        localActivity,

        // fitRecord,
        // file,
    };
}

export {
    FIT,
};


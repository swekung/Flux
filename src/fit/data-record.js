import { equals, f, nthBit, expect } from '../functions.js';

import {
    HeaderType, RecordType,
    getField, setField, typeToAccessor,
    ValueParser, identityParser,
} from './common.js';
import { profiles } from './profiles.js';
import { recordHeader } from './record-header.js';
import { fieldDefinition } from './field-definition.js';

function DataRecord(args = {}) {
    const architecture     = args.architecture ?? true;
    const _type            = RecordType.data;
    const recordHeaderSize = recordHeader.size;

    // {
    //     type: RecordType
    //     architecture: Int,
    //     name: String,
    //     local_number: Int,
    //     length: Int,
    //     data_record_length: Int,
    //     fields: [{number: Int, size: Int, base_type: BaseType}]
    // },
    // {field_name: Any},
    // DataView,
    // Int
    // ->
    // DataView
    function encode(definition, values, view, start = 0) {
        const architecture = definition.architecture ?? 0;
        const endian       = !architecture; // arch wierdness?

        const header = recordHeader.encode({
            messageType:      _type,
            localMessageType: definition.local_number,
        });

        view.setUint8(start, header, true);

        return definition.fields.reduce(function(acc, field) {
            const fieldName = profiles.numberToFieldName(definition.name, field.number);
            const value = values[fieldName];
            acc.view[typeToAccessor(field.base_type, 'set')](acc.i, value, endian);
            acc.i += field.size;
            return acc;
        }, {view, i: (start + recordHeaderSize)}).view;
    }

    // {
    //     name: String,
    //     local_number: Int,
    //     fields: [
    //         {number: Int, size: Int, base_type: base_type}
    //     ]
    // },
    // ??
    // {
    //     type: RecordType
    //     architecture: Int,
    //     name: String,
    //     local_number: Int,
    //     length: Int,
    //     data_record_length: Int,
    //     fields: [{number: Int, size: Int, base_type: base_type}]
    // }
    // DataView,
    // Int
    // ->
    // {
    //     type: RecordType,
    //     local_number: Int,
    //     name: String,
    //     fields: {field_name: String,}
    // }
    function decode(definition, view, start = 0) {
        const header       = recordHeader.decode(view.getUint8(start, true));
        const local_number = header.localMessageType;
        const name         = definition.name;
        const architecture = definition.architecture;
        const endian       = !architecture;
        const length       = definition.data_record_length;

        return {
            type: _type,
            name,
            local_number,
            length,
            fields: definition.fields.reduce(function(acc, field) {
                let value;
                let index = acc.i;
                if(equals(field.base_type, 7)) {
                    value = '';
                    for(let f=0; f < field.size; f++) {
                        value += String.fromCharCode(view.getUint8(index+f, endian));
                    }
                    value = value.replace(/\x00/gi, '');
                } else {
                    value = view[typeToAccessor(field.base_type, 'get')](index, endian);
                }
                const fieldName = profiles.numberToFieldName(
                    definition.name, field.number
                );
                acc.fields[fieldName] = value;
                acc.i += field.size;
                return acc;
            }, {fields: {}, i: (start + recordHeaderSize)}).fields,
        };
    }

    return Object.freeze({
        type: _type,
        decode,
        encode,
    });
}

const dataRecord = DataRecord();

export {
    DataRecord,
    dataRecord,
};


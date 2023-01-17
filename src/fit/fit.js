//
// FITjs
//

import { exists, empty, equals, isUndefined, isDataView,
         map, first, second, third, last, traverse,
         nthBitToBool } from '../functions.js';
import { typeToAccessor } from '../utils.js';

const HeaderType = {
    normal:    'normal',
    timestamp: 'timestamp',
};

const RecordType = {
    header:    'header',
    definiton: 'definition',
    data:      'data',
    crc:       'crc',
};

function FIT(args = {}) {
    const profiles = args.profiles; // unwrap

    function FileHeader(args = {}) {
        const type        = RecordType.header;
        const defaultSize = 14;
        const legacySize  = 12;
        const crcSize     = 2;

        const defaults = {
            size: defaultSize,
            protocolVersion: '2.0',
            profileVersion: '21.40',
            crc: 0x0000,
        };

        function crcIndex(size, i = 0) {
            return i + (size - crcSize);
        }

        function writeProtocolVersion(version) {
            if(isUndefined(version))   return 32;
            if(equals(version, '2.0')) return 32;
            if(equals(version, '1.0')) return 16;
            return 16;
        }

        function writeProfileVersion(version) {
            if(isUndefined(version)) return 2140;
            return parseInt(version) * 100;
        }

        function isFileHeader(view, i) {
            if(view.byteLength < legacySize) return false;
            if((view.byteLength - i) < legacySize) return false;
            const byte0 = view.getUint8(i, true);
            if(!equals(byte0, legacySize) ||
               !equals(byte0, defaultSize)) return false;
            const byte8  = view.getUint8(i+8, true);
            const byte9  = view.getUint8(i+9, true);
            const byte10 = view.getUint8(i+10, true);
            const byte11 = view.getUint8(i+11, true);
            return (
                    equals(byte8,  46) &&
                    equals(byte9,  70) &&
                    equals(byte10, 73) &&
                    equals(byte11, 84)
            );
        }

        // FitRecord -> DataView
        function encode(definition, view, i = 0) {
            const size              = definition.length ?? defaults.size;
            const dataRecordsLength = definition.dataRecordsLength ?? 0; // without header and crc
            const protocolVersion   = writeProtocolVersion(
                definition.protocolVersion ?? defaults.protocolVersion
            );
            const profileVersion    = writeProfileVersion(
                definition.profileVersion ?? defaults.profileVersion
            );
            const dataTypeByte      = [46, 70, 73, 84]; // ASCII values for ".FIT"
            let crc                 = defaults.crc; // default value for optional crc of the header of bytes 0-11

            // const buffer = new ArrayBuffer(size);
            // const view   = new DataView(buffer);

            view.setUint8( i+0,  size,              true);
            view.setUint8( i+1,  protocolVersion,   true);
            view.setUint16(i+2,  profileVersion,    true);
            view.setInt32( i+4,  dataRecordsLength, true);
            view.setUint8( i+8,  dataTypeByte[0],   true);
            view.setUint8( i+9,  dataTypeByte[1],   true);
            view.setUint8( i+10, dataTypeByte[2],   true);
            view.setUint8( i+11, dataTypeByte[3],   true);

            if(equals(size, defaultSize)) {
                crc.encode(
                    crc.calculateCRC(view, i, crcIndex(size)),
                    view,
                    crcIndex(size),
                );
            }

            return new Uint8Array(buffer);
        };


        function decodeProtocolVersion(view, i) {
            const code = view.getUint8(i+1, true);
            if(equals(code, 32)) return '2.0';
            if(equals(code, 16)) return '1.0';
            return '1.0';
        }

        function decodeProfileVersion(view, i) {
            const code = view.getUint16(i+2, true);
            return (code / 100).toFixed(2);
        }

        function decodeFileType(view, i) {
            const charCodes = [
                view.getUint8(i+8,  true),
                view.getUint8(i+9,  true),
                view.getUint8(i+10, true),
                view.getUint8(i+11, true),
            ];

            return charCodes.reduce((acc, n) => acc+String.fromCharCode(n), '');
        }

        function decodeCRC(view, i, size) {
            return view.getUint16(crcIndex(size, i), true);
        }

        function decode(view, start = 0) {
            const i                 = start;
            const length            = view.getUint8(i, true);
            const profileVersion    = decodeProfileVersion(view, i);
            const protocolVersion   = decodeProfileVersion(view, i);
            const dataRecordsLength = view.getInt32(i+4, true);
            const fileType          = decodeFileType(view, i);
            const crc               = view.getUint16(crcIndex(size, i), true);

            return {
                type,
                length,
                protocolVersion,
                profileVersion,
                dataRecordsLength,
                fileType,
                crc,
            };
        };

        return Object.freeze({
            type,
            defaultSize,
            legacySize,
            crcSize,
            isFileHeader,
            encode,
            decode,
        });
    }

    function RecordHeader() {
        const size = 1;
        const headerTypeIndex = 7;
        const recordTypeIndex = 6;

        function getLocalMessageNumber(header) {
            return header & 0b00001111;
        }

        function setLocalMessageNumber(header, number) {
            return header + number;
        }

        // TODO: fix
        function isDefinition(header) {
            return equals(RecordType.definition, header.header_type);
        }

        function isData(header) {
            return equals(RecordType.data, header.header_type);
        }

        function isDeveloper(header) {
            return equals(header.developer, true);
        }
        // end fix

        function encodeHeaderType(header) {
            if(nthBitToBool(header, 7)) return HeaderType.timestamp;
            return HeaderType.normal;
        }

        function decodeHeaderType(byte) {
            if(nthBitToBool(byte, headerTypeIndex)) {
                return HeaderType.timestamp;
            } else {
                return HeaderType.normal;
            }
        }

        function decodeRecordType(byte) {
            if(nthBitToBool(byte, recordTypeIndex)) {
                return RecordType.definition;
            } else {
                return RecordType.data;
            }
        }

        // {header_type: String, record_type: String, developer: Bool, local_number: Int}
        // ->
        // Int,
        function encode(header) {
            let byte = setLocalMessageNumber(0b00000000, header.local_number);
            if(isDefinition(header)) byte |= 0b01000000;
            if(isData(header))       byte |= 0b00000000;
            if(isDeveloper(header))  byte |= 0b00100000;
            return byte;
        }

        // Int,
        // ->
        // {header_type: String, record_type: String, developer: Bool, local_number: Int}
        function decode(byte) {
            const header_type  = decodeHeaderType(byte);
            const record_type  = decodeRecordType(byte);
            const developer    = nthBitToBool(byte, 5);
            const local_number = getLocalMessageNumber(byte); // bits 0-3, value 0-15

            return {
                header_type,
                record_type,
                developer,
                local_number,
            };
        }

        return Object.freeze({
            size,
            isDefinition,
            isData,
            isDeveloper,
            encode,
            decode,
        });
    }

    function DefinitionRecord(args = {}) {
        const type                = RecordType.definition;
        const headerSize          = recordHeader.size;
        const fixedContentLength  = 6;
        const fieldLength         = 3;
        const architecture        = args.architecture ?? 0;
        const numberOfFieldsIndex = 5;

        function numberToMessageName(number) {
            return profiles.numberToMessageName(number);
        }

        function messageNameToNumber(messageName) {
            return profiles.messageNameToNumber(messageName);
        }

        function getDefinitionRecordLength(view, start = 0) {
            const numberOfFields    = readNumberOfFields(view, start);
            const numberOfDevFields = readNumberOfDevFields(view, start);

            return fixedContentLength +
                (numberOfFields * fieldLength) +
                (numberOfDevFields > 0 ? 1 : 0) +
                (numberOfDevFields * fieldLength);
        }

        function getDataRecordLength(fields) {
            return headerSize + fields.reduce((acc, x) => acc + x.size, 0);
        }

        function readNumberOfFields(view, start = 0) {
            return view.getUint8(start + numberOfFieldsIndex, true);
        }

        function readNumberOfDevFields(view, start = 0) {
            const header = recordHeader.decode(view.getUint8(start, true));
            if(recordHeader.isDeveloper(header)) {
                const numberOfFields = readNumberOfFields(view, start);
                const index = start + fixedContentLength + (numberOfFields * fieldLength);

                return view.getUint8(index, true);
            }
            return 0;
        }

        // ['message_name', ['field_name'], Int]
        // ->
        // {
        //     type: RecordType
        //     architecture: Int,
        //     name: String,
        //     local_number: Int,
        //     length: Int,
        //     data_msg_length: Int,
        //     fields: [{number: Int, size: Int, base_type: base_type}]
        // }
        function productToFITjs(args = []) {
            const messageName    = first(args);
            const fieldNames     = second(args);
            const local_number   = third(args);
            const numberOfFields = fieldNames.length;

            const length = fixedContentLength + (numberOfFields * fieldLength);
            const fields = {};

            fieldNames.reduce(function(acc, fieldName) {
                const number    = profiles.fieldNameToNumber(messageName, fieldName);
                const size      = profiles.fieldNameToSize(fieldName);
                const base_type = profiles.fieldNameToBaseType(fieldName);
                acc[fieldName] = {number, size, base_type};
                return acc;
            }, fields);

            const data_msg_length = fields.reduce((acc, x) => acc + x.size, 1);

            return {
                type,
                architecture,
                name: messageName,
                local_number,
                length,
                data_msg_length,
                fields,
            };
        }

        // {name: String, local_number: Int, fields: [
        //     {number: Int, size: Int, base_type: base_type}
        // ]}
        // -> DataView
        function encode(definition, view, i = 0) {
            const header         = recordHeader.encode({
                local_number: definition.local_number,
                recordType:   type,
            });
            const numberOfFields = definition.fields.length;
            const globalNumber   = messageNameToNumber(definition.name);

            const length = fixedContentLength + (numberOfFields * fieldLength);
            // const buffer = new ArrayBuffer(length);
            // const view   = new DataView(buffer);

            view.setUint8( i+0, header,         true);
            view.setUint8( i+1, 0,              true);
            view.setUint8( i+2, architecture,   true);
            view.setUint16(i+3, globalNumber,   true);
            view.setUint8( i+5, numberOfFields, true);

            i = fixedContentLength;
            definition.fields.forEach((field) => {
                fieldDefinition.encode(field, view, i);
                i += fieldLength;
            });

            // TODO:
            // if developer fields are defined
            // write # developer fields
            // write developer fields definitions
            if('developerFields' in definition) {

                const numberOfDeveloperFields = definition.developerFields.length;

                view.setUint8(i, numberOfDeveloperFields, true);

                definition.developerFields.forEach((field) => {
                    fieldDefinition.encode(field, view, i);
                    i += fieldLength;
                });
            }

            // return new Uint8Array(buffer);
            return view;
        }

        // DataView,
        // Int
        // ->
        // {
        //     type: RecordType
        //     architecture: Int,
        //     name: String,
        //     local_number: Int,
        //     length: Int,
        //     data_msg_length: Int,
        //     fields: [{number: Int, size: Int, base_type: base_type}]
        // }
        function decode(view, start = 0) {
            const header            = recordHeader.decode(view.getUint8(start, true));
            const local_number      = header.local_number;
            const architecture      = view.getUint8(start+2, true);
            const littleEndian      = !architecture;
            const messageNumber     = view.getUint16(start+3, littleEndian);
            const messageName       = numberToMessageName(messageNumber);
            const numberOfFields    = readNumberOfFields(view, start);
            const numberOfDevFields = readNumberOfDevFields(view, start);
            const length            = getDefinitionRecordLength(view, start);

            let fields = [];
            let i = start + fixedContentLength;

            for(let f=0; f < numberOfFields; f++) {
                fields.push(fieldDefinition.decode(view, i, messageName));
                i += fieldLength;
            }

            i+=1;

            for(let df=0; df < numberOfDevFields; df++) {
                fields.push(fieldDefinition.decode(view, i, messageName));
                i += fieldLength;
            }

            const data_record_length = getDataRecordLength(fields);

            return {
                type,
                architecture,
                name: messageName,
                local_number,
                length,
                data_record_length,
                fields,
            };
        }

        return Object.freeze({
            getDefinitionRecordLength,
            getDataRecordLength,
            productToFITjs,
            encode,
            decode,
        });
    }

    function FieldDefinition(args = {}) {
        const length        = 3;
        const numberIndex   = (offset = 0) => offset+0;
        const sizeIndex     = (offset = 0) => offset+1;
        const baseTypeIndex = (offset = 0) => offset+2;

        // {number: Int, size: Int, base_type: base_type}
        // DataView,
        // Int,
        // -> DataView
        function encode(definition, view, i = 0) {
            view.setUint8(numberIndex(i),   definition.number,    true);
            view.setUint8(sizeIndex(i),     definition.size,      true);
            view.setUint8(baseTypeIndex(i), definition.base_type, true);
            return view;
        }

        // String
        // DataView,
        // Int,
        // ->
        // {number: Int, size: Int, base_type: base_type}
        function decode(messageName, view, i = 0) {
            const number           = view.getUint8(numberIndex(i),   true);
            const size             = view.getUint8(sizeIndex(i),     true);
            const base_type_number = view.getUint8(baseTypeIndex(i), true);
            const base_type        = profiles.base_type[(base_type_number).toString];

            return { number, size, base_type };
        }

        return Object.freeze({
            length,
            numberIndex,
            sizeIndex,
            baseTypeIndex,
            encode,
            decode,
        });
    }

    function DataRecord() {
        const type             = RecordType.data;
        const recordHeaderSize = recordHeader.size;

        // {
        //     type: RecordType
        //     architecture: Int,
        //     name: String,
        //     local_number: Int,
        //     length: Int,
        //     data_msg_length: Int,
        //     fields: [{number: Int, size: Int, base_type: base_type}]
        // },
        // {field_name: Any},
        // DataView,
        // Int
        // ->
        // DataView
        function encode(definition, values, view, start = 0) {
            const fieldsLength = definition.fields.length;
            const length       = recordHeaderSize + fieldsLength;
            const architecture = definition.architecture ?? 0;
            const endian       = !architecture;

            // const buffer = new ArrayBuffer(length);
            // const view   = new DataView(buffer);

            let index    = start;
            const header = recordHeader.encode({
                local_number: definition.local_number,
                recordType:   type,
            });

            view.setUint8(index, header, true);
            index += recordHeaderSize;

            definition.fields.forEach((field) => {
                view[typeToAccessor(field.base_type, 'set')](index, values[field.field], endian);
                index += field.size;
            });

            return view;
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
        //     data_msg_length: Int,
        //     fields: [{number: Int, size: Int, base_type: base_type}]
        // }
        // DataView,
        // Int
        // ->
        // { type: RecordType, local_number: Int, message: String,
        //   fields {field_name: String,}}
        function decode(definition, view, start = 0) {
            const header       = recordHeader.decode(view.getUint8(start, true));
            const local_number = header.local_number;
            const message      = definition.name;
            const architecture = definition.architecture;
            const endian       = !architecture;
            const length       = definition.data_msg_length;

            let index = start + recordHeaderSize;
            let fields = {};

            definition.fields.forEach((fieldDef) => {
                let value;
                if(equals(fieldDef.base_type, 7)) {
                    value = '';
                    for(let i=0; i < fieldDef.size; i++) {
                        value += String.fromCharCode(view.getUint8(index+i, endian));
                    }
                    value = value.replace(/\x00/gi, '');
                } else {
                    value = view[typeToAccessor(fieldDef.base_type, 'get')](index, endian);
                }

                fields[fieldDef.field] = value;
                index += fieldDef.size;
            });

            return {
                type,
                message,
                local_number,
                length,
                fields,
            };
        }

        return Object.freeze({
            decode,
            encode,
        });
    }

    function CRC(args = {}) {
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
            for (let i = start; i < end; i++) {
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
            return view;
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

        // FitRecord, DataView, Int -> DataView
        function encode(record, view, i) {
            if(isHeader(record)) {
                return recordHeader.encode(record, view, i);
            }
            if(isDefinition(record)) {
                return definitionRecord.encode(record, view, i);
            }
            if(isData(record)) {
                // definition ?
                return dataRecord.encode(record, view, i);
            }
            if(isCRC(record)) {
                return crc.encode(view, i);
            }
            console.warn(`Unknown RecordType ${record.type}`, record);
            return view;
        }

        // DataView, Int, Map -> FitRecord
        function decode(view, i = 0, definitions = new Map()) {
            const header = recordHeader.decode(view.getUint8(i, true));

            if(crc.isCRC(view, i)) {
                return crc.decode(view, i);
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

    function File(args = {}) {
        const recordHeaderSize     = recordHeader.size;
        const fileHeaderSize       = fileHeader.defaultSize;
        const fileHeaderLegacySize = fileHeader.legacySize;
        const fileCrcSize          = crc.size;

        function toDefinitions(activity) {
            return activity.reduce((acc, msg) => {
                if(equals(msg.type, 'definition')) {
                    acc[msg.local_number] = msg;
                    return acc;
                }
                return acc;
            }, {});
        }

        function toFileLength(activity, definitions) {
            return activity.reduce((acc, record) => {
                if(equals(record.type, RecordType.header)) {
                    return acc + record.length;
                }
                if(equals(record.type, RecordType.definition)) {
                    return acc + record.length;
                }
                if(equals(record.type, RecordType.data)) {
                    let definition = definitions[record.local_number];
                    return acc + definition.data_msg_length;
                }
                if(equals(record.type, RecordType.crc)) {
                    return acc + crc.size;
                };
                return acc;
            }, 0);
        }

        // [FitRecord]
        // ->
        // DataView
        function encode(activity) {
            const definitions       = toDefinitions(activity);
            const fileLength        = toFileLength(activity, definitions);
            const headerLength      = activity[0].length;
            const dataRecordsLength = fileLength - headerLength - crc.size;

            const uint8Array = new Uint8Array(fileLength);
            const view       = new DataView(uint8Array.buffer);

            let i = 0;

            // - assign dataRecordsLength to FileHeader
            activity.reduce((acc, record) => {
                // if(equals(record.type, RecordType.data)) {
                //     const encoded = data.encode(
                //         definitions[record.local_number], record.fields
                //     );
                //     uint8Array.set(encoded, index);
                //     index += encoded.byteLength;
                // }
                i += record.length;
                return fitRecord.encode(record, acc, i);
            }, view);

            // calculate and write crc
            // const fileCRC = crc.calculate(uint8, 0, fileLength - crc.size);
            // view.setUint16(fileLength - crc.size, fileCRC, true);

            return view;
        }

        // DataVeiw -> [FitRecord]
        function decode(view) {
            // Note:
            // - RGT uses the same local_number 0 for all definitions
            // - Zwift often produces unfinished files with broken file headers
            const fileLength = view.byteLength;
            let i            = 0;
            let records      = [];
            let definitions  = new Map();

            while(i < fileLength) {
                try {
                    const record = fitRecord.decode(view, i, definitions);
                    records.push(record);
                    i += record.length;

                    if(fitRecord.isDefinition(record)) {
                        definitions.set(record.local_number, record);
                    }
                } catch(e) {
                    console.error(`error ${i}/${fileLength}`, e);
                    break;
                }
            }

            return records;
        }

        return Object.freeze({
            decode,
            encode,
            toDefinitions,
            toFileLength,
        });
    }

    const fileHeader       = FileHeader();
    const crc              = CRC();
    const recordHeader     = RecordHeader();
    const definitionRecord = DefinitionRecord();
    const fieldDefinition  = FieldDefinition();
    const dataRecord       = DataRecord();
    const fitRecord        = FitRecord();
    const file             = File();

    return {
        fileHeader,
        crc,
        recordHeader,
        definitionRecord,
        fieldDefinition,
        dataRecord,
        fitRecord,
        file,
    };
}

function mock() {
    const minimal = [
        // 07/Aug/2020
        // header
        12,  16,  100,0,  112,1,0,0,  46,70,73,84,
        // file id definition message
        64, 0, 0, 0,0, 5,  4,4,134,  1,2,132,  2,2,132,  5,2,132,  0,1,0,
        // file id data message
        0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4,
        // device info definition message
        // ...
        // device info data message
        // ...
        // event definition message
        66, 0, 0, 21,0, 6,  253,4,134, 3,4,134, 2,2,132, 0,1,0, 1,1,0, 4,1,2,
        // event data message
        2,  19,36,144,57,  0,0,0,0,  0,0,  0, 0, 0,
        // record definition message
        //                   timestamp,  power, cadence, speed,   hr,   distance
        67, 0, 0, 20,0, 6,  253,4,134, 7,2,132, 4,1,2, 6,2,132, 3,1,2, 5,4,134,
        // record data message
        3, 16,36,144,57, 31,1, 83, 204,34, 150, 103,0,0,0,
        3, 17,36,144,57, 35,1, 85, 199,35, 150, 70,4,0,0,
        3, 18,36,144,57, 34,1, 86, 163,36, 150, 222,7,0,0,
        3, 19,36,144,57, 44,1, 86, 117,37, 150, 125,11,0,0,
        // event data message
        2,  19,36,144,57,  0,0,0,0,  0,0,  0, 4, 0,
        // lap definition message
        68, 0, 0, 19,0, 9,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 0,1,0, 1,1,0, 26,1,2, 24,1,2,
        // lap
        4,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,  0,0, 9, 1, 0, 0,
        // session definition message
        69, 0, 0, 18,0, 18,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 25,2,132, 26,2,132,
        5,1,0, 6,1,0, 20,2,132, 21,2,132, 18,1,2, 19,1,2, 14,2,132, 15,2,132, 16,1,2, 17,1,2, 9,4,134,
        // session data message
        5,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,
        0,0,  0,0,  1,0,  2,  58,
        36,1,  44,1,  85, 86,  42,36,  117,37,  150, 150,  125,11,0,0,
        // activity definition message
        70, 0, 0, 34,0, 7,  253,4,134, 5,4,134, 1,2,132, 2,1,0, 3,1,0, 4,1,0, 6,1,2,
        // activity data message
        6,  19,36,144,57,  19,36,144,57,  1,0,  0,  26,  1,  0,
        // crc
        // 112, 130
        226, 68
    ];
    const activity = new Uint8Array(minimal);
    return new Blob([activity], {type: 'application/octet-stream'});
}


export { FIT, mock };


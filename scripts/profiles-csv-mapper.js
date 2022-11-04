import {
    equals, exists, existance,
    isNumber,
    first, second, third, fourth, last, empty
} from '../src/functions.js';
import { base_types } from '../src/fit/base-types.js';
import fs from 'fs';
import { parse } from 'csv-parse';

function Record() {
    const type = {
        sectionHeader:  'section_header',
        message:        'message',
        field:          'field',
        emptyRow:       'empty_row',
        unknown:        'unknown',
        typeDefinition: 'type_definition',
        typeValue:      'type_value',
    };

    // Output structure:
    // Section Header:
    // {
    //     type: 'section_header',
    //     content: { header: 'ACTIVITY FILE MESSAGES' }
    // }
    //
    // Message:
    // {
    //     type: 'message',
    //     content: { name: 'activity' }
    // }
    //
    // Field:
    // {
    //     type: 'field',
    //     content: {
    //         number: 253,
    //         name: 'timestamp',
    //         type: 'date_time',
    //         scale: '',
    //         offset: '',
    //         units: '',
    //         bits: '',
    //         accumulate: ''
    //     }
    // }
    // TypeValue:
    // {
    //     type: 'type_value',
    //     content: {
    //         name: 'device',
    //         value: 1,
    //     }
    // }
    function cons(type, content) {
        return {
            type,
            content,
        };
    }

    function isSectionHeader(record) {
        return equals(record.type, type.sectionHeader);
    }

    function isMessage(record) {
        return equals(record.type, type.message);
    }

    function isField(record) {
        return equals(record.type, type.field);
    }

    function isTypeDefinition(record) {
        return equals(record.type, type.typeDefinition);
    }

    function isTypeValue(record) {
        return equals(record.type, type.typeValue);
    }

    return Object.freeze({
        type,
        cons,
        isSectionHeader,
        isMessage,
        isField,
        isTypeDefinition,
        isTypeValue,
    });
}

function Reader() {
    const sectionHeaderIndex = {
        header: 3,
    };
    const messageIndex = {
        name: 0,
    };
    const fieldIndex = {
        number: 1,
        name: 2,
        type: 3,
        array: 4,
        components: 5,
        scale: 6,
        offset: 7,
        units: 8,
        bits: 9,
        accumulate: 10,
    };
    const typeDefinitionIndex = {
        name: 0,
        base_type: 1,
    };
    const typeValueIndex = {
        name: 2,
        value: 3,
        comment: 4,
    };

    function isSectionHeader(row) {
        return empty(first(row)) &&
               empty(second(row)) &&
               empty(third(row)) &&
              !empty(fourth(row));
    }

    function isMessage(row) {
        return !empty(first(row)) && empty(second(row));
    }

    function isField(row) {
        return empty(first(row)) && !empty(second(row));
    }

    function isEmptyRow(row) {
        return row.every(empty);
    }

    function isTypeDefinition(row) {
        return !empty(first(row)) &&
               !empty(second(row)) &&
                empty(third(row));
    }

    function isTypeValue(row) {
        return  empty(first(row)) &&
                empty(second(row)) &&
               !empty(third(row)) &&
               !empty(fourth(row));
    }

    // Section Header:
    // {
    //     type: 'section_header',
    //     content: { header: 'ACTIVITY FILE MESSAGES' }
    // }
    function readSectionHeader(row) {
        const header = row[sectionHeaderIndex.header];

        return record.cons(record.type.sectionHeader, {
            header,
        });
    }

    // Message:
    // {
    //     type: 'message',
    //     content: { name: 'activity' }
    // }
    function readMessage(row) {
        const name = row[messageIndex.name];

        return record.cons(record.type.message, {
            name,
        });
    }

    // Field:
    // {
    //     type: 'field',
    //     content: {
    //         number: 253,
    //         name: 'timestamp',
    //         type: 'date_time',
    //         scale: '',
    //         offset: '',
    //         units: '',
    //         bits: '',
    //         accumulate: ''
    //     }
    // }
    function readField(row) {
        const number     = row[fieldIndex.number];
        const name       = row[fieldIndex.name];
        const type       = row[fieldIndex.type];
        const array      = row[fieldIndex.array];
        const components = row[fieldIndex.components];
        const scale      = row[fieldIndex.scale];
        const offset     = row[fieldIndex.offset];
        const units      = row[fieldIndex.units];
        const bits       = row[fieldIndex.bits];
        const accumulate = row[fieldIndex.accumulate];

        return record.cons(record.type.field, {
            number,
            name,
            type,
            scale,
            offset,
            units,
            bits,
            accumulate,
        });
    }

    // TypeDefinition:
    // {
    //     type: 'type_definition',
    //     content: {
    //         name: 'file_id',
    //         base_type: 'enum',
    //     }
    // }
    function readTypeDefinition(row) {
        const name      = row[typeDefinitionIndex.name];
        const base_type = row[typeDefinitionIndex.base_type];

        return record.cons(record.type.typeDefinition, {
            name,
            base_type,
        });
    }

    // TypeValue:
    // {
    //     type: 'type_value',
    //     content: {
    //         name: 'device',
    //         value: 1,
    //     }
    // }
    function readTypeValue(row) {
        const name  = row[typeValueIndex.name];
        const value = row[typeValueIndex.value];

        return record.cons(record.type.typeValue, {
            name,
            value,
        });
    }

    function readEmptyRow(row) {
        return record.cons(record.type.emptyRow, {});
    }

    function readUnknown(row) {
        return record.cons(record.type.unknown, {});
    }


    function read(row) {
        if(isSectionHeader(row)) {
            return readSectionHeader(row);
        }
        if(isMessage(row)) {
            return readMessage(row);
        }
        if(isField(row)) {
            return readField(row);
        }
        if(isEmptyRow(row)) {
            return readEmptyRow(row);
        }
        if(isTypeDefinition(row)) {
            return readTypeDefinition(row);
        }
        if(isTypeValue(row)) {
            return readTypeValue(row);
        }
        return readUnknown(row);
    }

    return Object.freeze({
        isSectionHeader,
        isMessage,
        isField,
        isEmptyRow,
        readSectionHeader,
        readMessage,
        readField,
        readTypeDefinition,
        readTypeValue,
        read,
    });
}

function Mapper() {

    function toFieldNumber(number) {
        return +number;
    }

    function toScale(scale) {
        if(empty(scale)) return undefined;
        return parseInt(scale);
    }

    function toOffset(offset) {
        if(empty(offset)) return undefined;
        return parseInt(offset);
    }

    function toUnits(units) {
        // TODO: implement String or [String] output
        return units;
    }

    function toBits(bits) {
        return stringToNumberOrArray(bits);
    }

    function toAccumulate(accumulate) {
        return stringToNumberOrArray(accumulate);
    }

    function stringToNumberOrArray(x) {
        if(empty(x)) return undefined;
        if(isNaN(+x)) {
            return x.split(',').map(n => +n);
        } else {
            return +x;
        }
    }

    function toType(type) {
        return type;
    }

    function toTypeValue(value) {
        return parseInt(value);
    }

    function typeToBaseType(types, typeName) {
        if(typeName in base_types) return typeName;
        if(typeName in types) return types[typeName].base_type;
        return typeName;
    }

    function equalsSection(shortSectionName, sectionName) {
        if(equals(shortSectionName, 'all')) return true;
        if(equals(shortSectionName, 'common') ||
           equals(shortSectionName, 'other')) {
            shortSectionName = `${shortSectionName} messages`;
        } else {
            shortSectionName = `${shortSectionName} file messages`;
        }
        return equals(shortSectionName, sectionName.toLowerCase());
    }

    function memberOfSections(sections, header) {
        return sections.some(x => equalsSection(x, header));
    }

    function toGlobalMessageDefinitions(args = {}) {
        const fromFile = existance(args.fromFile);
        const toFile   = args.toFile ?? '';
        const sections = args.sections ?? ['all'];

        // [{message: String, fields: [{key: String, number: Int}]}]
        const messages = [];
        let skip = false;

        function onData(row) {
            const rec = reader.read(row);

            if(record.isSectionHeader(rec)) {
                // console.log(rec.content.header);
                // console.log(memberOfSections(sections, rec.content.header));

                skip = !memberOfSections(sections, rec.content.header);
            }
            if(skip) {
                return;
            }
            if(record.isMessage(rec)) {
                messages.push({
                    message: rec.content.name,
                    fields: []
                });
            }
            if(record.isField(rec)) {
                last(messages).fields.push({
                    key:    rec.content.name,
                    number: toFieldNumber(rec.content.number)
                });
            }
        }

        function onEnd() {
            writeFile({path: toFile, content: JSON.stringify(messages, null, 4)});
        }

        readFile(Object.assign(args, {
            path: fromFile,
            onData,
            onEnd,
        }));
    }

    function toGlobalFieldDefinitions(args = {}) {
        const fromFile  = existance(args.fromFile);
        const toFile    = args.toFile ?? '';
        const typesPath = args.typesPath ?? '';
        const sections  = args.sections ?? ['all'];

        let types = {};

        if(empty(typesPath)) {
            console.log('WARNING: Types file not set up. Will not convert field type to base type.');
        } else {
            types = JSON.parse(fs.readFileSync(`./${typesPath}`));
        }

        // {field_name: {base_type: Int, scale:  Int,  offset:  Int,  units:  String,  bits:  Int,  accumulate:  Int}}
        // {field_name: {base_type: Int, scale: [Int], offset: [Int], units: [String], bits: [Int], accumulate: [Int]}}
        const fields = {};
        let skip     = false;

        function onData(row) {
            // Field Record:
            // {
            //     type: 'field',
            //     content: {
            //         number: 253,
            //         name: 'timestamp',
            //         type: 'date_time',
            //         scale: '',
            //         offset: '',
            //         units: '',
            //         bits: '',
            //         accumulate: ''
            //     }
            // }
            const rec = reader.read(row);

            if(record.isSectionHeader(rec)) {
                skip = !memberOfSections(sections, rec.content.header);
            }
            if(skip) {
                return;
            }
            if(record.isField(rec)) {
                fields[rec.content.name] = {
                    type:       toType(rec.content.type),
                    base_type:  typeToBaseType(types, rec.content.type),
                    scale:      toScale(rec.content.scale),
                    offset:     toOffset(rec.content.offset),
                    units:      toUnits(rec.content.units),
                    bits:       toBits(rec.content.bits),
                    accumulate: toAccumulate(rec.content.accumulate)
                };
            }
        }

        function onEnd() {
            // console.log(JSON.stringify(fields, null, 4));
            writeFile({path: toFile, content: JSON.stringify(fields, null, 4)});
        }

        readFile(Object.assign(args, {
            path: fromFile,
            onData,
            onEnd,
        }));
    }

    // types
    // {
    //     type_name: {
    //         basetype: base_type,
    //         values: {
    //             value_key: Int
    //         }
    //     }
    // }
    function toTypeDefinitions(args = {}) {
        const fromFile = existance(args.fromFile);
        const toFile   = args.toFile ?? '';

        const types = {};
        let currentTypeName = '';

        function onData(row) {
            const rec = reader.read(row);

            if(record.isTypeDefinition(rec)) {
                currentTypeName = rec.content.name;

                types[rec.content.name] = {
                    base_type: rec.content.base_type,
                    values: {},
                };
            }
            if(record.isTypeValue(rec)) {
                types[currentTypeName]
                    .values[rec.content.name] = toTypeValue(rec.content.value);

                types[currentTypeName]
                    .values[toTypeValue(rec.content.value)] = rec.content.name;
            }
        }

        function onEnd() {
            // console.log(JSON.stringify(types, null, 4));
            writeFile({path: toFile, content: JSON.stringify(types, null, 4)});
        }

        readFile(Object.assign(args, {
            path: fromFile,
            onData,
            onEnd,
        }));
    }

    function defaultOnData(row) {
        console.log(row);
    }

    function defaultOnEnd() {
        console.log('END of FILE');
    }

    function readFile(args = {}) {
        const path      = existance(args.path);
        const fromLine  = args.fromLine ?? 2;
        const toLine    = args.toLine ?? undefined;
        const onData    = args.onData ?? defaultOnData;
        const onEnd     = args.onEnd ?? defaultOnEnd;
        const delimiter = args.delimiter ?? ';';

        fs.createReadStream(path)
            .pipe(parse({
                delimiter,
                from_line: fromLine,
                to_line:   toLine,
            }))
            .on('data', onData)
            .on('end', onEnd);
    }

    function writeFile(args = {}) {
        const path    = existance(args.path);
        const content = existance(args.content);

        fs.writeFile(path, content, function(err) {
            if(err) {
                console.log(`ERROR: could not create file: ${path}`);
                console.log(err);
            }
            console.log(` created file: ${path}`);
        });
    }

    return Object.freeze({
        toGlobalMessageDefinitions,
        toGlobalFieldDefinitions,
        toTypeDefinitions,
        readFile,
        writeFile,
    });
}

const record = Record();
const reader = Reader();
const mapper = Mapper();

// 0. Define paths for inptut and output files
const paths = {
    typesTable:               './types.csv', // in
    messagesTable:            './messages.csv', // in
    globalTypeDefinitions:    './global-type-definitions.json', // out in
    globalMessageDefinitions: './global-message-definitions.json', // out
    globalFieldDefinitions:   './global-field-definitions.json', // out
};

// 1. Create types file
mapper.toTypeDefinitions({
    fromFile:  paths.typesTable,
    toFile:    paths.globalTypeDefinitions,
    fromLine:  2,
    toLine:    undefined,
    delimiter: ';',
});

// 2. Create messages file
// Common,                26
// Device file,           69
// Settings file,        199
// Sport Settings file,  275
// Goals file,           291
// Activity file,        913
// Course file,          930
// Segment file,        1163
// Workout file,        1129
// Schedule file,       1141
// Totals file,         1154
// Weight Scale file,   1170
// Blood Pressure file, 1184
// Monitoring file,     1236
// Other,               1334
//
// const sections = [
//     'commmon', 'device', 'settings', 'sport settings',
//     'goals', 'activity', 'course', 'segment',
//     'workout', 'schedule', 'totals', 'weight scale',
//     'blood pressure', 'monitoring', 'other',
// ];

mapper.toGlobalMessageDefinitions({
    fromFile:  paths.messagesTable,
    toFile:    paths.globalMessageDefinitions,
    fromLine:  2,
    toLine:    undefined,
    delimiter: ';',
    sections:  ['common', 'activity', 'course'],
});

// 3. Create fields file which requires types file

mapper.toGlobalFieldDefinitions({
    fromFile:  paths.messagesTable,
    toFile:    paths.globalFieldDefinitions,
    fromLine:  2,
    toLine:    undefined,
    delimiter: ';',
    sections:  ['common', 'activity', 'course'],
    typesPath: paths.globalTypeDefinitions,
});


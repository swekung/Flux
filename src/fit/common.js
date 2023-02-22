import { f } from '../functions.js';

const HeaderType = {
    normal:    'normal',
    timestamp: 'timestamp',
};

const RecordType = {
    header:     'header',
    definition: 'definition',
    data:       'data',
    crc:        'crc',
};

function getField(field, dataview, i, architecture) {
    return dataview[`get${field.type}`](i, architecture);
}

function setField(field, value, dataview, i, architecture) {
    return dataview[`set${field.type}`](i, value, architecture);
}

// Base Type To DataView accessor method
const uint8   = [0, 2, 7, 10, 13, 'enum', 'uint8', 'string', 'byte'];
const uint16  = [132, 139, 'uint16', 'uint16z'];
const uint32  = [134, 140, 'uint32', 'uint32z'];
const uint64  = [143, 144, 'uint64', 'uint64z'];

const int8    = [1, 'sint8'];
const int16   = [131, 'sint16'];
const int32   = [133, 'sint32'];
const int64   = [142, 'sint64'];

const float32 = [136, 'float32'];
const float64 = [137, 'float64'];

function typeToAccessor(basetype, method = 'set') {
    if(uint8.includes(basetype))   return `${method}Uint8`;
    if(uint16.includes(basetype))  return `${method}Uint16`;
    if(uint32.includes(basetype))  return `${method}Uint32`;
    if(uint64.includes(basetype))  return `${method}Uint64`;
    if(int8.includes(basetype))    return `${method}Int8`;
    if(int16.includes(basetype))   return `${method}Int16`;
    if(int32.includes(basetype))   return `${method}Int32`;
    if(int64.includes(basetype))   return `${method}Int64`;
    if(float32.includes(basetype)) return `${method}Float32`;
    if(float64.includes(basetype)) return `${method}Float64`;

    return `${method}Uint8`;
}
// END Base Type To DataView accessor method

function ValueParser(args = {}) {
    return Object.freeze({
        encode: args.encode ?? f.I,
        decode: args.decode ?? f.I,
    });
}

const identityParser = ValueParser();

export {
    HeaderType,
    RecordType,

    getField,
    setField,
    typeToAccessor,

    ValueParser,
    identityParser,
};


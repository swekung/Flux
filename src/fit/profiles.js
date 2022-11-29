//
// Profiles
//
// merge, shape, and expose, data from the global and product profile json files
//

// import json from "./foo.json" assert { type: "json" };

import { equals } from '../functions.js';
import { base_type, base_type_definitions } from './base-types.js';
// import global_message_definitions from './global-message-definitions.json' assert {type: 'json'};
// import global_type_definitions from './global-type-definitions.json' assert {type: 'json'};
// import global_field_definitions from './global-field-definitions.json' assert {type: 'json'};;


async function Profiles(args = {}) {
    const global_message_definitions = await fetch('./fit/global-message-definitions.json');
    const global_type_definitions = await fetch('./fit/global-type-definitions.json');
    const global_field_definitions = await fetch('./fit/global-field-definitions.json');

    // merge product types, messages, and fields with the global ones

    // const base_type = base_type;
    const base_types = base_type_definitions;
    const types = global_type_definitions;
    const messages = global_message_definitions;
    const fields = global_field_definitions;

    // methods
    function numberToMessageName(number) {
        return types['mesg_num'].values[(number).toString()] ?? `message_${number}`;
    }

    function numberToFieldName(messageName, fieldNumber) {
        const fields = messages[messageName].fields;
        for(let fieldName in fields) {
            if(equals(fields[fieldName], fieldNumber)) return fieldName;
        }
        return `field_${fieldNumber}`;
    }

    function messageNameToNumber(name) {
        return types.mesg_num.values[name] ?? 0xFFFF;
    }

    function fieldNameToNumber(messageName, fieldName) {
        return messages[messageName].fields[fieldName];
    }

    function fieldNameToSize(name) {
        return base_types[fields[name].base_type].size;
    }

    function fieldNameToBaseType(name) {
        return fields[name].base_type;
    }

    return Object.freeze({
        base_type,
        base_types,
        types,
        messages,
        fields,

        numberToMessageName,
        messageNameToNumber,
        numberToFieldName,
    });
}


function toDualKeyMap(source, first_key, second_key) {
    return source.reduce(function (acc, sourceItem) {
        acc.set(sourceItem[first_key], sourceItem);
        acc.set(sourceItem[second_key], sourceItem);
        return acc;
    }, new Map());
}

export {
    Profiles,
}


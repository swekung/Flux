//
// Local Activity Encoder
//

import { exists, equals, f } from '../functions.js';
import { profiles } from './profiles.js';
import productMessageDefinitions from './product-message-definitions.js';

import { CRC } from './crc.js';
import { fileHeader } from './file-header.js';
import { recordHeader } from './record-header.js';
import { fieldDefinition } from './field-definition.js';
import { definitionRecord } from './definition-record.js';
import { dataRecord } from './data-record.js';

function LocalActivity(args = {}) {
    const definitions = productMessageDefinitions
          .reduce(function(acc, x) {
              const d = definitionRecord.toFITjs(x);
              acc[d.name] = d;
              return acc;
          }, {});

    function toRecordData(record) {
        return dataRecord.toFITjs(definitions.file_id, record);
    }

    function toLapData(lap, message_index) {
        return Lap({...lap, message_index});
    }

    function toFITjs(args = {}) {
        const records = args.records ?? [];
        const laps = args.laps ?? [];

        const now = Date.now();
        const time_created = now;
        const timestamp = now;

        // structure: FITjs
        const structure = [
            // file header
            FileHeader(),
            // definition file_id
            definitions.file_id,
            // data file_id
            FileId({time_created}),
            // definition record
            definitions.record,
            // data record messages
            ...records.map(toRecordData),
            // definition lap
            definitions.lap,
            // data lap messages
            ...laps.map(toLapData),
            // definition session
            definitions.session,
            // data session
            Session({records}),
            // definition activity
            definitions.activity,
            // data activity
            Activity({records}),
            // crc, // needs to be computed last evetytime when encoding binary
        ];

        return structure;
    }

    return Object.freeze({
        toFITjs,
        // encode,
    });
}

// Special Data Messages
function FileHeader() {
    return fileHeader.toFITjs();
}

function FileId(args = {}) {
    return {
        time_created: args.time_created ?? Date.now(),
        manufacturer: args.manufacturer ?? 255,
        product: args.product ?? 0,
        number: 0,
        type: 4,
    };
}

function Event(args = {}) {
    return {};
}

function Lap(args = {}) {
    const start_time = args.start_time;
    const message_index = args.message_index ?? 0;
    const timestamp = args.timestamp ?? Date.now();
    const total_elapsed_time = args.total_elapsed_time ?? (timestamp - start_time);
    const total_timer_time = args.total_timer_time ?? total_elapsed_time;

    return {
        timestamp,
        start_time,
        total_elapsed_time,
        total_timer_time,
        message_index,
        event: profiles.types?.event?.values?.lap ?? 9,
        event_type: profiles.types?.event_type?.values?.stop ?? 1,
    };
}
// END Special Data Messages

// Computed Data Messages
function Session(args = {}) {
    const definition = args.definition;
    const records = args.records;

    // const stats = records.reduce(function(acc, record) {
    // }, {});

    return {
    };
}

function Activity(args = {}) {
    return {};
}

// const session = Session();
// const activity = Activity();
// END Computed Data Messages

const localActivity = LocalActivity();

export {
    localActivity,
};


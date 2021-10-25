import { fitjs } from '../../src/fit/fitjs.js';
import { data } from './data.js';



describe('constructs FITjs Data', () => {
    test('for Record', () => {
        const recordDefinition = {
            type: 'definition',
            message: 'record',
            local_number: 3,
            length: 6+0,
            data_msg_length: 1+0,
            fields: [
                {field: 'timestamp',  number: 253, size: 4, base_type: 134},
                {field: "heart_rate", number:   3, size: 1, base_type: 2},
                {field: "power",      number:   7, size: 2, base_type: 132},
                {field: "cadence",    number:   4, size: 1, base_type: 2},
            ]
        };

        let msg = fitjs.Data({
            values: {
                timestamp: 1630586303108,
                power: 180,
                cadence: 80,
            },
            transforms: { timestamp: fitjs.toFitTimestamp },
            definition: recordDefinition,
            defaults: {
                heart_rate: 0,
                power: 0,
                cadence: 0
            }
        });

        let res = {
            type: 'data',
            message: 'record',
            local_number: 3,
            fields: {
                timestamp: 999520703,
                heart_rate: 0,
                power: 180,
                cadence: 80,
            },
        };

        expect(msg).toEqual(res);
    });
});

describe('constructs FITjs Message', () => {

    test('File Id', () => {
        let msg = fitjs.FileId({time_created: 1630508400000});
        let res = {
            type: 'data',
            message: 'file_id',
            local_number: 0,
            fields: {
                time_created: 999442800,
                manufacturer: 255,
                product:      0,
                number:       0,
                type:         4
            },
        };

        expect(msg).toEqual(res);
    });

    test('Event', () => {
        let msg = fitjs.Event({timestamp: 1630508409000, event_type: 4});
        let res = {
            type: 'data',
            message: 'event',
            local_number: 2,
            fields: {
                timestamp: 999442809,
                event: 0,
                event_type: 4,
                event_group: 0,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Record', () => {
        let msg = fitjs.Record({
            timestamp: 1630508400000,
            power: 180,
            cadence: 80,
            speed: 28.30,
            distance: 4100, // meters
        });
        let res = {
            type: 'data',
            message: 'record',
            local_number: 3,
            fields: {
                timestamp: 999442800,
                heart_rate: 0,
                power: 180,
                cadence: 80,
                speed: 7861,
                distance: 410000,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Lap', () => {
        let msg = fitjs.Lap({
            timestamp:  1630508409000,
            start_time: 1630508400000,
            message_index: 1,
        });
        let res = {
            type: 'data',
            message: 'lap',
            local_number: 4,
            fields: {
                timestamp:  999442809,
                start_time: 999442800,
                total_elapsed_time: 10000,
                total_timer_time:   10000,
                event: 9,
                event_type: 1,
                message_index: 1,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Session', () => {
        let msg = fitjs.Session({
            timestamp:  1630508409000,
            start_time: 1630508400000,

            message_index: 0,
            num_laps: 1,

            avg_power: 180,
            max_power: 193,
            avg_cadence: 80,
            max_cadence: 83,
            avg_speed: 30, // km/h
            max_speed: 31, // km/h
            avg_heart_rate: 144,
            max_heart_rate: 160,
            total_distance: 5000, // meters
        });
        let res = {
            type: 'data',
            message: 'session',
            local_number: 5,
            fields: {
                timestamp:  999442809,
                start_time: 999442800,
                total_elapsed_time: 10000,
                total_timer_time:   10000,

                message_index: 0,
                first_lap_index: 0,
                num_laps: 1,
                sport: 2,
                sub_sport: 58,

                avg_power: 180,
                max_power: 193,
                avg_cadence: 80,
                max_cadence: 83,
                avg_speed: 8333,
                max_speed: 8611,
                avg_heart_rate: 144,
                max_heart_rate: 160,
                total_distance: 500000,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Activity', () => {
        let msg = fitjs.Activity({
            timestamp: 1630586903108,
        });
        let res = {
            type: 'data',
            message: 'activity',
            local_number: 6,
            fields: {
                timestamp: 999521303,
                local_timestamp: 0,
                num_sessions: 1,
                type: 0,
                event: 26,
                event_type: 1,
            },
        };

        expect(msg).toEqual(res);
    });
});

describe('construct FITjs Activity', () => {
    test('basic activity', () => {
        const db = {
            records: [
                {timestamp: 1630508400000, power: 180, speed: 27.00, cadence: 80, heart_rate: 135, distance:  7.5}, // meters
                {timestamp: 1630508401000, power: 183, speed: 27.00, cadence: 81, heart_rate: 135, distance: 15.0},
                {timestamp: 1630508402000, power: 178, speed: 27.00, cadence: 82, heart_rate: 135, distance: 22.5},
                {timestamp: 1630508403000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 30.0},

                {timestamp: 1630508404000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 37.5},
                {timestamp: 1630508405000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 45.0},
                {timestamp: 1630508406000, power: 180, speed: 27.00, cadence: 83, heart_rate: 135, distance: 52.5},
                {timestamp: 1630508407000, power: 180, speed: 27.00, cadence: 80, heart_rate: 135, distance: 60.0},
            ],
            laps: [
                {timestamp: 1630508403000, start_time: 1630508400000},
                {timestamp: 1630508407000, start_time: 1630508404000},
            ],
            events: [
                {timestamp: 1630508400000, event: 0, event_type: 0}, // Start, Lap 1 start
                {timestamp: 1630508407000, event: 0, event_type: 4}, // Stop , Lap 2 end
            ],
        };
        const fitjsActivity = fitjs.encode(db);

        expect(fitjsActivity).toStrictEqual(data.fluxBasicActivity);
    });

    test('activity with pause events', () => {
        const db = {
            records: [
                // Lap 1
                {timestamp: 1630508400000, power: 180, speed: 27.00, cadence: 80, heart_rate: 135, distance:  7.5}, // meters
                {timestamp: 1630508401000, power: 183, speed: 27.00, cadence: 81, heart_rate: 135, distance: 15.0},
                {timestamp: 1630508402000, power: 178, speed: 27.00, cadence: 82, heart_rate: 135, distance: 22.5},
                {timestamp: 1630508403000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 30.0},
                // Lap 2
                {timestamp: 1630508404000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 37.5},
                {timestamp: 1630508405000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 45.0},
                // 2s pause during a lap
                {timestamp: 1630508408000, power: 180, speed: 27.00, cadence: 83, heart_rate: 135, distance: 52.5},
                {timestamp: 1630508409000, power: 180, speed: 27.00, cadence: 80, heart_rate: 135, distance: 60.0},
            ],
            laps: [
                {timestamp: 1630508403000, start_time: 1630508400000},
                {timestamp: 1630508409000, start_time: 1630508404000},
            ],
            events: [
                {timestamp: 1630508400000, event: 0, event_type: 0}, // Start, Lap 1 start
                {timestamp: 1630508405000, event: 0, event_type: 4}, // Stop , Pause,
                {timestamp: 1630508408000, event: 0, event_type: 0}, // Start, Resume,
                {timestamp: 1630508409000, event: 0, event_type: 4}, // Stop , Lap 2 end
            ],
        };
        const fitjsActivity = fitjs.encode(db);

        expect(fitjsActivity).toStrictEqual(data.fluxPauseActivity);
    });
});

describe('FITjs helper functions', () => {

    test('TotalTimerTime', () => {
        const events = [
            {timestamp: 1630508404000, event: 0, event_type: 0}, // Start, Lap 2 start
            {timestamp: 1630508405000, event: 0, event_type: 4}, // Stop , Pause,
            {timestamp: 1630508408000, event: 0, event_type: 0}, // Start, Resume,
            {timestamp: 1630508409000, event: 0, event_type: 4}, // Stop , Lap 2 end
        ].map(fitjs.Event);

        const time = fitjs.TotalTimerTime({timestamp: 1630508409000, start_time: 1630508404000, events});

        expect(time).toBe(4);
    });

    test('TotalElapsedTime', () => {
        const lap = {start_time: 1630508400000, timestamp: 1630508407000, event: 0, event_type: 4};

        const lapTime = fitjs.TotalElapsedTime(lap);

        expect(lapTime).toBe(8);
    });

    test('toFitDistance', () => {
        expect(fitjs.toFitDistance()(1)).toBe(1*100);
        expect(fitjs.toFitDistance()(1000)).toBe(1000*100);

        expect(fitjs.toFitDistance('m')(1)).toBe(1*100);
        expect(fitjs.toFitDistance('m')(1000)).toBe(1000*100);

        expect(fitjs.toFitDistance('km')(1)).toBe(1*1000*100);
        expect(fitjs.toFitDistance('km')(10)).toBe(10*1000*100);
    });
});

// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });


// App Input
//
// Records
const records = [
    {
        timestamp: 1038070835, //
        position_lat: -128450465, // sint32, semicircles
        position_long: 1978610201, // sint32, semicircles
        altitude: 87, // uint16, scale 5, offset 500, m
        heart_rate: 90, // uint8, bpm
        cadence: 70, // uint8, rpm
        distance: 7.66, // uint32, scale 100, m
        speed: 6.717, // uint16, scale 1000, m/s
        power: 160, // uint16, w
        grade: 0, // sint16, scale 100, %
        device_index: 0, // uint8
    },
    {
        timestamp: 1038070836, //
        position_lat: -128449747, // sint32, semicircles
        position_long: 1978610154, // sint32, semicircles
        altitude: 87, // uint16, scale 5, offset 500, m
        heart_rate: 91, // uint8, bpm
        cadence: 71, // uint8, rpm
        distance: 14.36, // uint32, scale 100, m
        speed: 6.781, // uint16, scale 1000, m/s
        power: 161, // uint16, w
        grade: 0, // sint16, scale 100, %
        device_index: 0, // uint8
    },
    {
        timestamp: 1038070837, //
        position_lat: -128449037, // sint32, semicircles
        position_long: 1978609898, // sint32, semicircles
        altitude: 87, // uint16, scale 5, offset 500, m
        heart_rate: 92, // uint8, bpm
        cadence: 72, // uint8, rpm
        distance:	21.34, // uint32, scale 100, m
        speed: 7.08, // uint16, scale 1000, m/s
        power: 162, // uint16, w
        grade: 0, // sint16, scale 100, %
        device_index: 0, // uint8
    },
    {
        timestamp: 1038070838, //
        position_lat: -128448324, // sint32, semicircles
        position_long: 1978609588, // sint32, semicircles
        altitude: 87, // uint16, scale 5, offset 500, m
        heart_rate: 93, // uint8, bpm
        cadence: 73, // uint8, rpm
        distance:	28.56, // uint32, scale 100, m
        speed: 7.498, // uint16, scale 1000, m/s
        power: 163, // uint16, w
        grade: 0, // sint16, scale 100, %
        device_index: 0, // uint8
    },
];

// Laps
const laps = [
    {
        start_time: 1038070835,
        timestamp: 1038070838,
        // total_elapsed_time: 4,
        // total_timer_time: 4,
        // event: 0,
        // event_type: 0,
        // message_index: 0,
    }
];

const appData = {records, laps};

export { appData };

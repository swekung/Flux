//
// Product/App Message Definitions
//
// this is the subset of definitions of messages and message fields
// that the product/app fit file encoder whats to use

const productMessageDefinitions = [
    ['file_id', [
        'time_created',
        'manufacturer',
        'product',
        'number',
        'type',
    ], 0],
    ['event', [
        'timestamp',
        'event',
        'event_type',
        'event_group',
    ], 2],
    ['record', [
        'timestamp',
        'position_lat',
        'position_long',
        'distance',
        'heart_rate',
        'altitude',
        'speed',
        'power',
        'grade',
        'cadence',
        'device_index',
        // 'total_hemoglobin_conc',
        // 'saturated_hemoglobin_percent',
    ], 3],
    ['lap', [
        'timestamp',
        'start_time',
        'total_elapsed_time',
        'total_timer_time',
        'message_index',
        'event',
        'event_type',
    ], 4],
    ['session', [
        'timestamp',
        'start_time',
        'total_elapsed_time',
        'total_timer_time',
        'message_index',
        'first_lap_index',
        'num_laps',
        'sport',
        'sub_sport',
        'avg_power',
        'max_power',
        'avg_cadence',
        'max_cadence',
        'avg_speed',
        'max_speed',
        'avg_heart_rate',
        'max_heart_rate',
        'total_distance',
    ], 5],
    ['activity', [
        'timestamp',
        'local_timestamp',
        'num_sessions',
        'type',
        'event',
        'event_type',
    ], 6],
    ['course', [
        'name',
    ], 7],
    // ['field_description', [
    //     'developer_data_index',
    //     'field_definition_number',
    //     'fit_base_type_id',
    //     'field_name',
    //     'scale',
    //     'offset',
    //     'units',
    //     'fit_base_unit_id',
    //     'native_mesg_num',
    //     'native_field_num',
    // ], 1],
];

export default productMessageDefinitions;


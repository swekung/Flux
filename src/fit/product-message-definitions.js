//
// Product/App Message Definitions
//
// this is the subset of definitions of messages and message fields
// that the product/app fit file encoder whats to use

const product_message_definitions = [
    ['file_id', [
        'time_created',
        'manufacturer',
        'product',
        'number',
        'type',
    ]],
    ['field_description', [
        'developer_data_index',
        'field_definition_number',
        'fit_base_type_id',
        'field_name',
        'scale',
        'offset',
        'units',
        'fit_base_unit_id',
        'native_mesg_num',
        'native_field_num',
    ]],
    ['record', [
        'timestamp',
        // 'position_lat',
        // 'position_long',
        'distance',
        'compressed_speed_distance',
        'heart_rate',
        'altitude',
        'speed',
        'power',
        'grade',
        'cadence',
        'device_index',
        // 'total_hemoglobin_conc',
        // 'saturated_hemoglobin_percent',
    ]],
    ['event', [
        'timestamp',
        'event',
        'event_type',
        'event_group',
    ]],
    ['lap', [
        'timestamp',
        'start_time',
        'total_elapsed_time',
        'total_timer_time',
        'message_index',
        'event',
        'event_type',
    ]],
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
    ]],
    ['activity', [
        'timestamp',
        'local_timestamp',
        'num_sessions',
        'type',
        'event',
        'event_type',
    ]],
    ['course', [
        'name',
    ]],
];

export { product_message_definitions };


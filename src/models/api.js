import {
    equals, empty, exists,
    isArray, isObject, isString, isNumber,
    unwrap,
} from '../functions.js';

function Url(str) {
    let url = undefined;

    try {
        url = new URL(str);
    } catch(e) {
        console.error(`Can't convert ${str} to a valid url.`);
    } finally {
        return url;
    }
}

const BodyType = Object.freeze({
    Json: 'json',
    Text: 'text',
});

function Request() {
    const type = `[]`;
    function check() { return true; }
    function fallback() { return []; }
    function serialize() { return []; }

    return Object.freeze({
        type,
        check,
        fallback,
        serialize,
    });
}

function Response() {
    const type = `[]`;
    const bodyType = BodyType.Json;
    function check() { return true; }
    function fallback() { return []; }
    function deserialize() { return []; }

    return Object.freeze({
        type,
        check,
        fallback,
        deserialize,
    });
}


function Endpoint(args = {}) {
    const defaults = {
        name: "unnamed",
        options: {},
        debug: false,
    };
    const name = args.name ?? defaults.name;
    const options = args.options ?? defaults.options;
    const request = args.request ?? Request();
    const response = args.response ?? Response();
    const debug = args.debug ?? defaults.debug;
    const urlOption = Url(args.url ?? "");
    let url;

    if(urlOption) {
        url = urlOption;
    } else {
        console.error(`${name} endpoint configured with invalid or no url.`);
        return Object.freeze({
            send: ((x) => x)
        });
    }

    if(args.data) {
        options.body = request.serialize(args.data);
    }

    async function send() {
        let responseOption;
        try {
            responseOption = await fetch(url, options);
        } catch(err) {
            console.error(`Can't access ${name} endpoint.`);
        } finally {
            if(responseOption) {
                let resultOption;
                try {
                    resultOption = await responseOption[response.bodyType]();
                } catch(err) {
                    console.error(`Can't derive ${response.bodyType} from ${name} repsonse.`);
                    return response.fallback();
                } finally {
                    if(resultOption) {
                        if(debug) {
                            console.log(`${name} got response: `);
                            console.log(resultOption);
                        }
                        if(response.check(resultOption)) {
                            return response.deserialize(resultOption);
                        }
                        return response.fallback();
                    }
                }
            }
            console.error(`Response error from ${name} endpoint.`);
            return response.fallback();
        }
    }

    return Object.freeze({
        send,
    });
}


// API intervals.icu
const TimePeriod = {
    today: 'today',
    tomorrow: 'tomorrow',
    thisWeed: 'thisWeek',
    sevenDays: 'sevenDays',
};

function TimePeriodParams(period) {
    let oldest = ''; // 2022-11-29
    let newest = ''; // 2022-11-30

    const Oldest = (ymd) => {
        return `${ymd}-T00:00:00`;
    };

    const Newest = (ymd) => {
        return `${ymd}-T23:59:59`;
    };

    if(equals(TimePeriod.today, period)) {
        const now = new Date();
        oldest = Oldest(now.toJSON().split("T")[0]);
        newest = Newest(now.toJSON().split("T")[0]);
    }

    if(equals(TimePeriod.sevenDays, period)) {
        const now = new Date();
        const today = now.toJSON().split("T")[0];
        const sevenDaysFromNow = new Date(now + (7 * 24 * 60 * 60 * 1000));
        const sdfn = now.toJSON().split("T")[0];
        oldest = Oldest(today);
        newest = Newest(sdfn);
    }

    return Object.freeze({ oldest, newest });
}

function ScheduledEventsResponse() {
    const type = `response: [event: {id: Int, name: String, description: String}]`;
    const bodyType = BodyType.Json;

    function check(data) {
        if(!isArray(data)) {
            console.warn(`In ${type}, response must be an Array`);
            return false;
        }
        return data.every(function(event) {
            if(!isObject(event)) {
                console.warn(`In ${type}, event must be an Object`);
                return false;
            }
            if(!exists(event.id)) {
                console.warn(`In ${type}, id must be defined`);
                return false;
            }
            if(!exists(event.name)) {
                console.warn(`In ${type}, name must be defined`);
                return false;
            }
            if(!exists(event.description)) {
                console.warn(`In ${type}, description must be defined`);
                return false;
            }
            if(!isNumber(event.id)) {
                console.warn(`In ${type}, id must be a Number`);
                return false;
            }
            if(!isString(event.name)) {
                console.warn(`In ${type}, name must be a String`);
                return false;
            }
            if(!isString(event.description)) {
                console.warn(`In ${type}, description must be a String`);
                return false;
            }
            return true;
        });
    }

    function fallback() {
        return [];
    }

    function deserialize(data) {
        return data ?? fallback();
    }

    return Object.freeze({
        type,
        bodyType,
        check,
        fallback,
        deserialize,
    });
}

function DownloadWorkoutResponse() {
    const type = `response: String`;
    const bodyType = BodyType.Text;

    function check(data) {
        return true;
    }

    function fallback() {
        return "";
    }

    function deserialize(data) {
        return data ?? fallback();
    }

    return Object.freeze({
        type,
        bodyType,
        check,
        fallback,
        deserialize,
    });
}

function CreateActivityRequest() {
}

function CreateActivityResponse() {
}

// Access to fetch at 'https://intervals.icu/api/v1/athlete/i40544/events?oldest=2022-12-07-T00:00:00&newest=2022-12-07-T23:59:59' from origin 'http://localhost:1234' has been blocked by CORS policy: Request header field access-control-allow-headers is not allowed by Access-Control-Allow-Headers in preflight response.

function IntervalsIcuAPI(args = {}) {
    const urlBase = 'http://localhost:8080/api/v1';
    // const urlBase = 'https://intervals.icu/api/v1';

    let AthleteId = 'i40544';
    let USER = "API_KEY";
    let API_KEY = '3gdagg0c1pmmg3jlz2lyl5u75';
    let authHeader = new Headers();
    authHeader.set('Authorization', 'Basic ' + btoa(USER + ":" + API_KEY));

    function getWorkouts() {
        const athleteId = unwrap(AthleteId);
        return Endpoint({
            name: 'workouts',
            url: `${urlBase}/athlete/${athleteId}/workouts`,
        }).send;
    }

    function getScheduledEvents(args = {}) {
        const athleteId = unwrap(AthleteId);
        const { oldest, newest } = TimePeriodParams(args.for ?? TimePeriod.today);

        return Endpoint({
            name: 'events',
            url: `${urlBase}/athlete/${athleteId}/events?oldest=${oldest}&newest=${newest}`,
            options: {headers: authHeader},
            response: ScheduledEventsResponse(),
            debug: true,
        }).send();
    }

    function downloadWorkoutZwo(args = {}) {
        const athleteId = unwrap(AthleteId);
        const eventId = unwrap(args.eventId);

        return Endpoint({
            name: 'download',
            url: `${urlBase}/athlete/${athleteId}/events/${eventId}/download.zwo`,
            options: {headers: authHeader},
            response: DownloadWorkoutResponse(),
            debug: true,
        }).send();
    }

    async function getWoD() {
        const athleteId = unwrap(AthleteId);
        const period = TimePeriod.today;
        const eventsOption = await getScheduledEvents({period});

        if(!empty(eventsOption)) {
            const eventId = eventsOption[0].id;
            // let eventId = 9308647;
            const downloadOption = await downloadWorkoutZwo({eventId});
            // return downloadOption;
            return [];
        } else {
            return [];
        }
        return [];
    }

    function createActivity(args = {}) {
        const athleteId = unwrap(athleteId);
        const activity = unwrap(args.activity);

        return Endpoint({
            url: `${urlBase}/athlete/${athleteId}/activities`,
            options: { method: 'POST', headers: authHeader },
            data: activity,
            request: CreateActivityRequest(),
            response: CreateActivityResponse(),
        }).send();
    }

    return Object.freeze({
        getWorkouts,
        getScheduledEvents,
        downloadWorkoutZwo,
        getWoD,
        createActivity,
    });
}

const api = IntervalsIcuAPI();
// end API intervals.icu

export {
    Url,
    Endpoint,
    api,
}


//
// intervals.icu basic http api access
//
// fill in api_key from settings page
// NOTE: create activity uses a fit.mock()

import {
    equals, empty, exists,
    isArray, isObject, isString, isNumber,
    unwrap,
} from '../functions.js';
import { mock } from '../fit/fit.js';
import { Url, BodyType, Res, Req, Endpoint,  } from './common.js';

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
        // check if valid .zwo
        return true;
    }

    function fallback() {
        return [""];
    }

    function deserialize(data) {
        return [data] ?? fallback();
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
    const type = `request: FromData{file: Binary, name: Option<String>, description: Option<String>}`;
    const bodyType = BodyType.FormData;

    function check(data) {
        return true;
    }

    function serialize(data) {
        // file: Binary, name: Option<String>, description: Option<String>
        const formData = new FormData();
        formData.append("file", mock());
        formData.append("name", "Test upload name 1");
        // formData.append("description", "Test description.");
        return formData;
    }

    return Object.freeze({
        type,
        bodyType,
        check,
        serialize,
    });
}

function CreateActivityResponse() {
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

function IntervalsApi(args = {}) {
    const defaults = {
        baseUrl: 'http://localhost:8080/api/v1',
    };

    const baseUrl = args.baseUrl ?? defaults.baseUrl;;

    let AthleteId = args.athleteId ?? '';
    let USER = 'API_KEY';
    let API_KEY = args.api_key ?? '';
    let authHeader = new Headers();
    authHeader.set('Authorization', 'Basic ' + btoa(USER + ':' + API_KEY));

    function getScheduledEvents(args = {}) {
        const athleteId = unwrap(AthleteId);
        const { oldest, newest } = TimePeriodParams(args.for ?? TimePeriod.today);

        return Endpoint({
            name: 'events',
            url: `${baseUrl}/athlete/${athleteId}/events?oldest=${oldest}&newest=${newest}`,
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
            url: `${baseUrl}/athlete/${athleteId}/events/${eventId}/download.zwo`,
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
            const downloadOption = await downloadWorkoutZwo({eventId});
            return downloadOption;
        } else {
            return [];
        }
        return [];
    }

    function createActivity(args = {}) {
        const athleteId = unwrap(AthleteId);
        const activity = unwrap(args.activity);

        return Endpoint({
            name: "activity",
            url: `${baseUrl}/athlete/${athleteId}/activities`,
            options: { method: 'POST', headers: authHeader },
            data: activity,
            request: CreateActivityRequest(),
            response: CreateActivityResponse(),
        }).send();
    }

    return Object.freeze({
        getScheduledEvents,
        downloadWorkoutZwo,
        getWoD,
        createActivity,
    });
}

export {
    IntervalsApi,
}


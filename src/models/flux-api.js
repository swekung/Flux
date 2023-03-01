import { expect } from '../functions.js';
import { Url, BodyType, Res, Req, TextResponse, Endpoint } from './common.js';


function StravaTokenResponse() {
    return TextResponse();
}

function Strava(args = {}) {
    const baseUrl = expect(args.baseUrl, 'Strava API needs base URL.');

    function authorizeUri() {
        return `${baseUrl}/api/v1/oauth/strava/authorize`;
    }

    function deauthorizeUri() {
        return `${baseUrl}/api/v1/oauth/strava/deauthorize`;
    }

    function storeToken(token) {
        console.log(token);
    }

    async function onRedirect() {
        const params = (new URL(document.location)).searchParams;
        const code   = params.get('code');
        const scope  = params.get('scope');
        const error  = params.get('error');

        console.log({code, scope, error});

        if(code && scope && !error) {
            const res = await Endpoint({
                name: 'strava-exchange',
                url: `${baseUrl}/api/v1/oauth/strava/exchange?code=${code}`,
                options: {method: 'POST'},
                response: StravaTokenResponse(),
                debug: true
            }).send();

            storeToken(res);
        }
    }

    function UploadRequest() {
        const type = `request: FromData{file: Binary, name: Option<String>, data_type: Option<String>}`;
        const bodyType = BodyType.FormData;

        function check(data) {
            return true;
        }

        function serialize(data) {
            // file: Binary, name: Option<String>, data_type: Option<String>
            return Object.keys(data).reduce(function(formData, key) {
                formData.append(key, data[key]);
                return formData;
            }, new FormData());
        }

        return Object.freeze({
            type,
            bodyType,
            check,
            serialize,
        });
    }

    function uploads(args = {}) {
        const file = unwrap(args.activity);
        const name = args.name ?? "Flux Ride";
        const data_type = "fit";

        return Endpoint({
            name: "strava-upload",
            url: `${baseUrl}/strava/uploads`,
            options: { method: 'POST' },
            data: {name, data_type, file},
            request: UploadRequest(),
        }).send();
    }

    return Object.freeze({
        authorizeUri,
        deauthorizeUri,
        onRedirect,
        uploads,
    });
}

function FluxApi(args = {}) {
    const defaults = {};

    const baseUrl = args.baseUrl ?? defaults.baseUrl;;
    const athleteId = 'i12345';

    let authHeader = new Headers();

    function getWoD() {
        return [];
        return Endpoint({
            name: 'flux-wod',
            url: `${baseUrl}/athlete/${athleteId}/wod`
        }).send();
    }

    function getClientId() {}

    function createActivity(args = {}) {}

    return Object.freeze({
        getWoD,
        createActivity,
    });
}

export {
    Strava,
    FluxApi,
}

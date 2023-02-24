import { Strava, FluxApi } from './flux-api.js';
import { WebAuthN } from './webauthn.js';
import { IntervalsApi } from './intervals-api.js';

// console.log(`:env ${process.env.NODE_ENV} :api ${process.env.API_URI}`);

const baseUrl = process.env.API_URI;

const strava = Strava({baseUrl});
const fluxApi = FluxApi({baseUrl});
const webAuthN = WebAuthN({baseUrl});
webAuthN.start();
// const intervalsApi = IntervalsApi({baseUrl});

export {
    webAuthN,
    strava,
    fluxApi,
    // intervalsApi,
}


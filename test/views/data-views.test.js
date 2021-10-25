import { JSDOM } from 'jsdom';
import { DataView, TotalTime, PowerView } from '../../src/views/data-views.js';
import { xf, rand, avg } from '../../src/functions.js';


const dom = new JSDOM();

function onDataSet(value, db) {
    db.data = value;
}

function onCountSet(value, db) {
    db.count = value;
}

function onTotalTimeSet(value, db) {
    db.watch = {
        timer: {
            timerTime: value,
        },
        workout: {
            lapTime: value,
        }
    };
}

function onIntervalTimeSet(value, db) {
    db.watch = {
        timer: {
            timerTime: value,
        },
        workout: {
            lapTime: value,
        }
    };
}

function onWatchSet(value, db) {
    db.watch = value;
}

function onPowerSet(value, db) {
    db.power = value;
}

function onPowerSmoothingSet(value, db) {
    db.powerSmoothing = value;
}

let db = {
    data: 0,
    count: 0,
    watch: {
        timer: {
            timerTime: 0,
        },
        workout: {
            lapTime: 0,
        }
    },
    power: 0,
    powerSmoothing: 0,
};

xf.create(db);
xf.reg('data-set', onDataSet);
xf.reg('count-set', onCountSet);
xf.reg('timer-time-set', onTotalTimeSet);
xf.reg('interval-time-set', onIntervalTimeSet);
xf.reg('power-set', onPowerSet);
xf.reg('power-smoothing-set', onPowerSmoothingSet);



describe('DataView', () => {

    test('data-view', () => {
        // minimal DataView element:
        // - prop can be passed through html
        window.document.body.innerHTML = `<data-view id="data" prop="db:data">--</data-view>`;

        expect(document.querySelector('#data').textContent).toBe('--');

        xf.dispatch('data-set', 0);
        expect(document.querySelector('#data').textContent).toBe('0');

        xf.dispatch('data-set', 1);
        expect(document.querySelector('#data').textContent).toBe('1');
    });

});

describe('CountView', () => {

    class CountView extends DataView {
        getDefaults() {
            return {
                prop: 'db:count',
            };
        }
    }

    customElements.define('count-view', CountView);

    test('count-view', () => {
        // minimal DataView element:
        // - prop can be defined in custom element js code
        // - CountView inherits DataView and overwrites getDefaults() to set a value for prop

        window.document.body.innerHTML = `<count-view id="count">--</count-view>`;

        expect(document.querySelector('#count').textContent).toBe('--');

        xf.dispatch('count-set', 0);
        expect(document.querySelector('#count').textContent).toBe('0');

        xf.dispatch('count-set', 1);
        expect(document.querySelector('#count').textContent).toBe('1');
    });

});

describe('TimerTime', () => {

    test('timer-time', () => {
        window.document.body.innerHTML = `<timer-time id="timer-time">--:--:--</timer-time>`;

        expect(document.querySelector('#timer-time').textContent).toBe('--:--:--');

        xf.dispatch('timer-time-set', 0);
        expect(document.querySelector('#timer-time').textContent).toBe('00:00:00');

        xf.dispatch('timer-time-set', 1);
        expect(document.querySelector('#timer-time').textContent).toBe('00:00:01');

        xf.dispatch('timer-time-set', 60);
        expect(document.querySelector('#timer-time').textContent).toBe('00:01:00');

        xf.dispatch('timer-time-set', 60*60);
        expect(document.querySelector('#timer-time').textContent).toBe('01:00:00');
    });
});

describe('IntervalTime', () => {

    test('interval-time', () => {
        window.document.body.innerHTML = `<interval-time id="interval-time">--:--</interval-time>`;

        expect(document.querySelector('#interval-time').textContent).toBe('--:--');

        xf.dispatch('interval-time-set', 0);
        expect(document.querySelector('#interval-time').textContent).toBe('00:00');

        xf.dispatch('interval-time-set', 1);
        expect(document.querySelector('#interval-time').textContent).toBe('00:01');

        xf.dispatch('interval-time-set', 60);
        expect(document.querySelector('#interval-time').textContent).toBe('01:00');

        xf.dispatch('interval-time-set', 60*60);
        expect(document.querySelector('#interval-time').textContent).toBe('01:00:00');
    });
});

describe('PowerView', () => {

    test('power-view', () => {
        window.document.body.innerHTML = `<power-view id="power-view">--</power-view>`;

        expect(document.querySelector('#power-view').textContent).toBe('--');

        xf.dispatch('power-set', 0);
        expect(document.querySelector('#power-view').textContent).toBe('0');

        xf.dispatch('power-set', 84);
        expect(document.querySelector('#power-view').textContent).toBe('84');

        xf.dispatch('power-set', 184);
        expect(document.querySelector('#power-view').textContent).toBe('184');
    });

    jest.useFakeTimers();

    test.skip('power-view with smoothing 1 second', () => {
        //
        // find a way to mock or Date.now()
        // or pass it in a testable way in the component
        //

        window.document.body.innerHTML = `<power-view id="power-view">--</power-view>`;

        let startTime = 1632833074934;

        function now(startTime, i) {
            return function() {
                return startTime += i;
            };
        }

        Date.now = jest.fn(() => startTime);

        let pvi = 0;
        const pv = [100, 102, 103, 104, 118, 117, 110, 103];
        const apv1 = avg(pv.slice(0,4));
        const apv2 = avg(pv.slice(4,8));

        xf.dispatch('power-smoothing-set', 1000);

        function onInterval() {
            xf.dispatch('power-set', pv[pvi]);
            pvi++;
        }

        expect(document.querySelector('#power-view').textContent).toBe('--');

        Date.now = jest.fn(() => startTime + (250 * 1));
        jest.advanceTimersByTime((250 * 1));
        onInterval();

        Date.now = jest.fn(() => startTime + (250 * 2));
        jest.advanceTimersByTime((250 * 2));
        onInterval();

        Date.now = jest.fn(() => startTime + (250 * 3));
        jest.advanceTimersByTime((250 * 3));
        onInterval();

        Date.now = jest.fn(() => startTime + (250 * 4));
        // jest.advanceTimersByTime((250 * 4));
        jest.advanceTimersByTime((250 * 4) + 50);
        onInterval();

        expect(document.querySelector('#power-view').textContent).toBe(`${apv1}`);

        Date.now = jest.fn(() => startTime + (250 * 5));
        jest.advanceTimersByTime((250 * 5));
        onInterval();

        expect(document.querySelector('#power-view').textContent).toBe(`${apv1}`);

    });
});


// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });


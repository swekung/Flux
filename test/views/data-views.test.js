/**
 * @jest-environment jsdom
 */

import { JSDOM } from 'jsdom';
import { DataView, TotalTime, PowerValue } from '../../src/views/data-views.js';
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

function onWorkoutSet(value, db) {
    db.workout = value;
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
    powerSmoothing: 1,
    workout: {
        name: 'free ride',
    }
};

xf.create(db);
xf.reg('data-set', onDataSet);
xf.reg('count-set', onCountSet);
xf.reg('timer-time-set', onTotalTimeSet);
xf.reg('interval-time-set', onIntervalTimeSet);
xf.reg('power-set', onPowerSet);
xf.reg('power-smoothing-set', onPowerSmoothingSet);
xf.reg('workout-set', onWorkoutSet);



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

describe('WorkoutName', () => {

    test('workout-name', () => {
        window.document.body.innerHTML = `<workout-name id="workout-name"></workout-name>`;

        expect(document.querySelector('#workout-name').textContent).toBe('');

        xf.dispatch('workout-set', {name: 'Dijon'});
        expect(document.querySelector('#workout-name').textContent).toBe('Dijon');

        xf.dispatch('workout-set', {name: 'Maple'});
        expect(document.querySelector('#workout-name').textContent).toBe('Maple');
    });

});

describe('PowerValue', () => {

    test('power-value', () => {
        window.document.body.innerHTML = `<power-value id="power-value">--</power-value>`;

        expect(document.querySelector('#power-value').textContent).toBe('--');

        xf.dispatch('power-set', 0);
        expect(document.querySelector('#power-value').textContent).toBe('0');

        xf.dispatch('power-set', 84);
        expect(document.querySelector('#power-value').textContent).toBe('84');

        xf.dispatch('power-set', 184);
        expect(document.querySelector('#power-value').textContent).toBe('184');
    });

    test('power-value with 1 second smoothing on 4Hz power data', () => {
        window.document.body.innerHTML = `<power-value id="power-value">--</power-value>`;

        let i      = 0;
        const data = [100, 102, 103, 104,  118, 117, 110, 103,  103, 104, 105, 106];
        const avg1 = Math.floor(avg(data.slice(0,4)));
        const avg2 = Math.floor(avg(data.slice(4,8)));
        const avg3 = Math.floor(avg(data.slice(8,12)));

        xf.dispatch('power-smoothing-set', 4);

        function onInterval() {
            xf.dispatch('power-set', data[i]);
            i++;
        }

        expect(document.querySelector('#power-value').textContent).toBe('--');

        onInterval();
        onInterval();
        onInterval();
        onInterval();

        expect(document.querySelector('#power-value').textContent).toBe(`${avg1}`);

        onInterval();
        onInterval();
        onInterval();
        onInterval();

        expect(document.querySelector('#power-value').textContent).toBe(`${avg2}`);

        onInterval();
        onInterval();
        onInterval();
        onInterval();

        expect(document.querySelector('#power-value').textContent).toBe(`${avg3}`);
    });
});

describe('PowerAvg', () => {

    test('power-avg', () => {
        window.document.body.innerHTML = `<power-avg id="power-avg">--</power-avg>`;

        let i      = 0;
        const data = [100, 102, 103, 104,  118, 117, 110, 103,  103, 104,  107, 108];

        function dataAvg(start = 0, end = data.length) {
            return `${Math.floor(avg(data.slice(start, end)))}`;
        }

        xf.dispatch('power-smoothing-set', 4);

        function onInterval() {
            xf.dispatch('power-set', data[i]);
            i++;
        }

        expect(document.querySelector('#power-avg').textContent).toBe('--');

        onInterval();
        expect(document.querySelector('#power-avg').textContent).toBe(`${data[0]}`);

        onInterval();
        expect(document.querySelector('#power-avg').textContent).toBe(dataAvg(0,2));

        onInterval();
        expect(document.querySelector('#power-avg').textContent).toBe(dataAvg(0,3));

        onInterval();
        expect(document.querySelector('#power-avg').textContent).toBe(dataAvg(0,4));

        onInterval();
        onInterval();
        onInterval();
        onInterval();
        expect(document.querySelector('#power-avg').textContent).toBe(dataAvg(0,8));

        onInterval();
        onInterval();
        onInterval();
        onInterval();
        expect(document.querySelector('#power-avg').textContent).toBe(dataAvg(0,12));
    });
});




// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });


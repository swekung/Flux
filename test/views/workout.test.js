/**
 * @jest-environment jsdom
 */

import { first, last } from '../src/functions.js';
import { zwo } from '../src/workouts/zwo.js';

import { JSDOM } from 'jsdom';

describe('htmlMapper', () => {
    test('intervalsToHtml', () => {
        const input = {
            head: {
                author: 'Flux',
                name: "Test Workout",
                category: "Sweet Spot",
                subcategory: "",
                sportType: "bike",
                description: "Description of test workout",
            },
            body: [
                {element: 'SteadyState', Duration: 10, Power: 0.50},
                {element: 'SteadyState', Duration: 15, Power: 0.90,},
                {element: 'SteadyState', Duration: 10, Power: 0.70, Slope: 2.1, Cadence: 90},
                {element: 'SteadyState', Duration: 15, Power: 0.92, Cadence: 80},
                {element: 'IntervalsT',  Repeat: 2, OnDuration: 40, OffDuration: 20, OnPower: 1.21, OffPower: 0.7, OnSlope: 4.8, OffSlope: 0},
                {element: 'SteadyState', Duration: 10, Cadence: 90},
            ],
        };

        const expected = `
            <div class="graph--bar zone-two">
                <div class="graph--info">
                         <div class="graph--info--power">${120}${'W'}</div>
                         <div class="graph--info--time">${10}</div>
                </div>
            </div>
        `;

        let res = zwo.intervalsToHtml(input);

        expect(removeWhiteSpace(res)).toEqual(removeWhiteSpace(expected));
    });
});

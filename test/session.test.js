/**
 * @jest-environment jsdom
 */

import { first, last, xf } from '../src/functions.js';
import { Watch } from '../src/watch/watch.js';
import { Session } from '../src/session.js';

import indexedDB from 'fake-indexeddb';

window.indexedDB = indexedDB;

const workoutJS = {
    id: "{1ec20f99-b3d8-4eb9-c000-be96e947897a}",
    name: "Test Workout",
    description: "Description of test workout.",
    duration: 1, // 60s
    effort: "Sweet Spot",
    intervals: [
        {duration: 10, steps: [{duration: 3, power: 0.50},
                               {duration: 3, power: 0.60},
                               {duration: 4, power: 0.70},]},
        {duration: 15, steps: [{duration: 15, power: 0.90}]},
        {duration: 10, steps: [{duration: 10, power: 0.70}]},
        {duration: 15, steps: [{duration: 15, power: 0.92}]},
        {duration: 10, steps: [{duration: 10, power: 0.50}]},
    ],
};

describe('Session', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

    test('Session restore', () => {
        expect(0).toBe(0);
    });

    test('Session backup', () => {
        expect(0).toBe(0);
    });
});

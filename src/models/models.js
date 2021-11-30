import { xf, exists, empty, equals,
         first, second, last } from '../functions.js';

import { inRange, fixInRange } from '../utils.js';

import { LocalStorageItem } from '../storage/local-storage.js';

class Model {
    constructor(args) {
        this.init(args);
        this.prop = args.prop;
        this.default = args.default || this.defaultValue();
        this.prev = args.default;
        this.state = args.default || this.defaultValue();
        this.update = args.update || this.defaultUpdate;
        this.read = args.read || this.defaultRead;
        this.isValid = args.isValid || this.defaultIsValid;
        this.onInvalid = args.onInvalid || this.defaultOnInvalid;
        this.storage = this.defaultStorage();
        this.postInit(args);
    }
    init() { return; }
    postInit() { return; }
    defaultValue() { return ''; }
    defaultIsValid(value) { return exists(value); }
    defaultUpdate(value) {
        const self = this;
        if(self.isValid(value)) {
            self.state = value;
            self.storage.backup(value);
            return value;
        } else {
            self.defaultOnInvalid(value);
            self.storage.backup(self.default);
            self.state = self.default;
            return self.default;
        }
    }
    defaultRead() {
        return self.state;
    }
    defaultOnInvalid(x) {
        const self = this;
        console.error(`Trying to update with invalid ${self.prop}. ${typeof x}`, x);
    }
    defaultStorage() {
        const self = this;
        return {backup: ((x)=>x),
                restore: ((_)=> self.default)};
    }
    backup(value) {
        const self = this;
        self.storage.backup(value);
    }
    restore() {
        return self.storage.restore();
    }
}

class Power extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 2500;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class HeartRate extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 255;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Cadence extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 255;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Speed extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 120;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return (Number.isInteger(value) || Number.isFloat(value)) &&
            inRange(self.min, self.max, value);
    }
}

class Distance extends Model {
    postInit(args) {}
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) || Number.isFloat(value);
    }
}

class Sources extends Model {
    postInit(args) {
        const self = this;
        self.state = self.default;
        xf.sub('db:sources', value => self.state = value);
    }
    defaultSet(target, sources) {
        return Object.assign(target, sources);
    }
    isSource(value, id) {
        const self = this;
        if(exists(self.state[value])) {
            return equals(self.state[value], id);
        }
        return false;
    }
    defaultValue() {
        const sources = {
            power: 'ble:controllable',
            cadence: 'ble:controllable',
            speed: 'ble:controllable',
            control: 'ble:controllable',
            heartRate: 'ble:hrm'
        };
        return sources;
    }
}

class Target extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 100;
        this.step = args.step || 1;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    parse(value) { return parseInt(value); }
    set(value) {
        const self = this;
        const x = fixInRange(self.min, self.max, self.parse(value));
        return self.update(x);
    }
    inc(value) {
        const self = this;
        const x = fixInRange(self.min, self.max, self.parse(value + self.step));
        return self.update(x);
    }
    dec(value) {
        const self = this;
        const x = fixInRange(self.min, self.max, self.parse(value - self.step));
        return self.update(x);
    }
}

class PowerTarget extends Target {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 800;
        this.step = args.step || 10;
    }
}

class ResistanceTarget extends Target {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 100;
        this.step = args.step || 10;
    }
}

class SlopeTarget extends Target {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 45;
        this.step = args.step || 0.5;
    }
    defaultIsValid(value) {
        const self = this;
        return Number.isFloat(value) && inRange(self.min, self.max, value);
    }
    parse(value) { return parseFloat(value); }
}

class Mode extends Model {
    postInit(args) {
        this.values = ['erg', 'resistance', 'slope'];
    }
    defaultValue() { return 'erg'; }
    defaultIsValid(value) { return this.values.includes(value); }
}

class Page extends Model {
    postInit(args) {
        this.values = ['settings', 'home', 'workouts'];
    }
    defaultValue() { return 'home'; }
    defaultIsValid(value) { return this.values.includes(value); }
}

class FTP extends Model {
    postInit(args) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
            parse: parseInt,
        };
        self.min = args.min || 0;
        self.max = args.max || 500;
        self.storage = args.storage(storageModel);
        self.zones = args.zones || self.defaultZones();
        self.percentages = args.percentages || self.defaultPercentages();
    }
    defaultValue() { return 200; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    defaultZones() {
        return ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    }
    defaultPercentages() {
        return {'one': 0.55, 'two': 0.76, 'three': 0.88, 'four': 0.95, 'five': 1.06, 'six': 1.20};
    }
    powerToZone(value, ftp, zones) {
        const self = this;
        if(!exists(ftp)) ftp = self.default;
        if(!exists(zones)) zones = self.zones;

        let name = zones[0];
        if(value < (ftp * self.percentages.one)) {
            name = zones[0];
        } else if(value < (ftp * self.percentages.two)) {
            name = zones[1];
        } else if(value < (ftp * self.percentages.three)) {
            name = zones[2];
        } else if(value < (ftp * self.percentages.four)) {
            name = zones[3];
        } else if(value < (ftp * self.percentages.five)) {
            name = zones[4];
        } else if (value < (ftp * self.percentages.six)) {
            name = zones[5];
        } else {
            name = zones[6];
        }
        return {name: name};
    }
}

class Weight extends Model {
    postInit(args) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
            parse: parseInt,
        };
        self.min = args.min || 0;
        self.max = args.max || 500;
        self.storage = new args.storage(storageModel);
    }
    defaultValue() { return 75; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Theme extends Model {
    postInit(args) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
        };
        self.storage = new args.storage(storageModel);
        self.values = ['dark', 'light'];
    }
    defaultValue() { return 'dark'; }
    defaultIsValid(value) { return this.values.includes(value); }
    switch(value) {
        const self = this;
        let theme = self.default;
        if(equals(value, first(self.values))) {
            theme = second(self.values);
        }
        if(equals(value, second(self.values))) {
            theme = first(self.values);
        }
        return self.update(theme);
    }
}

class Measurement extends Model {
    postInit(args) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
        };
        self.storage = new args.storage(storageModel);
        self.values = ['metric', 'imperial'];
    }
    defaultValue() { return 'metric'; }
    defaultIsValid(value) { return this.values.includes(value); }
    switch(value) {
        const self = this;
        let measurement = self.default;
        if(equals(value, first(self.values))) {
            measurement = second(self.values);
        }
        if(equals(value, second(self.values))) {
            measurement = first(self.values);
        }
        return self.update(measurement);
    }
}

const power = new Power({prop: 'power'});
const heartRate = new HeartRate({prop: 'heartRate'});
const cadence = new Cadence({prop: 'cadence'});
const speed = new Speed({prop: 'speed'});
const distance = new Distance({prop: 'distance'});
const sources = new Sources({prop: 'sources'});

const powerTarget = new PowerTarget({prop: 'powerTarget'});
const resistanceTarget = new ResistanceTarget({prop: 'resistanceTarget'});
const slopeTarget = new SlopeTarget({prop: 'slopeTarget'});
const mode = new Mode({prop: 'mode'});
const page = new Page({prop: 'page'});

const ftp = new FTP({prop: 'ftp', storage: LocalStorageItem});
const weight = new Weight({prop: 'weight', storage: LocalStorageItem});
const theme = new Theme({prop: 'theme', storage: LocalStorageItem});
const measurement = new Measurement({prop: 'measurement', storage: LocalStorageItem});



const models = {
    power,
    heartRate,
    cadence,
    speed,
    sources,
    powerTarget,
    resistanceTarget,
    slopeTarget,
    mode,
    page,
    ftp,
    weight,
    theme,
    measurement,
};

export { models };

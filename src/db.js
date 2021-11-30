import { xf, exists, equals } from './functions.js';
import { models } from './models/models.js';
import { App } from './session.js';


let db = {
    // Data Screen
    power:     models.power.default,
    heartRate: models.heartRate.default,
    cadence:   models.cadence.default,
    speed:     models.speed.default,
    distance:  0,
    sources:   models.sources.default,

    // Watch
    watch: {},

    // Targets
    powerTarget:      models.powerTarget.default,
    resistanceTarget: models.resistanceTarget.default,
    slopeTarget:      models.slopeTarget.default,

    mode: models.mode.default,
    page: models.page.default,

    // Profile
    ftp:         models.ftp.default,
    weight:      models.weight.default,
    theme:       models.theme.default,
    measurement: models.measurement.default,

    // Workouts
    workouts: [],
    workout:  {},
};

xf.create(db);

// Data Screen
xf.reg(models.heartRate.prop, (heartRate, db) => {
    db.heartRate = heartRate;
});

xf.reg(models.power.prop, (power, db) => {
    db.power = power;
});

xf.reg(models.cadence.prop, (cadence, db) => {
    db.cadence = cadence;
});

xf.reg(models.speed.prop, (speed, db) => {
    db.speed = speed;
});

xf.reg(models.sources.prop, (sources, db) => {
    db.sources = models.sources.set(db.sources, sources);
    console.log(db.sources);
});

// Pages
xf.reg('ui:page-set', (page, db) => {
    db.page = models.page.set(page);
});

// Modes
xf.reg('ui:mode-set', (mode, db) => {
    db.mode = models.mode.set(mode);

    if(equals(mode, 'erg'))        xf.dispatch(`ui:power-target-set`, db.powerTarget);
    if(equals(mode, 'resistance')) xf.dispatch(`ui:resistance-target-set`, db.resistanceTarget);
    if(equals(mode, 'slope'))      xf.dispatch(`ui:slope-target-set`, db.slopeTarget);
});

// Targets
xf.reg('ui:power-target-set', (powerTarget, db) => {
    db.powerTarget = models.powerTarget.set(parseInt(powerTarget * db.ftp));
});
xf.reg('ui:power-target-inc', (_, db) => {
    db.powerTarget = models.powerTarget.inc(db.powerTarget);
});
xf.reg(`ui:power-target-dec`, (_, db) => {
    db.powerTarget = models.powerTarget.dec(db.powerTarget);
});

xf.reg('ui:resistance-target-set', (resistanceTarget, db) => {
    db.resistanceTarget = models.resistanceTarget.set(resistanceTarget);
});
xf.reg('ui:resistance-target-inc', (_, db) => {
    db.resistanceTarget = models.resistanceTarget.inc(db.resistanceTarget);
});
xf.reg(`ui:resistance-target-dec`, (_, db) => {
    db.resistanceTarget = models.resistanceTarget.dec(db.resistanceTarget);
});

xf.reg('ui:slope-target-set', (slopeTarget, db) => {
    db.slopeTarget = models.slopeTarget.set(slopeTarget);
});
xf.reg('ui:slope-target-inc', (_, db) => {
    db.slopeTarget = models.slopeTarget.inc(db.slopeTarget);
});
xf.reg(`ui:slope-target-dec`, (_, db) => {
    db.slopeTarget = models.slopeTarget.dec(db.slopeTarget);
});

// Profile
xf.reg('ui:ftp-set', (ftp, db) => {
    db.ftp = models.ftp.update(ftp);
});
xf.reg('ui:weight-set', (weight, db) => {
    db.weight = models.weight.update(weight);
});
xf.reg('ui:theme-switch', (_, db) => {
    db.theme = models.theme.switch(db.theme);
});
xf.reg('ui:measurement-switch', (_, db) => {
    db.measurement = models.measurement.switch(db.measurement);
});

const app = App();

xf.reg('lock:beforeunload', async (e, db) => {
    await app.backup(db);
});

xf.reg('lock:release', async (e, db) => {
    await app.backup(db);
});

// App
xf.reg('app:start', async function(_, db) {

    db.ftp = models.ftp.restore();
    db.weight = models.weight.restore();
    db.theme = models.theme.restore();
    db.measurement = models.measurement.restore();

    await app.init(db);


});

function start () {
    console.log('start db');
}

start();

export { db };


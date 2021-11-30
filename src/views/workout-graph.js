import { xf, exists, equals } from '../functions.js';
import { formatTime } from '../utils.js';
import { models } from '../models/models.js';


function intervalsToHtml(intervals) {

    let ftp = 240;

    function target(type, value, unit) {
        if(exists(value)) {
            return `<div class="graph--info--${type}">${value}${unit}</div>`;
        }
        return '';
    }

    function graphBar(args = {}) {
        const { duration, power, slope, cadence, zone } = args;

        const powerTarget   = target('power', power, 'W');
        const cadenceTarget = target('cadence', cadence, 'rpm');
        const slopeTarget   = target('slope', slope, '%');

        return `
            <div class="graph--bar zone-${zone}">
                <div class="graph--info">
                         ${powerTarget}
                         ${cadenceTarget}
                         ${slopeTarget}
                         <div class="graph--info--time">${duration}</div>
                </div>
            </div>`;
    }

    return graphBar({duration: 10, power: 120, zone: 'two'});
}

function scale(value, max = 100) {
    return 100 * (value/max);
}

function intervalsToGraph(intervals, ftp, graphHeight = 118) {
    let scaleMax = ftp * 1.6 * (90 / graphHeight);
    return intervals.reduce( (acc, interval) => {
        let width = (interval.duration) < 1 ? 1 : parseInt(Math.round(interval.duration)); // ?
        let stepsCount = interval.steps.length;
        return acc + interval.steps.reduce((a, step) => {
            const power = parseInt(ftp * step.power);
            const width = 100 / stepsCount;
            const height = scale((power === 0) ? 80 : power, scaleMax);
            const zone = (models.ftp.powerToZone(power, ftp)).name;
            const infoPower = power === 0 ? 'Free ride' : power;
            const infoPowerUnit = power === 0 ? '' : 'W';
            const infoTime = formatTime({value: step.duration, format: 'mm:ss'});

            return a +
                `<div class="graph--bar zone-${zone}" style="height: ${height}%; width: ${width}%">
                     <div class="graph--info">
                         <div class="graph--info--power">${infoPower}${infoPowerUnit}</div>
                         <div class="graph--info--time">${infoTime}<span></span></div>
                     </div>
                </div>`;
        }, `<div class="graph--bar-group" style="width: ${width}px">`) + `</div>`;

    }, ``);
}

class WorkoutGraph extends HTMLElement {
    constructor() {
        super();
        this.dom = {};
        this.workout = {name: ''};
        this.lapIndex = 0;
        this.ftp = 0;
        this.minHeight = 30;
    }
    connectedCallback() {
        this.width = this.getWidth();
        this.height = this.getHeight();

        xf.sub('db:workout', this.onWorkout.bind(this));
        xf.sub(`db:watch`, this.onWatch.bind(this));
        xf.sub(`db:ftp`, this.onFTP.bind(this));

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    disconnectedCallback() {
        window.removeEventListener(`db:workout`, this.onWorkout);
        window.removeEventListener(`db:watch`, this.onWatch);
        window.removeEventListener(`db:${this.metric}`, this.onMetric);
        window.removeEventListener('resize', this.onWindowResize);
    }
    getWidth() {
        return this.getBoundingClientRect().width;
    }
    getHeight() {
        return this.getBoundingClientRect().height;
    }
    onWindowResize(e) {
        let height = this.getHeight();

        if(height < this.minHeight) {
            return;
        }

        this.width = this.getWidth();
        this.height = height;

        this.render();
    }
    onWatch(watch) {
        if(!equals(watch.workout.lapIndex, this.lapIndex)) {
            this.lapIndex = watch.workout.lapIndex;
            this.progress();
        }
    }
    onWorkout(workout) {
        if(!equals(workout.name, this.workout.name)) {
            this.workout = workout;
            this.render();
            this.progress();
        }
    }
    onFTP(ftp) {
        if(!equals(this.ftp, ftp)) {
            this.ftp = ftp;
            if(exists(this.workout.intervals)) this.render();
        }
    }
    progress() {
        const rect = this.dom.intervals[this.lapIndex].getBoundingClientRect();
        this.dom.active.style.left  = `${rect.left - this.getBoundingClientRect().left}px`;
        this.dom.active.style.width = `${rect.width}px`;
        this.dom.active.style.height = `${this.getBoundingClientRect().height}px`;

    }
    render() {
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        this.innerHTML = progress + intervalsToGraph(this.workout.intervals, this.ftp, this.height);

        this.dom.progress  = this.querySelector('#progress');
        this.dom.active    = this.querySelector('#progress-active');
        this.dom.intervals = this.querySelectorAll('.graph--bar-group');
        this.dom.steps     = this.querySelectorAll('.graph--bar');

        this.progress();
    }
}

customElements.define('workout-graph', WorkoutGraph);

export { WorkoutGraph };

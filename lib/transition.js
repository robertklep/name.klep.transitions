const Timer            = require('./timer')
const { EventEmitter } = require('events');

module.exports = class Transition extends EventEmitter {

  constructor({ name, startValue, endValue, duration, step } = {}, toFixed = 2) {
    super();
    this.name       = name;
    this.startValue = startValue;
    this.endValue   = endValue;
    this.duration   = duration * 1000;
    this.step       = step     * 1000;
    this.toFixed    = toFixed;
    this.stopped    = false;

    // Determine increment for each step.
    this.increment = ((endValue - startValue) * step) / duration;

    // Pre-bind methods.
    this.onTick = this.onTick.bind(this);
    this.onDone = this.onDone.bind(this);
  }

  format(value) {
    return Number(value.toFixed(this.toFixed));
  }

  start() {
    this.value = this.startValue;
    this.emit('start', this.format(this.value));
    this.timer = new Timer(this.duration, this.step);
    this.timer.on('tick', this.onTick).on('done', this.onDone).start();
    return this;
  }

  onTick(ms) {
    this.emit('step', this.format(this.value));
    this.value += this.increment;
  }

  onDone() {
    this.end();
  }

  end() {
    const value = this.format(this.endValue);
    this.emit('step', value);
    this.emit('end',  value);
  }

  stop() {
    this.timer.stop();
    this.stopped = true;
    this.emit('stop', this.format(this.value));
  }

  hasStopped() {
    return this.stopped;
  }
};

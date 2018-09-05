const { EventEmitter } = require('events');

module.exports = class Timer extends EventEmitter {

  constructor(duration, interval) {
    super();
    this.duration = duration;
    this.interval = interval;
    this.step     = this.step.bind(this);
    this.timer    = null;
  }

  start() {
    this.started = Date.now();
    this.emit('start', 0);
    return this.step();
  }

  step() {
    if (this.duration === 0) {
      return this.done();
    } else if (this.duration < this.interval) {
      this.interval = this.duration;
    }
    this.duration -= this.interval;
    this.emit('tick', Date.now() - this.started);
    this.timer = setTimeout(this.step, this.interval);
    return this;
  }

  done() {
    this.emit('done', Date.now() - this.started);
    return this;
  }

  stop() {
    clearTimeout(this.timer);
    this.emit('stop', Date.now() - this.started);
    return this;
  }
};

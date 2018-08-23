const { EventEmitter } = require('events');
const Decimal          = require('decimal');

module.exports = class Transition extends EventEmitter {

  constructor({ startValue, endValue, duration, step, name } = {}) {
    super();
    this.startValue = startValue;
    this.endValue   = endValue;
    this.duration   = duration;
    this.step       = step;
    this.name       = name;

    // Determine increment for each step.
    this.increment = Decimal(endValue).sub(startValue).mul(step).div(duration);
  }

  start() {
    this.value = Decimal(this.startValue);
    this.emit('start', this.value.toNumber());
    this.iv = setInterval(this.onStep.bind(this), this.step * 1000);
  }

  onStep() {
    this.value = this.value.add(this.increment);
    this.emit('step', this.value.toNumber());
    if (this.value.toNumber() >= this.endValue) {
      this.end();
    }
  }

  stop(emit = true) {
    clearInterval(this.iv);
    if (emit) {
      this.emit('stop', this.value.toNumber());
    }
  }

  end() {
    this.stop(false);
    this.emit('end', this.endValue);
  }
};

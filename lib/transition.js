const { EventEmitter } = require('events');

module.exports = class Transition extends EventEmitter {

  constructor({ startValue, endValue, duration, step, name } = {}, toFixed = 2) {
    super();
    this.startValue = startValue;
    this.endValue   = endValue;
    this.duration   = duration;
    this.step       = step;
    this.name       = name;
    this.toFixed    = toFixed;

    // Determine increment for each step.
    this.increment = ((this.endValue - this.startValue) * this.step) / this.duration;
  }

  getValue() {
    return Number(this.value.toFixed(this.toFixed));
  }

  start() {
    this.value = this.startValue;
    this.emit('start', this.getValue());

    // Emit first step, at start value.
    this.emitValue();

    // Emit rest of the steps periodically.
    this.iv = setInterval(this.onStep.bind(this), this.step * 1000);
  }

  emitValue() {
    this.emit('step', this.getValue());
  }

  onStep() {
    this.value += this.increment;
    this.emitValue();
    if (Math.abs(this.endValue.toFixed(this.toFixed) - this.value.toFixed(this.toFixed)) <= 0) {
      this.end();
    }
  }

  stop(emit = true) {
    clearInterval(this.iv);
    if (emit) {
      this.emit('stop', this.getValue());
    }
  }

  end() {
    this.stop(false);
    this.emit('end', this.getValue());
  }
};

const Homey = require('homey');
const Transition = require('./lib/transition');

module.exports = class TransitionsApp extends Homey.App {

  onInit() {
    this.log('TransitionsApp is running...');

    // List of transitions.
    this.transitions = {};

    // Register triggers.
    this.triggers = {
      onTransitionStartedTrigger : new Homey.FlowCardTrigger('transition_started')
                                            .register()
                                            .registerRunListener(this.onTransitionStartedTrigger.bind(this)),
      onTransitionChangedTrigger : new Homey.FlowCardTrigger('transition_changed')
                                            .register()
                                            .registerRunListener(this.onTransitionChangedTrigger.bind(this)),
      onTransitionEndedTrigger   : new Homey.FlowCardTrigger('transition_ended')
                                            .register()
                                            .registerRunListener(this.onTransitionEndedTrigger.bind(this)),
    };

    // Register actions.
    new Homey.FlowCardAction('start_transition')
             .register()
             .registerRunListener(this.onStartTransitionAction.bind(this));
  }

  async onTransitionStartedTrigger(args, state) {
    this.log(`onTransitionStartedTrigger, args = ${ args }, state = ${ state }`);
    return true;
  }

  async onTransitionChangedTrigger(args, state) {
    this.log(`onTransitionChangedTrigger, args = ${ args }, state = ${ state }`);
    return true;
  }

  async onTransitionEndedTrigger(args, state) {
    this.log(`onTransitionEndedTrigger, args = ${ args }, state = ${ state }`);
    return true;
  }

  async onStartTransitionAction(args, state) {
    this.log(`Transition '${ args.name }' starting with args`, args);

    // Already have a transition with this name? Stop it.
    if (args.name in this.transitions) {
      this.transitions[args.name].end();
    }

    // Create a new transition, set event handlers, and start it.
    this.transitions[args.name] = new Transition(args);
    this.transitions[args.name].on('start', value => {
      this.onTransitionStart(args.name, value);
    }).on('step', value => {
      this.onTransitionStep(args.name, value);
    }).on('end', value => {
      this.onTransitionEnd(args.name, value);
    }).start();
    return true;
  }

  onTransitionStart(name, value) {
    this.log(`Transition started: ${ name }. Value: ${ value }`);
    this.triggers.onTransitionStartedTrigger.trigger({ name, value });
  }

  onTransitionStep(name, value) {
    this.log(`Transition step   : ${ name }. Value: ${ value }`);
    this.triggers.onTransitionChangedTrigger.trigger({ name, value });
  }

  onTransitionEnd(name, value) {
    this.log(`Transition ended  : ${ name }. Value: ${ value }`);
    this.triggers.onTransitionEndedTrigger.trigger({ name, value });
    delete this.transitions[name];
  }
}

const Homey      = require('homey');
const Transition = require('./lib/transition');
const Parser     = require('./lib/parser');

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
      onTransitionStoppedTrigger : new Homey.FlowCardTrigger('transition_stopped')
                                            .register()
                                            .registerRunListener(this.onTransitionStoppedTrigger.bind(this)),
    };

    // Register actions.
    new Homey.FlowCardAction('start_transition_text')
             .register()
             .registerRunListener(this.onStartTransitionTextAction.bind(this));
    new Homey.FlowCardAction('start_transition')
             .register()
             .registerRunListener(this.onStartTransitionAction.bind(this));
    new Homey.FlowCardAction('stop_transition')
             .register()
             .registerRunListener(this.onStopTransitionAction.bind(this));
  }

  async onTransitionStartedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition started: name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async onTransitionChangedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition changed: name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async onTransitionEndedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition ended  : name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async onTransitionStoppedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition stopped: name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async onStartTransitionTextAction(args, state) {
    let newArgs  = Parser(args.value);
    newArgs.name = args.name;
    return this.onStartTransitionAction(newArgs, state);
  }

  async onStartTransitionAction(args, state) {
    this.log(`[ACTION]  transition created: args =`, args);

    // Validate arguments.
    if (args.step > args.duration) {
      throw Error('STEP_EXCEEDS_DURATION');
    }

    if (args.step < 1) {
      throw Error('STEP_TOO_SMALL');
    }

    // Already have a transition with this name? Stop it.
    if (args.name in this.transitions) {
      this.transitions[args.name].stop();
    }

    // Create a new transition, set event handlers, and start it.
    this.transitions[args.name] = new Transition(args);
    this.transitions[args.name].on('start', value => {
      this.onTransitionStart(args.name, value);
    }).on('step', value => {
      this.onTransitionStep(args.name, value);
    }).on('stop', value => {
      this.onTransitionStop(args.name, value);
    }).on('end', value => {
      this.onTransitionEnd(args.name, value);
    }).start();
    return true;
  }

  async onStopTransitionAction(args, state) {
    this.log(`[ACTION]  stopping transition: name = ${ args.name }`);
    if (args.name in this.transitions) {
      this.transitions[args.name].stop();
    }
  }

  onTransitionStart(name, value) {
    this.log(`[ACTION]  transition started: name = ${ name }, value = ${ value }`);
    this.triggers.onTransitionStartedTrigger.trigger({ name, value }, { name, value });
  }

  onTransitionStep(name, value) {
    this.log(`[ACTION]  transition changed: name = ${ name }, value = ${ value }`);
    this.triggers.onTransitionChangedTrigger.trigger({ name, value }, { name, value });
  }

  onTransitionEnd(name, value) {
    this.log(`[ACTION]  transition ended  : name = ${ name }, value = ${ value }`);
    this.triggers.onTransitionEndedTrigger.trigger({ name, value }, { name, value });
    delete this.transitions[name];
  }

  onTransitionStop(name, value) {
    this.log(`[ACTION]  transition stopped: name = ${ name }, value = ${ value }`);
    this.triggers.onTransitionStoppedTrigger.trigger({ name, value }, { name, value });
    delete this.transitions[name];
  }
}

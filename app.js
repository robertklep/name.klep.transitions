const Homey      = require('homey');
const Transition = require('./lib/transition');
const Parser     = require('./lib/parser');
const camelize   = s => s.replace(/(_[a-z])/g, m => m[1].toUpperCase());

module.exports = class TransitionsApp extends Homey.App {

  onInit() {
    this.log('TransitionsApp is running...');

    // List of transitions.
    this.transitions = {};

    // Register triggers.
    this.triggers = {};
    this.registerTrigger('transition_started');
    this.registerTrigger('transition_changed');
    this.registerTrigger('transition_ended');
    this.registerTrigger('transition_stopped');

    // Register conditions.
    this.registerCondition();

    // Register actions.
    this.registerAction('start_transition_text');
    this.registerAction('start_transition');
    this.registerAction('stop_transition');
  }

  registerTrigger(name) {
    const method = camelize(name) + 'Trigger';
    this.triggers[method] = this.homey.flow.getTriggerCard(name).registerRunListener(this[method].bind(this));
  }

  registerCondition() {
    this.homey.flow
      .getConditionCard('transition_is_running')
      .registerArgumentAutocompleteListener('name', async (query, args) => {
        const matches = Object.keys(this.transitions).filter(name => name.startsWith(query)).map(name => {
          return { name };
        });
        if (matches.length) {
          return matches;
        } else {
          return [ { name : query } ];
        }
      }).registerRunListener(async (args, state) => {
        const name = args.name?.name;
        return name in this.transitions && ! this.transitions[name].hasStopped();
      });
  }

  registerAction(name) {
    const method = camelize(name) + 'Action';
    this.homey.flow.getActionCard(name).registerRunListener(this[method].bind(this));
  }

  async transitionStartedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition started: name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async transitionChangedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition changed: name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async transitionEndedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition ended  : name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async transitionStoppedTrigger(args, state) {
    if (args.name !== state.name) return false;
    this.log(`[TRIGGER] transition stopped: name = ${ args.name }, value = ${ state.value }`);
    return true;
  }

  async startTransitionTextAction(args, state) {
    let newArgs  = Parser(args.value);
    newArgs.name = args.name;
    return this.startTransitionAction(newArgs, state);
  }

  async startTransitionAction(args, state) {
    this.log(`[ACTION]  transition created: args =`, args, ', state =', state);

    // Validate arguments.
    if (args.step > args.duration) {
      throw Error('STEP_EXCEEDS_DURATION');
    }

    if (args.step < 0.5) {
      throw Error('STEP_TOO_SMALL');
    }

    // Already have a transition with this name? Stop it.
    if (args.name in this.transitions) {
      this.transitions[args.name].stop();
    }

    // Create a new transition, set event handlers, and start it.
    this.transitions[args.name] = new Transition(args);
    this.transitions[args.name].on('start', value => {
      this.onTransitionEvent('Started', args.name, value);
    }).on('step', value => {
      this.onTransitionEvent('Changed', args.name, value);
    }).on('end', value => {
      this.onTransitionEvent('Ended', args.name, value, true);
    }).on('stop', value => {
      this.onTransitionEvent('Stopped', args.name, value, true);
    }).start();
    return true;
  }

  async stopTransitionAction(args, state) {
    this.log(`[ACTION]  stopping transition: name = ${ args.name }`);
    if (args.name in this.transitions) {
      this.transitions[args.name].stop();
      delete this.transitions[args.name];
    }
  }

  onTransitionEvent(event, name, value, cleanup = false) {
    this.log(`[ACTION]  transition ${ event.toLowerCase()}: name = ${ name }, value = ${ value }`);
    this.triggers['transition' + event + 'Trigger'].trigger({ name, value }, { name, value });
    if (cleanup) {
      delete this.transitions[name];
    }
  }
}

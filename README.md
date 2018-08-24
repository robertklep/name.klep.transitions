# Transitions — Flexible time transitions

Homey app that offers flow cards to start/stop timing transitions.

## What's a "transition"?

A transition has 5 parameters:
- a start value
- an end value
- a duration: how long it will take to transition from the start value to the end value
- a step value: how often the current value will be updated
- a name: a user-defined name for this transition

## How it ties together

A transition is started from an Action flow.

There are various Trigger flowcards that can be used to "listen" for changes to a transition:
- a transition is started
- a transition is changed: its value was updated
- a transition has ended: it has reached its end value
- a transition was stopped: it was explicitly stopped by a flow, or a new transition with the same name was started

Note that _all_ a transition does it trigger flows. It does, in itself, _not_ change device capabilities.

## Example

You have a light whose brightness you want to gradually increase over a period of 10 minutes. This is the duration.

Brightness is typically controlled by Homey's `dim` capability, which has a range of 0 (dark) to 1 (light). These are the start and end values.

Next, you have to determine how often you want the light to be set to the calculated brightness value. Say every minute. This is the step value.

Lastly, you have to name this transition. We'll just call it "light" (however, this is a pretty generic name, and a transition name should be unique, so you have to be a bit more creative than me).

To recap, these are the parameter settings that you'd use for the Action flowcard:
- `start`: 0
- `end`: 1
- `duration`: 600 (10 minutes in seconds)
- `step`: 60
- `name`: "light"

If you want the brightness to be changed more often, say once every 30 seconds, you change the `step` value to "30".

To actually change the light's brightness, you use the Trigger flowcard "a transition has changed" to change the dim value of your light.

## "Short form"

There are two action flowcards, one that has an input field for each value, and one that has only two fields. The latter allows you to enter all parameters as a single string.

This string has the form `{FROM}-{TO},{DURATION}[s|m|h|u],{STEP}[s|m|h|u]`.

Some concrete examples:
- `0-1,10m,1m` — the previous example; note that you can use `m` (minute) and `h`/`u` (hour) instead of having to convert everything back to seconds
- `50-100,5m,30s` — transition from 50 to 100 in 5 minutes, with a 30 second step value
- `50-100,300s,0.5m` — the same as the previous, but demonstrating how you can switch between seconds and minutes
- `0.01-1.321,10m,1m` — ranges can also contain decimal numbers (although there is no mitigation against floating point rounding issues)

# Icon attribution

"Time" icon created by Alberto Alonso from <a href="https://thenounproject.com/">the Noun Project</a>.

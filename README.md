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

*NB*:
- you can't set step values below 0.5 seconds
- if you're using decimal values, use points, not commas (so `0.1` is correct, `0,1` isn't).

## Note

If the total duration for a transition isn't evenly divisible by the step size, the last step will be shortened to make sure it fits the duration.

In other words, if you have a duration of 10 seconds and a step size of 4 seconds, the transition will emit a "change" event on 0s, 4s, 8s and 10s. So the last step only lasts 2 seconds.

Another example: with a duration of 100 seconds and a step size of 3 seconds, change events will happen on "0, 3s, 6s, ..., 93s, 96s, 99s, 100s".

## Changelog

v1.0.3 (2018-09-05):
- Fixed issue #3: timer didn't always stop running
- More robust/sane timing

v1.0.2 (2018-08-28)
v1.0.1 (2018-08-27)

# Icon attribution

"Stopwatch" Icon made by Freepik from <a href="https://www.flaticon.com">www.flaticon.com</a>.

module.exports = function Parser(text) {
  let [ match, startValue, endValue, duration, durationUnit, step, stepUnit ] = text.match(/\b([\d\.]+)\s*-\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(s|m|h|u).*?,\s*([\d\.]+)\s*(s|m|h|u)/i) || [];

  duration *= { s : 1, m : 60, h : 3600, u : 3600 }[durationUnit];
  step     *= { s : 1, m : 60, h : 3600, u : 3600 }[stepUnit];

  if (startValue === undefined || endValue === undefined || duration === undefined || step === undefined) throw Error('PARSE_ERROR');

  return { startValue: Number(startValue), endValue: Number(endValue), duration, step };
};

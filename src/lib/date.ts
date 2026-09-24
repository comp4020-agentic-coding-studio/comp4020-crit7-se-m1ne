// `new Date().toISOString()` is UTC, which can land on the wrong calendar
// day for a server not running in UTC (e.g. just after 9pm AEST is already
// tomorrow in UTC). Shifting by the local offset before slicing gives the
// date this machine's clock actually shows.
export function todayISODate(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

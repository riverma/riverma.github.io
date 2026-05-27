// Debounce: delay calling fn until args stop changing for `wait` ms.
// Returns a function with a .cancel() to drop the pending call.
export function debounce(fn, wait) {
  let timer = null;
  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; fn(...args); }, wait);
  };
  debounced.cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  return debounced;
}

/**
 * Joins truthy class name fragments together, filtering out falsy values.
 * Lightweight alternative to `clsx` so we don't add another dependency
 * for something this small.
 *
 * @param {...(string|false|null|undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function isIos() {
  return /iPhone|iPad|iPod/gi.test(navigator.userAgent);
}

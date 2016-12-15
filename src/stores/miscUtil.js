
export function createUuid() {
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0,
      v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid;
}

export function clone(obj) {
  if (typeof obj === "object") {
    return JSON.parse(JSON.stringify(obj));
  } else {
    return obj;
  }
}

export function lpad(num) {
  num = ("" + num).trim();
  while (num.length < 2) {
    num = "0" + num;
  }
  return num.substr(num.length - 2);
}

export function hasNoRealValue(obj, name) {
  obj = clone(obj);
  let hasNo = false;
  if (obj !== null) {
    if (typeof obj === "string") {
      hasNo = hasNothing(obj);
    }
    if (typeof obj === "object") {
      const value = obj[name];
      hasNo = (!hasProperty(obj, name) || value === undefined || hasNothing(value));
    }
  }
  return hasNo;
}

export function hasProperty(obj, propname) {
  if (obj === null) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, propname);
}

const hasNothing = (value) =>
  (value === null || value === "" || value === "00:00" || value === "00:00:00" || value <= 0);
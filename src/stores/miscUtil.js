
export function createUuid() {
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0,
      v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid;
}

export const clone = (obj) => JSON.parse(JSON.stringify(obj));

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
      hasNo = (!obj.hasOwnProperty(name) || value === undefined || hasNothing(value));
    }
    console.log("hasNoRealValue: " + (name || "unknown") + ", input: [" + JSON.stringify(obj) + "], noValue? = [" + hasNo + "]");
  }  
  return hasNo;
}

const hasNothing = (value) => (value === null || value === "" || value === "00:00" || value === "00:00:00" || value <= 0);
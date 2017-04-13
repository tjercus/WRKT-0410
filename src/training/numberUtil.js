
export function lpad(num) {
  num = ("" + num).trim();
  while (num.length < 2) {
    num = "0" + num;
  }
  return num.substr(num.length - 2);
}

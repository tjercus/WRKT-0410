import test from "tape";

import {createUuid, clone, hasNoRealValue, lpad} from "../src/stores/miscUtil";

// miscUtil-spec.js 
test("createUuid should create a unique valid uuid", (assert) => {
  const uuid = createUuid();
  const uuid2 = createUuid();
  assert.equal(uuid.length, 36);
  assert.equal(uuid2.length, 36);
  assert.notEqual(uuid, uuid2);
  assert.end();
});

test("hasNoRealValue should should work for an object with values", (assert) => {
  const obj = {
    value1: "wobble",
    value2: 12,
    value3: "13",
    value4: "05:02",
    value5: "02:05:03"
  };

  for (let prop in obj) {
    assert.notOk(hasNoRealValue(obj, prop), "should be false for " + prop + " with " + obj[prop]  + "]");
  }  
  assert.end();
});

test("hasNoRealValue should should work for an object with NO values", (assert) => {
  const obj = {
    value1: "",
    value2: null,
    value3: "00:00",
    value4: "00:00:00",
    value5: 0,
    value6: -1,
  };
  for (let prop in obj) {
    assert.ok(hasNoRealValue(obj, prop), "should be true for " + prop + " with [" + obj[prop] + "]");
  }
  assert.ok(hasNoRealValue(obj, "doesNotExist"), "should be true for undefined");
  assert.end();
});

test("hasNoRealValue should should work for a string with a value", (assert) => {
  const value = "wobble";
  assert.notOk(hasNoRealValue(value), "should be false for [" + value + "]");
  assert.end();
});

test("hasNoRealValue should should work for a string with NO value", (assert) => {
  const value = "";
  assert.ok(hasNoRealValue(value), "should be true for [" + value + "]");
  assert.end();
});

test("hasNoRealValue should should work for null", (assert) => {
  const value = null;
  assert.notOk(hasNoRealValue(value), "should be false for [" + value + "]");
  assert.end();
});

test("clone should clone with real numerics", (assert) => {
  const obj = {
    age: 40
  };
  assert.equal((typeof clone(obj).age), "number", "should be number for [" + obj.age + "]");
  assert.end();
});

test("clone should work with a string", (assert) => {
  const obj = "mystring";
  assert.equal((typeof clone(obj)), "string", "should be string for [" + obj + "]");
  assert.equal(clone(obj), "mystring");
  assert.end();
});

test("clone should work with null", (assert) => {
  const obj = null;
  assert.equal((typeof clone(obj)), "object", "should be null for [" + obj + "]");
  assert.equal(clone(obj), null);
  assert.end();
});

test("lpad should work with a string", (assert) => {
  const num = "4";
  const padded = lpad(num);
  assert.equal((typeof padded), "string", "should be string for [" + num + "]");
  assert.equal(padded, "04", "should be padded with one zero for [" + num + "]");
  assert.end();
});

test("lpad should work with real numerics", (assert) => {
  const num = 4;
  const padded = lpad(num);
  assert.equal((typeof padded), "string", "should be string for [" + num + "]");
  assert.equal(padded, "04", "should be padded with one zero for [" + num + "]");
  assert.end();
});

test("lpad should work with previously padded string", (assert) => {
  const num = "04";
  assert.equal(lpad(num), "04", "should still be padded with one zero for [" + num + "]");
  assert.end();
});


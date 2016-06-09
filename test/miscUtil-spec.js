import test from "tape";

import {createUuid, clone, hasNoRealValue} from "../src/stores/miscUtil";

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
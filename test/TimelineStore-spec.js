
import test from "tape";
import TimelineStore from "../src/stores/TimelineStore";

/**
 * Tests for {@link TimelineStore.js}
 */
let plan = {  
  "uuid": "acc3d1b8-33ae-4d70-dda3-d0e885f516f4",
  "name": "10k plan #1",
  "days": [
    {"nr": "1", "trainingId": "2a63ef62-fb2c-4b92-8971-59db6e58394c"},
    {"nr": "2", "trainingId": "2a63ef62-fb2c-4b92-8971-59db6e58394c"}
  ]
}

// test("findTraining should find a training by uuid", (assert) => {  
//   let training = findTraining("blah-11", trainings);  
//   assert.equal(true, (typeof training === "object"));
//   assert.equal(training.uuid, "blah-11");
//   assert.equal(training.name, "name11");
//   assert.end();
// });

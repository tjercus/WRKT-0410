/**
 * Holds data for editing a day
*/
import { updateTrainingInstanceInDay, addTrainingInstanceToDay, augmentTrainingNotFoundException } from "../training/trainingUtil";
import { EventsEnum as ee, DEFAULT_TRAINING } from "../shell/constants";
import {
  addSegment,
  removeSegment,
  augmentSegmentData,
  updateSegment,
  makeTrainingTotal, findSegment,
} from "../training/segmentUtil";
import { clone, hasProperty, createUuid } from "../shell/objectUtil";

let day = {};

const dayStore = eventbus => {

  eventbus.on(ee.DAY_LOAD_CMD, (_day, date) => {
    day = {..._day};
    // day = Object.assign({}, _day);
    console.log(`DayStore caught DAY_LOAD_CMD and loads day [${day.uuid}] locally`);
    eventbus.emit(ee.DAY_LOAD_EVT, day, date);
  });

  eventbus.on(ee.INSTANCE_CREATE_CMD, dayUuid => {
    console.log(`DayStore caught INSTANCE_CREATE_CMD`);
    if (day.uuid === dayUuid) {
      console.log(`DayStore pushing a new training to local day ${day.uuid}`);
      const training = { ...DEFAULT_TRAINING, uuid: createUuid() };
      day = addTrainingInstanceToDay(day, training);
      eventbus.emit(ee.DAY_UPDATE_EVT, day);
      eventbus.emit(ee.INSTANCE_LOAD_CMD, training); //
    } else {
      console.log(
        `DayStore COULD NOT UPDATE local day since uuids are not equal ${day.uuid}/${dayUuid}`,
      );
    }
  });

  /**
     * emitted by TrainingInstanceComponent when user clicks 'save' button
     */
  eventbus.on(ee.INSTANCE_UPDATE_CMD, instance => {
    console.log(`DayStore caught INSTANCE_UPDATE_CMD, trying to update local day ${day.uuid}`);
    try {
      day = updateTrainingInstanceInDay(day, instance);
    } catch (exc) {
      // TODO or:
      if (exc instanceof NotFoundException) {
        day = day.trainings.push(instance);
      }
    }
    eventbus.emit(ee.DAY_UPDATE_EVT, day);
  });

  // eventbus.on(ee.INSTANCE_ADD_CMD, instance => {
  //   console.log(`DayStore caught INSTANCE_ADD_CMD, trying to update day ${day.uuid}`);
  //   day = day.trainings.push(instance);
  //   eventbus.emit(ee.DAY_UPDATE_EVT, day);
  // });

  eventbus.on(ee.SEGMENT_GET_CMD, (segmentUuid, trainingUuid) => {
    const segment = findSegment(segmentUuid, day.trainings.filter(training => training.segments));
    if (segment) {
      eventbus.emit(ee.SEGMENT_GET_EVT, segment);
    }
  });

  // TODO decide if this logic should be here ...
  eventbus.on(ee.SEGMENT_UPDATE_CMD, segment => {
    console.log(`DayStore caught SEGMENT_UPDATE_CMD`);
    updateSegmentInStore(segment);
  });
  eventbus.on(ee.SEGMENT_ADD_CMD, segment => {
    console.log(`DayStore caught SEGMENT_ADD_CMD`);
    addSegmentToStore(segment, false);
  });
  eventbus.on(ee.SEGMENT_REMOVE_CMD, segment => {
    removeSegmentFromStore(segment);
  });
  eventbus.on(ee.SEGMENT_CLONE_CMD, segment => {
    addSegmentToStore(segment, true);
  });

  /**
   * Update given segment in list of segments
   * @param {Segment} segment - updatable
   * @returns {void} - emit event instead
   */
  const updateSegmentInStore = segment => {
    if (hasProperty(day, "uuid")) {
      const _segment = augmentSegmentData(segment);
      console.log(`DayStore.updateSegmentInStore after augmenting: ${JSON.stringify(_segment)}`);
      let updatedLocalTrainings = [];
      day.trainings.map(training => {
        if (training.uuid === segment.trainingUuid) {
          console.log(
            `DayStore.updateSegmentInStore training before updating segment: ${JSON.stringify(
              training,
            )}`,
          );
          training.segments = updateSegment(_segment, clone(training.segments));
          training.total = makeTrainingTotal(clone(training.segments));
          console.log(
            `DayStore.updateSegmentInStore training after updating segment: ${JSON.stringify(
              training,
            )}`,
          );
        } else {
          console.log(
            `DayStore.updateSegmentInStore no-op: training.uuid [${training.uuid}] !== segment.trainingUuid [${segment.trainingUuid}]`,
          );
        }
        updatedLocalTrainings.push(training);
      });
      // console.log(`DayStore.updateSegmentInStore trainings: ${JSON.stringify(updatedLocalTrainings)}`);
      if (updatedLocalTrainings.length > 0) {
        day.trainings = updatedLocalTrainings;
        eventbus.emit(ee.DAY_UPDATE_EVT, day);
      }
    }
  };

  /**
   * Add a segment to class scoped segments, optionally overwriting it's uuid
   * @param {Segment} segment - data object
   * @param {boolean} overwriteUuid - new uuid or keep old?
   * @returns {void} - emit event instead
   */
  const addSegmentToStore = (segment, overwriteUuid) => {
    if (hasProperty(day, "uuid")) {
      console.log(`DayStore.addSegmentToStore ${JSON.stringify(segment)}`);
      const _segment = augmentSegmentData(segment);
      let updatedLocalTrainings = [];
      day.trainings.map(training => {
        // TODO found the bug! it only adds one training
        if (training.uuid === segment.trainingUuid) {
          training.segments = addSegment(_segment, clone(training.segments), overwriteUuid);
          training.total = makeTrainingTotal(clone(training.segments));
          console.log(
            `DayStore.addSegmentInStore training after adding segment: ${JSON.stringify(training)}`,
          );
        } else {
          console.log(`DayStore.addSegmentInStore trainingUuid was NOT equal: ${training.uuid}`);
        }
        updatedLocalTrainings.push(training);
      });
      console.log(`DayStore.addSegmentToStore trainings: ${JSON.stringify(updatedLocalTrainings)}`);
      day.trainings = updatedLocalTrainings;
      eventbus.emit(ee.DAY_UPDATE_EVT, day);
    }
  };

  /**
    * Remove segment from local collection of segments
    * @param {Segment} segment - data object
    * @returns {void} - emit event instead
    */
  const removeSegmentFromStore = segment => {
    if (hasProperty(day, "uuid")) {
      const _segment = augmentSegmentData(segment);

      let updatedLocalTrainings = [];
      day.trainings.map(training => {
        if (training.uuid === segment.trainingUuid) {
          training.segments = removeSegment(_segment, clone(training.segments));
          training.total = makeTrainingTotal(clone(training.segments));
        }
        updatedLocalTrainings.push(training);
      });
      console.log(
        `DayStore.removeSegmentFromStore trainings: ${JSON.stringify(updatedLocalTrainings)}`,
      );
      day.trainings = updatedLocalTrainings;
      eventbus.emit(ee.DAY_UPDATE_EVT, day);
    }
  };
};

export default dayStore;
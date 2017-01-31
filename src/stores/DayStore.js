import EventEmitter from "eventemitter2";
import { findDay } from "./timelineUtil";
import { updateTrainingInstanceInDay } from "./trainingUtil";
import {EventsEnum as ee} from "../constants";
import {
  addSegment,
  removeSegment,
  augmentSegmentData,
  updateSegment,
  makeTrainingTotal,
} from "./segmentUtil";
import {clone, hasProperty} from "./miscUtil";

/**
 * Holds data for editing a day
*/
export default class DayStore {

  /**
   * Holds data for editing a day and it's one or more trainings
   * @constructor
   * @param {EventEmitter} eventbus
   */
  constructor(eventbus) {
    this.eventbus = eventbus;
    this.day = {};

    eventbus.on(ee.DAY_LOAD_CMD, (day, date) => {
      console.log(`DayStore caught DAY_LOAD_CMD and loads day [${day.uuid}] locally`);
      this.day = day;
      eventbus.emit(ee.DAY_LOAD_EVT, day, date);
    });

    // throw DAY_UPDATE_EVT with a day as payload (so TimelineStore can update itself)
    //eventbus.on(ee.SEGMENTS_UPDATE_EVT", (training) => {
      // TODO careful for race condition since methods below update/add/remove throw same event
      //eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
    //});

    /**
     * emitted by TrainingInstanceComponent when user clicks 'save' button
     */
    eventbus.on(ee.INSTANCE_UPDATE_CMD, (instance) => {
      console.log(`DayStore caught INSTANCE_UPDATE_CMD, trying to update day ${this.day.uuid}`);
      this.day = updateTrainingInstanceInDay(this.day, instance);
      this.eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
    });

    // TODO decide if this logic should be here ...
    eventbus.on(ee.SEGMENT_UPDATE_CMD, (segment) => {
      console.log(`DayStore caught SEGMENT_UPDATE_CMD`);
      this.updateSegmentInStore(segment);
    });
    eventbus.on(ee.SEGMENT_ADD_CMD, (segment) => {
      this.addSegmentToStore(segment, false);
    });
    eventbus.on(ee.SEGMENT_REMOVE_CMD, (segment) => {
      this.removeSegmentFromStore(segment);
    });
    eventbus.on(ee.SEGMENT_CLONE_CMD, (segment) => {
      this.addSegmentToStore(segment, true);
    });
  }

  /**
   * Update given segment in list of segments
   * @param {Segment} segment - updatable
   * @returns {void} - emit event instead
   */
  updateSegmentInStore(segment) {
    if (hasProperty(this.day, "uuid")) {
      const _segment = augmentSegmentData(segment);
      console.log(`DayStore.updateSegmentInStore after augmenting: ${JSON.stringify(_segment)}`);
      this.day.trainings.forEach((training) => {
        if (training.uuid === segment.trainingUuid) {
          training.segments = updateSegment(_segment, clone(training.segments));
          training.total = makeTrainingTotal(clone(training.segments));
          this.eventbus.emit(ee.SEGMENTS_UPDATE_EVT, {
            uuid: segment.trainingUuid,
            segments: training.segments,
            total: training.total,
          });
        }
      });
    }
  }

  /**
   * Add a segment to class scoped segments, optionally overwriting it's uuid
   * @param {Segment} segment - data object
   * @param {boolean} overwriteUuid - new uuid or keep old?
   * @returns {void} - emit event instead
   */
  addSegmentToStore(segment, overwriteUuid) {
    if (hasProperty(this.day, "uuid")) {
      console.log(`DayStore.addSegmentToStore`);
      const _segment = augmentSegmentData(segment);
      this.day.trainings.forEach((training) => {
        if (training.uuid === _segment.trainingUuid) {
          console.log(`DayStore.addSegmentToStore found training ${training.uuid}`);
          training.segments = addSegment(_segment, training.segments, overwriteUuid);
          training.total = makeTrainingTotal(clone(training.segments));
          console.dir(training.segments);
          this.eventbus.emit(ee.SEGMENTS_UPDATE_EVT, {
            uuid: _segment.trainingUuid,
            segments: training.segments,
            total: training.total,
          });
        }
      });
    }
  }

   /**
    * Remove segment from local collection of segments
    * @param {Segment} segment - data object
    * @returns {Void} - emit event instead
    */
   removeSegmentFromStore(segment) {
     if (hasProperty(this.day, "uuid")) {
       const _segment = augmentSegmentData(segment);
       this.day.trainings.forEach((training) => {
         if (training.uuid === segment.trainingUuid) {
           training.segments = removeSegment(_segment, training.segments);
           training.total = makeTrainingTotal(training.segments);
           this.eventbus.emit(ee.SEGMENTS_UPDATE_EVT, {
             uuid: segment.trainingUuid,
             segments: training.segments,
             total: training.total,
           });
         }
       });
     }
   }


}

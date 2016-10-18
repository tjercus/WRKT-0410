import EventEmitter from "eventemitter2";
import { findDay } from "./timelineUtil";

import {
  addSegment,
  removeSegment,
  augmentSegmentData,
  updateSegment,
  makeTrainingTotal,
} from "./segmentUtil";
import {
  //createUuid,
  clone,
} from "./miscUtil";

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
    this.plan = {};

    eventbus.on("PLAN_LOAD_EVT", (plan) => {
      console.log(`DayStore caught PLAN_LOAD_CMD and loads plan locally`);
      this.plan = plan;
    });

    eventbus.on("DAY_LOAD_CMD", (dayUuid) => {
      // caching
      const day = this.day;
      if (!day || (day.uuid !== dayUuid) && this.plan) {
        this.day = findDay(dayUuid, this.plan);
      }
      if (this.day) {
        eventbus.emit("DAY_LOAD_EVT", this.day);
      }
    });

    eventbus.on("INSTANCE_UPDATE_CMD", (instance) => {});
    eventbus.on("INSTANCE_LOAD_CMD", (instance) => {});

    eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
      this.updateSegmentInStore(segment);
    });
    eventbus.on("SEGMENT_ADD_CMD", (segment) => {
      this.addSegmentToStore(segment);
    });
    eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
      this.removeSegmentFromStore(segment);
    });
    eventbus.on("SEGMENT_CLONE_CMD", (segment) => {
      this.addSegmentToStore(segment, true);
    });
  }

  /**
   * Update given training in list of trainings
   * @param {Segment} segment - updatable
   * @returns {void} - emit event instead
   */
  updateSegmentInStore(segment) {
    const _segment = augmentSegmentData(segment);
    this.day.trainings.forEach((training) => {
      if (training.uuid === segment.trainingUuid) {
        training.segments = updateSegment(_segment, clone(training.segments));
        training.total = makeTrainingTotal(clone(training.segments));
        this.eventbus.emit("SEGMENT_UPDATE_EVT", {
          segment: _segment,
          total: training.total,
        });
      }
    });
  }

  /**
   * Add a segment to class scoped segments, optionally overwriting it's uuid
   * @param {Segment} segment - data object
   * @param {boolean} overwriteUuid - new uuid or keep old?
   * @returns {void} - emit event instead
   */
   addSegmentToStore(segment, overwriteUuid) {
     const _segment = augmentSegmentData(segment);
     this.day.trainings.forEach((training) => {
       if (training.uuid === segment.trainingUuid) {
         training.segments = addSegment(segment, training.segments, overwriteUuid);
         training.total = makeTrainingTotal(clone(training.segments));
         this.eventbus.emit("SEGMENT_ADD_EVT", {
           segment: _segment,
           total: training.total,
         });
       }
     });
   }

   /**
    * Remove segment from local collection of segments
    * @param {Segment} segment - data object
    * @returns {Void} - emit event instead
    */
   removeSegmentFromStore(segment) {
     const _segment = augmentSegmentData(segment);
     this.day.trainings.forEach((training) => {
       if (training.uuid === segment.trainingUuid) {
         training.segments = removeSegment(segment, training.segments);
         training.total = makeTrainingTotal(training.segments);
         this.eventbus.emit("SEGMENT_REMOVE_EVT", {
           segments: training.segments,
           total: training.total,
         });
       }
     });
   }

   /**
    * Update segment in local collection of segments
    * @param {Segment} segment - data object
    * @returns {Void} - emit event instead
    */
   updateSegmentInStore(segment) {
     if (segment.trainingUuid !== this.uuid) return;
     const _segment = augmentSegmentData(segment);
     this.segments = updateSegment(_segment, training.segments);
     this.total = makeTrainingTotal(training.segments);
     this.eventbus.emit("SEGMENT_UPDATE_EVT", {
       segment: _segment,
       total: training.total,
     });
   }

}

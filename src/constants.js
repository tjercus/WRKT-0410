import React from "react";
import keyMirror from "keymirror";

export const EventsEnum = Object.freeze(keyMirror({
  DAY_CLONE_CMD: null,
  DAY_CLONE_EVT: null,
  DAY_DELETE_CMD: null,
  DAY_DELETE_EVT: null,
  DAY_EMPTY_CMD: null,
  DAY_EMPTY_EVT: null,
  DAY_LOAD_CMD: null,
  DAY_LOAD_EVT: null,
  DAY_MOVE_CMD: null,
  DAY_MOVE_EVT: null,
  DAY_UPDATE_CMD: null,
  DAY_UPDATE_EVT: null,
  INSTANCE_CLEAR_CMD: null,
  INSTANCE_CLEAR_EVT: null,
  INSTANCE_LOAD_CMD: null,
  INSTANCE_LOAD_EVT: null,
  INSTANCE_REMOVE_CMD: null,
  INSTANCE_UPDATE_CMD: null,
  INSTANCE_SEGMENT_ADD_CMD: null,
  INSTANCES_PERSIST_EVT: null,
  INSTANCES_PERSIST_ERROR_EVT: null,
  MENU_CLICK_CMD: null,
  MENU_CLICK_EVT: null,
  PLAN_ADD_EVT: null,
  PLAN_ADD_CMD: null,
  PLAN_ADD_ERROR_CMD: null,
  PLAN_ADD_ERROR_EVT: null,
  PLAN_FETCH_CMD: null,
  PLAN_FETCH_EVT: null,
  PLAN_FETCH_ERROR_EVT: null,
  PLAN_LOAD_CMD: null,
  PLAN_LOAD_EVT: null,
  PLAN_PERSIST_CMD: null,
  PLAN_PERSIST_EVT: null,
  PLAN_PERSIST_ERROR_EVT: null,
  PLAN_UPDATE_EVT: null,
  PLAN_UPDATE_CMD: null,
  PLAN_AND_INSTANCES_PERSIST_CMD: null,
  PLANLIST_FETCH_CMD: null,
  PLANLIST_FETCH_EVT: null,
  PLANLIST_FETCH_ERROR_EVT: null,
  PLAN_SELECT_WEEK_CMD: null,
  PLAN_SELECT_WEEK_EVT: null,
  SEGMENT_GET_EVT: null,
  SEGMENT_GET_CMD: null,
  // SEGMENT_LOAD_CMD: null,
  // SEGMENT_LOAD_EVT: null,
  SEGMENT_UPDATE_CMD: null,
  SEGMENT_UPDATE_EVT: null,
  SEGMENT_CLONE_CMD: null,
  SEGMENT_CLONE_EVT: null,
  SEGMENT_ADD_CMD: null,
  SEGMENT_ADD_EVT: null,
  SEGMENT_REMOVE_CMD: null,
  SEGMENT_REMOVE_EVT: null,
  SEGMENTS_UPDATE_CMD: null,
  SEGMENTS_UPDATE_EVT: null,
  SET_NOTIFICATION_TIMEOUT_CMD: null,
  TRAINING_ADD_EVT: null,
  TRAINING_CLEAR_CMD: null,
  TRAINING_CLEAR_EVT: null,
  TRAINING_CLONE_CMD: null,
  TRAINING_CLONE_EVT: null,
  TRAINING_CLONE_AS_INSTANCE_CMD: null,
  TRAINING_LIST_EVT: null,
  TRAINING_LIST_CMD: null,
  TRAINING_LOAD_CMD: null,
  TRAINING_LOAD_EVT: null,
  TRAINING_LOAD_ERROR_EVT: null,
  TRAINING_RENDER_EVT: null,
  TRAINING_REMOVE_CMD: null,
  TRAINING_REMOVE_EVT: null,
  TRAINING_TO_PLAN_CMD: null,
  TRAINING_TO_PLAN_EVT: null,
  TRAINING_UPDATE_CMD: null,
  TRAINING_UPDATE_EVT: null,
  TRAININGS_FETCH_CMD: null,
  TRAININGS_FETCH_EVT: null,
  TRAININGS_FETCH_ERROR_EVT: null,
  TRAININGS_LOAD_ERROR_EVT: null,
  TRAININGS_PERSIST_CMD: null,
  TRAININGS_PERSIST_EVT: null,
  TRAININGS_PERSIST_ERROR_EVT: null,
  TRAININGS_UPDATE_CMD: null,
  TRAININGS_UPDATE_EVT: null,
}));

export const TRAINING_SHAPE = Object.freeze({
    uuid: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string,
    segments: React.PropTypes.array.isRequired,
    total: React.PropTypes.object.isRequired
});

export const DEFAULT_TOTAL = {
  distance: 0,
  duration: "00:00:00",
  pace: "00:00"
};

export const DEFAULT_TRAINING = {
  uuid: null,
  name: "undefined",
  type: null,
  segments: [],
  isNameEditable: false,
  total: DEFAULT_TOTAL
};
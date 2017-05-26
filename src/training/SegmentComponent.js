import React from "react";
import EventEmitter from "eventemitter4";
import {canAugment, isValidSegment, parseDuration, augmentSegmentData} from "./segmentUtil";
import {createUuid, clone, hasProperty} from "../shell/objectUtil";
import {EventsEnum as ee} from "../shell/constants";

let isMounted = false;

export default class SegmentComponent extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
    uuid: React.PropTypes.string.isRequired,
    trainingUuid: React.PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    // console.log(`SegmentComponent props.uuid ${JSON.stringify(props.uuid)}`);

    this.state = {}; // TODO set empty component?
  }

  componentDidMount() {
    isMounted = true;

    // got a segment from a loaded training in TrainingStore or TrainingInstanceStore
    this.props.eventbus.on(ee.SEGMENT_GET_EVT, segment => this.onIncomingSegment(segment));
    this.props.eventbus.on(ee.SEGMENT_UPDATE_EVT, data => this.onIncomingSegment(data));

    // Note that TrainingComponent AND TrainingInstanceComponent will emit this after rendering
    this.props.eventbus.on(ee.TRAINING_RENDER_EVT, (trainingUuid) => {
      if (trainingUuid === this.props.trainingUuid) {
        this.props.eventbus.emit(ee.SEGMENT_GET_CMD, this.props.uuid, this.props.trainingUuid);
      }
    });

    this.props.eventbus.emit(ee.SEGMENT_GET_CMD, this.props.uuid, this.props.trainingUuid);
  }

  shouldComponentUpdate() {
    // TODO implement
    return true;
  }

  componentWillUnmount() {
   console.log(`SegmentComponent componentWillUnmount`);
    this.props.eventbus.removeListener(ee.SEGMENT_UPDATE_EVT, this.onIncomingSegment);
    this.props.eventbus.removeListener(ee.SEGMENT_GET_EVT, this.onIncomingSegment);
  }

  componentDidUnMount() {
    isMounted = false;
  }

  /**
   * Handle payload for incoming segments
   * @param {Segment|Object} data can be a Segment or a wrapped Segment
   */
  onIncomingSegment = (data) => {
    console.log(`SegmentComponent [${this.props.uuid}] onIncomingSegment: raw data ${JSON.stringify(data)}`);
    let _segment = {};
    if (hasProperty(data, "segment")) {
      _segment = data.segment;
    } else {
      _segment = data;
    }

    if (String(this.props.uuid) === String(_segment.uuid)) {
      console.log(`SegmentComponent onIncomingSegment uuids are equal as ${_segment.uuid}`);
      if (isMounted) {
        console.log(`SegmentComponent onIncomingSegment component is mounted`);
        this.setState({segment: _segment});
      }
    } else {
      // console.log(`SegmentComponent [${this.props.uuid}] onIncomingSegment NOT responding to event for [${_segment.uuid}]`);
    }
  };

  onChange = (evt) => {
    let val = evt.target.value;
    let name = evt.target.name;
    const _segment = this.state.segment;
    if (this.isDirtyValue(name, val)) {
      switch(name) {
        case "distance":
          _segment.distance = val;
        break;
        case "duration":
          _segment.duration = val;
        break;
        case "pace":
          _segment.pace = val;
        break;
      }
      if (_segment.uuid === null) {
        console.info(`SegmentComponent.onChange uuid was null, setting a new one as ${_segment.uuid}`);
        _segment.uuid = createUuid();
      }
      this.setState({segment: _segment});
    }
    // console.log(`SegmentComponent.onChange updated state: ${JSON.stringify(this.state)}`);
  };

  onDurationBlur = (evt) => {
    let val = evt.target.value;
    const _segment = clone(this.state.segment);
    _segment.duration = parseDuration(val);
    this.setState({segment: _segment});
  };

  onCalcButtonClick = (evt) =>{
    // only ask store to do something when the segment was eligible for augmentation (one changed and one empty field)
    if (canAugment(this.state.segment)) {
      // this.setState({isValid: isValidSegment(this.state.segment)});
      console.log(`SegmentComponent.onCalcButtonClick concludes the segment IS eligible for augment so SEGMENT_UPDATE_CMD`);
      this.props.eventbus.emit(ee.SEGMENT_UPDATE_CMD, this.state.segment);
    } else {
      // console.log(`SegmentComponent.onCalcButtonClick concludes the segment ${JSON.stringify(this.state.segment)} is not eligible for augment so no action`);
    }
  };

  onCloneButtonClick = () => {
    console.log(`SegmentComponent emits a SEGMENT_CLONE_CMD with ${JSON.stringify(this.state.segment)}`);
    this.props.eventbus.emit(ee.SEGMENT_CLONE_CMD, this.state.segment);
  };

  onRemoveButtonClick = () => {
    this.props.eventbus.emit(ee.SEGMENT_REMOVE_CMD, this.state.segment);
  };

  isDirtyValue(name, value) {
    return (this.state.segment[name] !== value);
  }

  render() {
    let _segment = {distance: 0, duration: "00:00:00", pace: "00:00", isValid: true, uuid: this.props.uuid, trainingUuid: this.props.trainingUuid};
    if (this.state.segment) {
      _segment = this.state.segment;
    }
    let rowClassName = (_segment.isValid) ? "segment valid" : "segment invalid";
    // <span>@400: {makePaceAt400(this.state.pace)}</span>
    return (
      <tr className={rowClassName}>
        <td><input type="text" name="distance" value={_segment.distance} onChange={this.onChange} className="type-double" /></td>
        <td><input type="text" name="duration" value={_segment.duration} onChange={this.onChange} onBlur={this.onDurationBlur} className="type-duration" /></td>
        <td><input type="text" name="pace" value={_segment.pace} onChange={this.onChange} className="type-time" /></td>
        <td>
          <button className="button-small button-primary" onClick={this.onCalcButtonClick}>Calc</button>
          <button className="button-small" onClick={this.onCloneButtonClick}>Clone</button>
          <button className="button-small button-warning" onClick={this.onRemoveButtonClick}>Remove</button>
        </td>
        <td><span>&nbsp;{_segment.uuid}</span></td>
      </tr>
    );
  }
};

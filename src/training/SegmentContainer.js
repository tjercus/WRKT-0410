import React from "react";
import EventEmitter from "eventemitter4";
import {canAugment, isValidSegment, parseDuration, augmentSegmentData} from "activity-segment";
import {createUuid, clone, hasProperty} from "object-utils-2";
import {EventsEnum as ee} from "../shell/constants";
import SegmentView from "./SegmentView";

let isMounted = false;

export default class SegmentContainer extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
    segment: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
    console.log("SegmentContainer.constructor", JSON.stringify(this.state.segment));
  }

  componentDidMount() {
    isMounted = true;
    // pass segment to state from props
    this.setState({ segment: this.props.segment},
      () => {console.log("SegmentContainer.mounted, state loaded from props")});
  }

  componentWillUnmount() {
    console.log(`SegmentComponent componentWillUnmount`);
  }

  componentDidUnMount() {
    isMounted = false;
  }

  shouldComponentUpdate = () => true;

  onChange = (evt) => {
    let val = evt.target.value;
    let name = evt.target.name;
    const _segment = this.state.segment;
    if (this.isDirtyValue(name, val)) {
      switch (name) {
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
        console.info(`SegmentContainer.onChange uuid was null, setting a new one as ${_segment.uuid}`);
        _segment.uuid = createUuid();
      }
      this.setState({segment: _segment});
    }
  };

  onDurationBlur = evt => {
    let val = evt.target.value;
    const _segment = clone(this.state.segment);
    _segment.duration = parseDuration(val);
    this.setState({segment: _segment});
  };

  onCalcButtonClick = evt => {
    // only ask store to do something when the segment was eligible for augmentation (one changed and one empty field)
    if (canAugment(this.state.segment)) {
      console.log(`SegmentContainer.onCalcButtonClick concludes the segment ${JSON.stringify(this.state.segment)} is updateable`);
      this.props.eventbus.emit(ee.SEGMENT_UPDATE_CMD, this.state.segment);
    }
  };

  onCloneButtonClick = () => {
    console.log(`SegmentContainer emits a SEGMENT_CLONE_CMD with ${JSON.stringify(this.state.segment)}`);
    this.props.eventbus.emit(ee.SEGMENT_CLONE_CMD, this.state.segment);
  };

  onRemoveButtonClick = () => {
    this.props.eventbus.emit(ee.SEGMENT_REMOVE_CMD, this.state.segment);
  };

  isDirtyValue(name, value) {
    return (this.state.segment[name] !== value);
  }

  render() {
    let _segment = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00",
      isValid: true,
      uuid: this.props.uuid,
      trainingUuid: this.props.trainingUuid
    };
    if (this.state.segment) {
      _segment = this.state.segment;
    }
    console.log("SegmentContainer.render", JSON.stringify(_segment));
    return <SegmentView
      segment={_segment}
      onChange={this.onChange}
      onCalcButtonClick={this.onCalcButtonClick}
      onCloneButtonClick={this.onCloneButtonClick}
      onRemoveButtonClick={this.onRemoveButtonClick}
    />;
  }

}
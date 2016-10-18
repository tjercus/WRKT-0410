import React from "react";
import EventEmitter from "eventemitter2";
import {isDirtySegment, canAugment, isValidSegment, parseDuration} from "../stores/segmentUtil";
import {createUuid, clone, hasProperty} from "../stores/miscUtil";

export default class SegmentComponent extends React.Component {

  constructor(props) {
    super(props);

    let isValid = true;
    if (hasProperty(props.segment, "isValid")) {
      isValid = props.segment.isValid;
    }
    this.state = {
      trainingUuid: clone(props.trainingUuid),
      uuid: clone(props.segment.uuid),
      distance: clone(props.segment.distance),
      duration: clone(props.segment.duration),
      pace: clone(props.segment.pace),
      isValid: clone(isValid)
    }
    this.onChange = this.onChange.bind(this);
    this.onCalcButtonClick = this.onCalcButtonClick.bind(this);
    this.onCloneButtonClick = this.onCloneButtonClick.bind(this);
    this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
    this.onDurationBlur = this.onDurationBlur.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on("SEGMENT_UPDATE_EVT", (data) => {
      if (this.state.uuid == data.segment.uuid) {
        this.setState({
          distance: data.segment.distance,
          duration: data.segment.duration,
          pace: data.segment.pace,
          isValid: data.segment.isValid
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.eventbus.removeAllListeners("SEGMENT_UPDATE_EVT");
  }

  onChange(evt) {
    let val = evt.target.value;
    let name = evt.target.name;
    if (this.isDirtyValue(name, val)) {
      switch(name) {
        case "distance":
          this.setState({distance: val});
        break;
        case "duration":
          this.setState({duration: val});
        break;
        case "pace":
          this.setState({pace: val});
        break;
      }
      if (this.state.uuid == null) {
        this.setState({uuid: createUuid()});
      }
    }
  }

  onDurationBlur(evt) {
    let val = evt.target.value;
    this.setState({duration: parseDuration(val)});
  }

  onCalcButtonClick(evt) {
    // only ask store to do something when the segment was eligable for augmentation (one changed and one empty field)
    if (canAugment(this.state)) {
      this.setState({isValid: isValidSegment(this.state)});
      this.props.eventbus.emit("SEGMENT_UPDATE_CMD", this.state);
    }
  }

  onCloneButtonClick() {
    this.props.eventbus.emit("SEGMENT_CLONE_CMD", this.state);
  }

  onRemoveButtonClick() {
    this.props.eventbus.emit("SEGMENT_REMOVE_CMD", this.state);
  }

  isDirtyValue(name, value) {
    return (this.state[name] !== value);
  }

  render() {
    let rowClassName = (this.state.isValid) ? "segment valid" : "segment invalid";
    // <span>@400: {makePaceAt400(this.state.pace)}</span>
    return (
      <tr className={rowClassName}>
        <td><input type="text" name="distance" value={this.state.distance} onChange={this.onChange} className="type-double" /></td>
        <td><input type="text" name="duration" value={this.state.duration} onChange={this.onChange} onBlur={this.onDurationBlur} className="type-duration" /></td>
        <td><input type="text" name="pace" value={this.state.pace} onChange={this.onChange} className="type-time" /></td>
        <td>
          <button className="button-small button-primary" onClick={this.onCalcButtonClick}>Calc</button>
          <button className="button-small" onClick={this.onCloneButtonClick}>Clone</button>
          <button className="button-small button-warning" onClick={this.onRemoveButtonClick}>Remove</button>
        </td>
      </tr>
    );
  }
};

SegmentComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  segment: React.PropTypes.object.isRequired,
  trainingUuid: React.PropTypes.string.isRequired,
};

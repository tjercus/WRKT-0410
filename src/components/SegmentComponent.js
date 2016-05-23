import React from "react";
import EventEmitter from "eventemitter2";
import {isDirtySegment, canAugment, isValidSegment} from "../stores/trainingUtil";

export default class SegmentComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      uuid: this.cloneValue(props.segment.uuid),
      distance: this.cloneValue(props.segment.distance),
      duration: this.cloneValue(props.segment.duration),
      pace: this.cloneValue(props.segment.pace),
      isValid: this.cloneValue(props.segment.isValid)
    }
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onCloneButtonClick = this.onCloneButtonClick.bind(this);
    this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
  }
  
  componentDidMount() {
    this.props.eventbus.on("SEGMENT_UPDATE_EVT", ((training) => {
      console.log("SegmentComponent caught SEGMENT_UPDATE_EVT " + JSON.stringify(training));
      if (this.state.uuid === training.segment.uuid) { // && isDirtySegment(training.segment, [this.state])
        // TODO fix
        this.setState({
          distance: training.segment.distance,
          duration: training.segment.duration,
          pace: training.segment.pace,
          isValid: training.segment.isValid
        });
      }
    }));
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
        this.setState({uuid: this.createUuid()});
      }     
    }    
  }

  onBlur(evt) {    
    let name = evt.target.name;
    // only ask store to do something when the segment was eligable for augmentation (one changed and one empty field)
    if (canAugment(this.state)) {
      this.props.eventbus.emit("SEGMENT_UPDATE_CMD", this.state);
    } else {
      console.log("onBlur (" + name + ") not sending event because segment was NOT eligable for augmentation");      
      this.setState({isValid: isValidSegment(this.state)});
    }
  }

  onCloneButtonClick() {
    console.log("SegmentComponent.onCloneButtonClick");
    this.props.eventbus.emit("SEGMENT_CLONE_CMD", this.state);
  }
  onRemoveButtonClick() {
    this.props.eventbus.emit("SEGMENT_REMOVE_CMD", this.state);
  }

  isDirtyValue(name, value) {
    let isDirty = (this.state[name] !== value);
    console.log("SegmentComponent.isDirtyValue: " + name + "/" + value + ", " + isDirty);
    return isDirty;
  }

  cloneValue(val) {
    return JSON.parse(JSON.stringify(val));
  }
  
  render() {
    let rowClassName = (this.state.isValid) ? "valid" : "invalid";
    return (
      <tr className={rowClassName}>
        <td><input type="text" name="distance" className="type-double" value={this.state.distance} onChange={this.onChange} onBlur={this.onBlur} /></td>
        <td><input type="text" name="duration" className="type-duration" value={this.state.duration} onChange={this.onChange} onBlur={this.onBlur} /></td>
        <td><input type="text" name="pace" className="type-time" value={this.state.pace} onChange={this.onChange} onBlur={this.onBlur} /></td>
        <td>
          <button className="button-small" onClick={this.onCloneButtonClick}>Clone</button>
          <button className="button-small button-warning" onClick={this.onRemoveButtonClick}>Remove</button>
        </td>
      </tr>
    );
  }
};

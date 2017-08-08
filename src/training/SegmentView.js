/**
 * View Component as pure function for rendering one Segment
 * @param {Object} props
 * @returns {XML} react jsx
 * @constructor
 */
const SegmentView = props => {
  let _segment = props.segment;
  let rowClassName = (_segment.isValid) ? "segment valid" : "segment invalid";
  // <span>@400: {makePaceAt400(props.state.pace)}</span>
  return (
    <tr className={rowClassName}>
      <td><input type="text" name="distance" value={_segment.distance} onChange={props.onChange}
                 className="type-double"/></td>
      <td><input type="text" name="duration" value={_segment.duration} onChange={props.onChange}
                 onBlur={props.onDurationBlur} className="type-duration"/></td>
      <td><input type="text" name="pace" value={_segment.pace} onChange={props.onChange}
                 className="type-time"/></td>
      <td>
        <button className="button-small button-primary" onClick={props.onCalcButtonClick}>Calc
        </button>
        <button className="button-small" onClick={props.onCloneButtonClick}>Clone</button>
        <button className="button-small button-warning" onClick={props.onRemoveButtonClick}>Remove
        </button>
      </td>
      <td><span>&nbsp;{_segment.uuid}</span></td>
    </tr>
  );
};

export default SegmentView;
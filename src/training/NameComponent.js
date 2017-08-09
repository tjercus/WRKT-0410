
import * as React from "react";

export default class NameComponent extends React.Component {

  constructor(props) {
    super(props);
    // console.log(`SegmentView props.uuid ${JSON.stringify(props.uuid)}`);

    this.state = {};
  }

  onEditNameButtonClick = evt => {
    this.setState({
      isNameEditable: !this.state.isNameEditable,
    });
  };

  static renderNameComponentTextField(config) {
    if (config.isNameEditable) {
      return (
        <input type="text"
               id="edit-name-textfield"
               name="edit-name-textfield"
               value={config.name}
               onChange={config.onNameChange}
               onBlur={config.onNameBlur} />
      );
    } else {
      return (<span id="name-label">{config.name}</span>);
    }
  }

  render() {
    const config = {...this.props, isNameEditable: this.state.isNameEditable};
    return <span>
      {NameComponent.renderNameComponentTextField(config)}
      <button id="edit-name-button"
              onClick={this.onEditNameButtonClick}
              className="button-small button-flat">{"edit"}</button>
    </span>;
  }
}


import * as React from "react";

export default class NameComponent extends React.Component {

  constructor(props) {
    super(props);
    // console.log(`SegmentView props.uuid ${JSON.stringify(props.uuid)}`);

    this.state = {}; // TODO set empty component?
  }

  onEditNameButtonClick = evt => {
    this.setState({
      isNameEditable: !this.state.isNameEditable,
    });
  };

  render() {
    let nameComponent = "";
    if (this.state.isNameEditable) {
      nameComponent = <span>
        <input type="text"
                     id="edit-name-textfield"
                     name="edit-name-textfield"
                     value={this.props.name}
                     onChange={this.props.onNameChange}
                     onBlur={this.props.onNameBlur} />
              <button id="edit-name-button" onClick={this.onEditNameButtonClick}
                      className="button-small button-flat">{"edit"}</button>
      </span>;
    } else {
      nameComponent = <span id="name-label">{this.props.name}</span>;
    }
    return nameComponent;
  }

}
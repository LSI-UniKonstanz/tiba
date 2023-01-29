import { React, Component } from "react";
import { trackPromise } from "react-promise-tracker";
import Upload from "../components/Upload";

const url = "http://127.0.0.1:8000/"


export default class Compare extends Component {
  constructor() {
    super();
    this.state = {
      //current upload
      upload: null,
      upload_successful: null,
      upload_response: null,
      upload_name: null,
      // arrayS with the names of all network images, the edge lists are retrivable from the server with the name
      groupA: [],
      groupB: [],
      // settings for transitions
      option: false,
      normalized: true,
      // settings for distances between transition networks
      configured: false,
    };
  }
  updateUpload = (obj) => {
    this.setState({
      [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]],

    }, () => {
      // validate upload and calculate behavior transition network with standard settings
      trackPromise(this.validateUpload());
      trackPromise(this.getTransitions());
    });
  };

  updateUploadName = (obj) => {
    this.setState(
      { [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]] },
      () => { }
    );
  };

  validateUpload = async () => {
    const formData = new FormData();
    formData.append("upload", this.state["upload"]);

    await fetch(url + "api/upload/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          upload_successful: data.success,
          upload_response: data.response,
        })
      )
  };

  getTransitions = async () => {
    const formData = new FormData();
    formData.append("upload", this.state["upload"]);
    formData.append("option", this.state["option"]);
    formData.append("normalized", this.state["normalized"]);

    await fetch(url + "api/transitions/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({
        groupA: [...this.state.groupA, this.state.upload_name + '/' + data.graph]
      }))
  };

  toggleValueInList(list, value) {
    if (list.includes(value)) {
      return list.filter(item => item !== value)
    }
    else {
      list.push(value)
      return list
    }
  }

  switchGroups = (e) => {
    const newGroupA = this.toggleValueInList(this.state.groupA, e.target.name)
    const newGroupB = this.toggleValueInList(this.state.groupB, e.target.name)
    this.setState({
      groupA: newGroupA,
      groupB: newGroupB,
      configured: true
    })
  }

  setDistanceAlg = (e) => {
    this.setState({
      distanceAlg: e.target.value,
      configured: true
    })
  }

  getDistances = async (networks, distanceAlg) => {
    const formData = new FormData();
    formData.append("networks", networks);
    formData.append("distanceAlg", distanceAlg);
    await fetch(url + "api/distances/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({
        distances: data.distances
      }))
  };

  render() {
    return (
      <div>
        <Upload
          passUpload={this.updateUpload}
          passName={this.updateUploadName}
        />
        <div className="padded text">
          <h3>Group A</h3>
          <div className="border background">
            {this.state.groupA.map(id => <span key={id}>
              <input type="checkbox" className="btn-check" id={id} name={id} autoComplete="off" onClick={this.switchGroups}></input>
              <label className="btn btn-primary custom-btn shadow-none" htmlFor={id}>{id.split('/')[0]}</label>
            </span>)}
          </div>
          <h3>Group B</h3>
          <div className="border background">
            {this.state.groupB.map(id => <span key={id}>
              <input type="checkbox" className="btn-check" id={id} name={id} autoComplete="off" onClick={this.switchGroups}></input>
              <label className="btn btn-primary custom-btn shadow-none" htmlFor={id}>{id.split('/')[0]}</label>
            </span>)}
          </div>

          {/*distance algorithm*/}
          <div className="mappings">
            <span><b>Distance algorithm:</b>&nbsp;&nbsp;&nbsp;</span>

            <select
              className="form-select"
              name="distanceAlg"
              id="distanceAlg"
              onChange={this.setDistanceAlg}
            >
              <option key="1" value="jaccard">
                Jaccard Distance
              </option>
              <option key="2" value="ged">
                Graph Edit Distance
              </option>
              <option key="3" value="npd">
                Network Portrait Divergence
              </option>
              <option key="4" value="frobenius">
                Frobenius Norm
              </option>
              <option key="5" value="hamming">
                Hamming Distance
              </option>
            </select>
          </div>
          {/* apply button to give changes to parent and thus request new calculation */}
          {this.state.configured && (<button type="button" className="btn btn-success btn-lg" onClick={this.getDistances}>Get network distances</button>)}
          {!this.state.configured && (<button type="button" className="btn btn-secondary btn-lg" disabled>Get network distances</button>)}
        </div>
        <div>
          {this.state.distances}
        </div>
      </div>
    );
  }
}

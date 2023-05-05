import { React, Component } from "react";
import { Table } from "react-bootstrap";
import { trackPromise } from "react-promise-tracker";
import Upload from "../components/Upload";
import { v4 as uuidv4 } from 'uuid';
import "../css/compare.css";

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
      configured: true,
      distanceAlg: "PortraitDivergence",
      setindices: false,
      setindices_mds: false,
      // mds
      random_state: 0,
      n_init: 4,
      // hierarchical clustering
      linkage: "average",
    };
  }
  updateUpload = (obj) => {
    this.setState({
      [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]],
    }, () => {
      // validate upload and calculate behavior transition network with standard settings
      trackPromise(this.validateUpload())
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

  svgToGML(str) {
    return str.slice(0, -7) + ".gml"
  }

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
      .then((data) => {
        {/* only add if upload was parsed successfully */ }
        if (data.graph !== "") {
          this.setState({
            groupA: [...this.state.groupA, this.state.upload_name + '/' + this.svgToGML(data.graph)]
          })
        }
      })
  }

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
    formData.append("groupA", JSON.stringify(this.state.groupA))
    formData.append("groupB", JSON.stringify(this.state.groupB));
    formData.append("distanceAlg", this.state.distanceAlg);
    formData.append("setindices", this.state["setindices"]);
    formData.append("random_state", this.state["random_state"]);
    formData.append("n_init", this.state["n_init"]);
    formData.append("linkage", this.state["linkage"]);

    await fetch(url + "api/distances/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({
        image: data.image_url,
        image2: data.image2_url,
        dist_matrix: JSON.parse(data.dist_matrix),
        node_dict: data.node_dict,
        labels: JSON.parse(data.labels),
      }))
    console.log(this.state.labels);
  };


  render() {
    return (
      <div>
        <div className="sidenav">
          <Upload
            passUpload={this.updateUpload}
            passName={this.updateUploadName}
          />
          <div className="padded">
            <h3>Settings</h3>
            <div className="border background ">
              <span><b>Set graph distance method - </b><a href="https://netrd.readthedocs.io/en/latest/distance.html">docs </a>&nbsp;&nbsp;&nbsp;</span>
              <br></br>
              <select
                className="form-select"
                name="distanceAlg"
                id="distanceAlg"
                onChange={this.setDistanceAlg}
              >
                <option key="1" value="PortraitDivergence">
                  Network Portrait Divergence
                </option>
                <option key="2" value="JaccardDistance">
                  Jaccard Distance (unweighted)
                </option>
                <option key="3" value="DistributionalNBD">
                  DistributionalNBD (unweighted)
                </option>
                <option key="4" value="Frobenius">
                  Frobenius (unweighted)
                </option>
                <option key="5" value="Hamming">
                  Hamming Distance (unweighted)
                </option>
                <option key="6" value="IpsenMikhailov">
                  IpsenMikhailov (unweighted)
                </option>
                <option key="7" value="PolynomialDissimilarity">
                  PolynomialDissimilarity (unweighted)
                </option>
                <option key="8" value="DegreeDivergence">
                  DegreeDivergence (unweighted)
                </option>
              </select>
              <br></br>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="setindices" onChange={(e) => this.setState({ setindices: e.target.checked })}></input>
                <label class="form-check-label" for="flexCheckDefault">
                  <b>Enumerate</b> the uploaded data
                </label>
              </div>
            </div>
            <br></br>
            {/* apply button to give changes to parent and thus request new calculation */}
            {this.state.configured && (<button type="button" className="btn btn-success btn-lg" onClick={() => trackPromise(this.getDistances())}>Compute distances</button>)}
            {!this.state.configured && (<button type="button" className="btn btn-secondary btn-lg" disabled>Compute distances</button>)}
          </div>
        </div>

        <div className="main">
          {/* Introductory description of how to apply and interpret the comparisons  */}
          <div className="padded text">
            <h3> Description and Usage instructions</h3>
            <div className="border background">
              <p> This page processes datasets from <a href="https://www.boris.unito.it/">BORIS</a> and is used to compare behavior transition networks. For the purpose of comparison, a standardized transition network is created uniformly for all uploaded datasets. This uses individual behaviors as nodes and the relative frequency of behavior successions as a weighting for directed edges (to the respective consecutive behavior). To visualize a single dataset, please go to the main page.
              </p>
              <br></br>
              <p><b>1.</b> <b>File Upload</b> - use the upload widget multiple times to upload data. The first character is used as index. To remove an uploaded dataset, click on it. </p>
              <p><b>2. Set settings</b> - choose the distance measure to apply (and optionally enumerate the data.)</p>
              <p><b>3. Compute </b> the transition network for each upload and apply the chosen distance measure to compare them in pairs.
                The resulting distance matrix will show up, together with two visualizations of the distances: Multidimensional scaling and hierarchical clustering</p>
              <br></br>
            </div>
          </div>
          {/* If upload not successful, show http error response */}
          {this.state.upload_response && (
            <div className="padded text">
              <h3>Unfortunately we cannot handle the provided data for the following reasons:</h3>
              <div className="border background">
                {this.state.upload_response.split("\n").map((err) => (
                  <h4 className="red">{err}</h4>
                ))}
              </div>
            </div>
          )}
          {/* Display the uploaded data  */}
          {this.state.groupA.length !== 0 &&
            <div className="padded text">
              <h3>Loaded data</h3>
              <div className="border background">
                {this.state.groupA.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={id} name={id} autoComplete="off" onClick={this.switchGroups}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={id}>{id.split('/')[0]}</label>
                </span>)}
              </div>
            </div>
          }
          {/* Introductory description of how to apply and interpret the comparisons  */}
          {this.state.dist_matrix && <div className="padded text">
            <h3> Resulting distance matrix</h3>
            <div className="border background">
              <Table striped bordered>
                <thead>
                  <tr>
                    {/* Add empty cell for the top-left corner */}
                    <th></th>
                    {this.state.labels.map((label) => (
                      <th key={uuidv4()}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {this.state.dist_matrix.map((row, rowIndex) => (
                    <tr key={uuidv4()}>
                      {/* Add row label to the left */}
                      <th>{this.state.labels[rowIndex]}</th>
                      {row.map((distValue, colIndex) => (
                        <td key={uuidv4()}>{distValue.toString().substr(0, 4)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <br></br>
              {/* {this.state.node_dict} */}
            </div>
          </div>
          }

          {/* Multidimensional scaling output image and params, only visible when distances are calculated  */}
          {this.state.dist_matrix &&
            <div className="padded text">
              <h3>Multidimensional scaling (MDS)</h3>
              <div className="border background ">
                <p>Multidimensional scaling (MDS) seeks a low-dimensional representation of the data in which the distances respect well the distances in the original high-dimensional space. In general, MDS is a technique used for analyzing similarity or dissimilarity data. It attempts to model similarity or dissimilarity data as distances in a geometric space (<a href="https://scikit-learn.org/stable/modules/manifold.html#multidimensional-scaling">documentation for scikit-learn MDS </a>).
                  <br></br><br></br>As network distances are non-metric, the algorithms will try to preserve the order of the distances, and hence seek for a monotonic relationship between the distances in the embedded space and the similarities/dissimilarities.</p>

                <span><b>Set random state (<a href="https://scikit-learn.org/stable/modules/generated/sklearn.manifold.MDS.html#sklearn.manifold.MDS">docs</a>):</b>&nbsp;&nbsp;&nbsp;</span>
                <input
                  type="number"
                  className="form-control"
                  name="random_state"
                  id="random_state"
                  min="0"
                  max="1000"
                  defaultValue={0}

                  onChange={(e) => this.setState({ random_state: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  style={{ width: '150px' }}
                ></input>
                <br></br>
                <span><b>Set n_init(<a href="https://scikit-learn.org/stable/modules/generated/sklearn.manifold.MDS.html#sklearn.manifold.MDS">docs</a>):</b>&nbsp;&nbsp;&nbsp;</span>
                <input
                  type="number"
                  className="form-control"
                  name="random_state"
                  id="random_state"
                  min="4"
                  max="1000"
                  defaultValue={4}
                  onChange={(e) => this.setState({ n_init: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  style={{ width: '150px' }}

                ></input>
                <br></br>
                <button type="button" className="btn btn-success" onClick={() => trackPromise(this.getDistances())}>Recalculate</button>
                <div className="imgbox">
                  <img className="center-fit" src={this.state.image} alt="need to load data and get distances first" />
                </div>
              </div>
            </div>
          }
          {/* Hierarchical clustering output image and params, only visible when distances are calculated  */}
          {this.state.dist_matrix &&
            <div className="padded text">
              <h3>Hierarchical clustering</h3>
              <div className="border background ">
                <p> Hierarchical clustering is a general family of clustering algorithms that build nested clusters by merging or splitting them successively. This hierarchy of clusters is represented as a tree (or dendrogram). The root of the tree is the unique cluster that gathers all the samples, the leaves being the clusters with only one sample.
                  (<a href="https://scikit-learn.org/stable/modules/manifold.html#hierarchical-clustering">documentation for scikit-learn MDS </a>)
                </p>
                {/* select linkage criterion */}
                <span><b>Set linkage criterion </b></span>
                <br></br>
                <select
                  className="form-select"
                  name="linkage"
                  id="linkage"
                  onChange={(e) => this.setState({ linkage: e.target.value })}
                >
                  <option key="1" value="average">
                    average
                  </option>
                  <option key="2" value="complete">
                    complete
                  </option>
                  <option key="4" value="single">
                    single
                  </option>
                </select>
                <br></br>
                <button type="button" className="btn btn-success" onClick={() => trackPromise(this.getDistances())}>Recalculate</button>
                <div className="imgbox">
                  <img className="center-fit" src={this.state.image2} alt="need to load data and get distances first" />
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

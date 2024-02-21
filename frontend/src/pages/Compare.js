import { React, Component } from "react";
import { Table } from "react-bootstrap";
import { trackPromise } from "react-promise-tracker";
import Upload from "../components/Upload";
import { v4 as uuidv4 } from 'uuid';
import "../css/compare.css";
import example from "../data/download-example.xlsx";


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
      setindices: true,
      // mds
      random_state: 0,
      n_init: 4,
      // hierarchical clustering
      linkage: "average",
      color_threshold: 0.2,
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
    formData.append("for_comparison", true);


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
    formData.append("color_threshold", this.state["color_threshold"]);


    await fetch(url + "api/distances/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({
        image: data.image_url,
        image2: data.image2_url,
/*         image3: data.image3_url,
        image4: data.image4_url,
        image5: data.image5_url, */
        dist_matrix: JSON.parse(data.dist_matrix),
        node_dict: data.node_dict,
        labels: JSON.parse(data.labels),
      }))
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
              <span><b>Set graph distance method - </b><a target="_blank" href="https://netrd.readthedocs.io/en/latest/distance.html">docs </a>&nbsp;&nbsp;&nbsp;</span>
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
                <option key="8" value="DegreeDivergence">
                  DegreeDivergence (unweighted)
                </option>
              </select>
              <br></br>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="setindices" checked={this.state.setindices} onChange={(e) => this.setState({ setindices: e.target.checked })}></input>
                <label className="form-check-label" htmlFor="flexCheckDefault">
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
              <p> This page generates and compares behavior transition networks on behavior data. 
                The data input has to adhere to the format of the
                <a href={example} download="example.xlsx">{" "}{"template file \u21E9 "}{" "}</a>. 
              Such data can for example be obtained from event-logging software <a target="_blank" href="https://www.boris.unito.it/">BORIS</a>.
              For the purpose of comparison, a standardized transition network is created uniformly for all uploaded datasets. 
              This uses individual behaviors as nodes and the relative frequency of behavior successions as a weighting for directed edges (to the respective consecutive behavior). 
              The resulting transition networks will be compared with the chosen distance measure. Only the Network Portrait Divergence (default setting) is including the edge weights into the computation. Thus, all the other distance measures only compare the existence of behavioral transitions, not their relative frequency.
              To visualize a single dataset, please go to the main page.
              </p>
              <br></br>
              <p><b>1.</b> <b>File Upload</b> - use the upload widget <b>multiple times</b> to upload data. The first two characters of the filename are used as index. To further append a number to each upload, click the checkbox "Enumerate the uploaded data". To remove an uploaded dataset, click on it. </p>
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
            <p>Here are the pairwise distances of the transition networks generated on the uploaded datasets. The order of the datasets/labels corresponds to the order in which they were uploaded. The symmetry of the distance matrix, that the upper right half corresponds to the lower left half, comes from the symmetry property of the distances. We want to clarify that the distances are non-metric. This means that the triangle inequality does not hold in general. 
            </p>

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
              <div className="border background">
                <p>Multidimensional Scaling (MDS) is a statistical technique used to visualize the relative similarities or dissimilarities among a set of objects based on a distance matrix. First, the distance matrix is computed with the distance measure selected by the user. MDS then reduces the dimensionality of the data (number of behavior transition networks) to a lower-dimensional space (two dimensions). This reduction aims to preserve the original distances between networks as much as possible. The reduced-dimensional representation obtained through MDS is then plotted in a scatterplot, where each point represents a behavior transition network. The distances between points in the plot reflect the dissimilarities between the corresponding networks in the original data. Networks that appear close together in the MDS plot have similar transition patterns between behaviors. Networks that are distant from others may represent unique or distinct behavioral states or patterns. The arrangement of points in the plot may suggest transitional pathways between different behavioral states or clusters. 
                  To inspect the algorithm, see the <a target="_blank" href="https://scikit-learn.org/stable/modules/manifold.html#multidimensional-scaling">docs for multidimensional scaling (sklearn) </a>.</p>
                  <br></br>
                <span><b>Set random state (<a target="_blank" href="https://scikit-learn.org/stable/modules/generated/sklearn.manifold.MDS.html#sklearn.manifold.MDS">docs</a>)</b>: As Multidimensional scaling is non-deterministic, a random seed must be chosen. Select the same value across different runs for consistent results.&nbsp;&nbsp;&nbsp;</span>
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
                <span><b>Set n_init(<a target="blank" href="https://scikit-learn.org/stable/modules/generated/sklearn.manifold.MDS.html#sklearn.manifold.MDS">docs</a>)</b>: Number of times the SMACOF algorithm will be run with different initializations. The final results will be the best output of the runs, determined by the run with the smallest final stress. The larger the value, the "better" the results, but computation time will increase as well. &nbsp;&nbsp;&nbsp;</span>
               <br></br>
                <input
                  type="number"
                  className="form-control"
                  name="random_state"
                  id="random_state"
                  min="4"
                  max="1000"
                  defaultValue={30}
                  onChange={(e) => this.setState({ n_init: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  style={{ width: '150px' }}

                ></input>
                <br></br>
                <button type="button" className="btn btn-success" onClick={() => trackPromise(this.getDistances())}>Recalculate</button>
                <div className="imgbox">
                  <img className="center-fit" src={this.state.image} alt="Unable to load. Did you select at least two distinct datasets?" />
                </div>
              </div>
            </div>
          }
          {/* 3d graph with edges corresponding to edge weight, only visible when distances are calculated  */}
{/*           {this.state.dist_matrix &&
            <div className="padded text">
              <h3>3D graph prototype</h3>
              <div className="border background">
                <p>edge length correspond to inverse edge weigth, networkx spring layout (randomized)</p>
                <div className="image-container">
                <img src={this.state.image3} alt="need to load data and get distances first" />
                  <img  src={this.state.image4} alt="need to load data and get distances first" />
                  <img  src={this.state.image5} alt="need to load data and get distances first" />
                </div>
              </div>
            </div>
          } */}
          {/* Hierarchical clustering output image and params, only visible when distances are calculated  */}
          {this.state.dist_matrix &&
            <div className="padded text">
              <h3>Hierarchical clustering</h3>
              <div className="border background ">
                <p> Hierarchical (agglomerative) clustering is a method used to cluster similar objects into groups based on their pairwise similarities or dissimilarities. Similar to MDS, a distance matrix serves as the basis for the clustering. Hierarchical clustering proceeds by iteratively merging clusters until all objects belong to a single cluster. See for further information the <a target="_blank" href="https://scikit-learn.org/stable/modules/generated/sklearn.cluster.AgglomerativeClustering.html">docs for hierarchical clustering (sklearn) </a>.</p>
                <p>The resulting dendrogram or cluster tree shows the hierarchical relationships between clusters. Distinct clusters or branches in the dendrogram may correspond to species or groups of individuals exhibiting specific behavioral characteristics. Further, the branching structure of the dendrogram can reveal hierarchical relationships between different behavioral clusters, indicating transitions between different levels of behavioral complexity.
                </p>
                <p></p>
                {/* select linkage criterion */}
                <span><b>Set linkage criterion </b>: The algorithm will merge the pairs of cluster that minimize this criterion. Average linkage computes the average distance between all pairs of points in two clusters. It tends to produce clusters with more uniform sizes. Complete linkage measures the maximum distance between any pair of points in two clusters. It tends to create compact clusters, suitable for identifying distinct groups. Single linkage determines the distance between the closest points (minimum distance) of two clusters. It tends to form clusters with elongated or chain-like shapes.</span>
                <br></br>
                <select
                  className="form-select"
                  name="linkage"
                  id="linkage"
                  style={{ width: '200px' }}
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

                {/* choose color threshold */}
                <span><b>Set color threshold: </b>Colors all the descendent links below a cluster node  <i>k</i> the same color if <i>k</i> is the first node below the cut threshold.</span>
                <input
                  className="form-control"
                  name="color_threshold"
                  id="color_threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0.2"
                  onChange={(e) => this.setState({ color_threshold: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  style={{ width: '200px' }}
                ></input>

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

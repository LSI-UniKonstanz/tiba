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
      .then((data) => this.setState({
        groupA: [...this.state.groupA, this.state.upload_name + '/' + this.svgToGML(data.graph)]
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
        image3: data.image3_url,
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
          <h3>Loaded data</h3>
          <div className="border background">
            {this.state.groupA.map(id => <span key={id}>
              <input type="checkbox" className="btn-check" id={id} name={id} autoComplete="off"></input>
              <label className="btn btn-primary custom-btn shadow-none" htmlFor={id}>{id.split('/')[0]}</label>
            </span>)}
          </div>
          {/* <h3>Group B</h3>
          <div className="border background">
            {this.state.groupB.map(id => <span key={id}>
              <input type="checkbox" className="btn-check" id={id} name={id} autoComplete="off" onClick={this.switchGroups}></input>
              <label className="btn btn-primary custom-btn shadow-none" htmlFor={id}>{id.split('/')[0]}</label>
            </span>)}
          </div> */}
        </div>
        {/*distance algorithm*/}
        <div className="padded text">
          <h3>Settings</h3>
          <div className="border background ">
            <span><b>Set graph distance method. </b> See <a href="https://netrd.readthedocs.io/en/latest/distance.html">netrd documentation</a> for detailed information:&nbsp;&nbsp;&nbsp;</span>
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
                <b>Set indices</b> for the uploaded data
              </label>
            </div>
          </div>
          <br></br>
          {/* apply button to give changes to parent and thus request new calculation */}
          {this.state.configured && (<button type="button" className="btn btn-success btn-lg" onClick={() => trackPromise(this.getDistances())}>Get network distances</button>)}
          {!this.state.configured && (<button type="button" className="btn btn-secondary btn-lg" disabled>Get network distances</button>)}
        </div>

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
      </div>
    );
  }
}

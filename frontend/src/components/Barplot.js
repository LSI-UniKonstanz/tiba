import { React } from "react";
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'


export default function Barplot(props) {

  // request new calculation if user clicks on apply changes
  const applyChanges = () => {
    props.passValues({
      request_new_barplot: true
    })
    props.passValues({
      barplot_new_config: false
    })
  }

  // Passes a new list after Subject selection to parent component Generate.js
  const handleIDSelect = (e) => {
    const newList = toggleValueInList(props.barplot_id_list, e.target.name)
    props.passValues({
      barplot_id_list: newList,
    });
    props.passValues({
      barplot_new_config: true
    });
  }

  //passes a new list after behavior selection to parent component Generate.js
  const handleBehaviorSelect = (e) => {
    const newList = toggleValueInList(props.barplot_bhvr_list, e.target.name)
    props.passValues({
      barplot_bhvr_list: newList
    });
    props.passValues({
      barplot_new_config: true
    });
  }

  //passes a new list after behavior selection to parent component Generate.js
  const handleCategorySelect = (e) => {
    const newList = toggleValueInList(props.barplot_cat_list, e.target.name)
    props.passValues({
      barplot_cat_list: newList,
    });
    props.passValues({
      barplot_new_config: true
    });
  }

  // accepts an list and an value. Adds the value if not present
  // and remove it if present
  function toggleValueInList(list, value) {
    if (list.includes(value)) {
      return list.filter(item => item !== value)
    }
    else {
      list.push(value)
      return list
    }
  }


  //export/download svg
  const downloadSVG = () => {
    let url = props.image
    let filename = props.upload_name.split(' ').join('_') + "_barplot"
    saveAs(url, filename);
  }

  return (
    <div className="padded text">
      <h3>Distinct behavior chart</h3>
      <div className="border background">
        <p>The distinct behavior chart visually represents the distribution of behaviors, offering options to display either the number of observations or their total duration as a bar chart. Alternatively, a relative display option presents the data as a pie chart. Behavioral categories can also be displayed instead of individual behaviors. Individuals, behaviors (or behavioral categories, if selected) can be excluded from the calculation by clicking the button representing the respective individual or behavior. </p>
        <p><b>Selected behaviors (or behavioral categories), that are not shown by the selected individuals are not displayed.</b></p><br></br>
        <hr></hr>
        {/*switch behavioral categories / behaviors*/}
        <div className="margin-switches">
          <span><b>X-Values:</b>&nbsp;&nbsp;&nbsp;</span>
          <BootstrapSwitchButton
            onlabel='Behavioral categories'
            offlabel='Behaviors'
            offstyle="primary"
            onstyle="primary"
            width="300"
            onChange={(checked) => {
              props.passValues({ barplot_plot_categories: checked })
              // Reset selected behaviors/categories onChange
              if (checked) {
                props.passValues({ barplot_cat_list: props.categories })
              } else {
                props.passValues({ barplot_bhvr_list: props.behaviors })
              }
              props.passValues({ barplot_new_config: true, })
            }}
          />
        </div>
        {/*switch for plotting the total time instead of the count of occurences */}
        <div className="margin-switches">
          <span><b>Y-Values:</b>&nbsp;&nbsp;&nbsp;</span>
          <BootstrapSwitchButton
            onlabel='Total time'
            offlabel='Count of occurences'
            offstyle="primary"
            onstyle="primary"
            width="300"
            onChange={(checked) => {
              props.passValues({ barplot_plot_total_time: checked })
              props.passValues({ barplot_new_config: true, })
            }}
          />
        </div>
        {/*switch for cumulative or separate behaviors */}
        <div className="margin-switches">
          <span><b>Display:</b>&nbsp;&nbsp;&nbsp;</span>
          <BootstrapSwitchButton
            onlabel='Pie chart'
            offlabel='Bar chart'
            offstyle="primary"
            onstyle="primary"
            width="300"
            onChange={(checked) => {
              props.passValues({ barplot_relative: checked })
              props.passValues({ barplot_new_config: true, })
            }}
          />
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Deselect Subjects</th>
              {!props.plot_categories && (<th>Deselect Behaviors</th>)}
              {props.plot_categories && (<th>Deselect Behavioral Categories</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {props.ids.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={'barplotid' + id} name={id} autoComplete="off" onChange={handleIDSelect}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={'barplotid' + id}>{id}</label>
                </span>)}
              </td>
              {<td>
                {/*display behaviors if network is using behaviors as nodes*/}
                {!props.plot_categories && (
                  props.behaviors.map(id => <span key={id}>
                    <input type="checkbox" className="btn-check" id={'barplotb' + id} name={id} autoComplete="off" onChange={handleBehaviorSelect}></input>
                    <label className="btn btn-primary custom-btn shadow-none" htmlFor={'barplotb' + id}>{id}</label>
                  </span>)
                )}
                {/*display categories if network is using categories as nodes*/}
                {props.plot_categories && (
                  props.categories.map(id => <span key={id}>
                    <input type="checkbox" className="btn-check" id={'barplotc' + id} name={id} autoComplete="off" onChange={handleCategorySelect}></input>
                    <label className="btn btn-primary custom-btn shadow-none" htmlFor={'barplotc' + id}>{id}</label>
                  </span>)
                )}
              </td>}
            </tr>
          </tbody>
        </Table>

        <div className="left-panel-25">
          {/* apply button to give changes to parent and thus request new calculation */}
          {props.barplot_new_config && (<button type="button" className="btn btn-success btn-lg" onClick={applyChanges}>Apply changes</button>)}
          {!props.barplot_new_config && (<button type="button" className="btn btn-secondary btn-lg" disabled>Apply changes</button>)}
        </div>
        <div className="right-panel-75">
          {/* download image */}
          <button type="button" className="btn btn-link custom-btn" onClick={downloadSVG}>{" "}{"\u21E9 export Image (.svg)"}{" "}</button>
        </div>
        <div className="imgbox">
          <img className="center-fit" src={props.image} alt="unable to load, bad parameters" />
        </div>
      </div>
    </div >
  );
}

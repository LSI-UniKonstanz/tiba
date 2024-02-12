import { React, useState } from "react";
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'


export default function TimeSeries(props) {
    const [selectedID, setSelectedID] = useState(props.ids[0]);

    // request new calculation if user clicks on apply changes
    const applyChanges = () => {
        props.passValues({
            request_new_timeseries: true
        })
        props.passValues({
            timeseries_new_config: false
        })
    }

    // Passes a new list after Subject selection to parent component Generate.js
    const handleIDSelect = (e) => {
        const id = e.target.name;
        setSelectedID(id);
        props.passValues({
            timeseries_id_list: [id],
        });
        props.passValues({
            timeseries_new_config: true
        });
    }

    //passes a new list after behavior selection to parent component Generate.js
    const handleBehaviorSelect = (e) => {
        const newList = toggleValueInList(props.timeseries_bhvr_list, e.target.name)
        props.passValues({
            timeseries_bhvr_list: newList
        });
        props.passValues({
            timeseries_new_config: true
        });
    }

    //passes a new list after behavior selection to parent component Generate.js
    const handleCategorySelect = (e) => {
        const newList = toggleValueInList(props.timeseries_cat_list, e.target.name)
        props.passValues({
            timeseries_cat_list: newList,
        });
        props.passValues({
            timeseries_new_config: true
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
        let filename = props.upload_name.split(' ').join('_') + "_timeseries"
        saveAs(url, filename);
    }

    return (
        <div className="padded text">
            <h3>Time Series</h3>
            <div className="border background">
                <p>The Time Series generates a time-series plot of behaviors or behavioral categories for a single subject. Each distinct behavior is depicted as a colored horizontal line, indicating when and for how long a behavior or behavioral category is shown.</p>
                <br></br>
                <hr></hr>
                {/*switch behavioral categories / behaviors*/}
                <div className="margin-switches">
                    <span><b>Values:</b>&nbsp;&nbsp;&nbsp;</span>
                    <BootstrapSwitchButton
                        onlabel='Behavioral categories'
                        offlabel='Behaviors'
                        offstyle="primary"
                        onstyle="primary"
                        width="300"
                        onChange={(checked) => {
                            props.passValues({ timeseries_plot_categories: checked })
                            // Reset selected behaviors/categories onChange
                            if (checked) {
                                props.passValues({ timeseries_cat_list: props.categories })
                            } else {
                                props.passValues({ timeseries_bhvr_list: props.behaviors })
                            }
                            props.passValues({ timeseries_new_config: true, })
                        }}
                    />
                </div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Select Subject</th>
                            {!props.plot_categories && (<th>Select Behaviors</th>)}
                            {props.plot_categories && (<th>Select Behavioral Categories</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {props.ids.map(id => (
                                    <span key={id}>
                                        <input
                                            type="checkbox"
                                            className="btn-check"
                                            id={'timeseriesid' + id}
                                            name={id}
                                            autoComplete="off"
                                            onChange={handleIDSelect}
                                            checked={selectedID !== id}
                                        />
                                        <label
                                            className="btn btn-primary custom-btn shadow-none"
                                            htmlFor={'timeseriesid' + id}
                                        >
                                            {id}
                                        </label>
                                    </span>
                                ))}
                            </td>
                            {<td>
                                {/*display behaviors if network is using behaviors as nodes*/}
                                {!props.plot_categories && (
                                    props.behaviors.map(id => <span key={id}>
                                        <input type="checkbox" className="btn-check" id={'timeseriesb' + id} name={id} autoComplete="off" onChange={handleBehaviorSelect}></input>
                                        <label className="btn btn-primary custom-btn shadow-none" htmlFor={'timeseriesb' + id}>{id}</label>
                                    </span>)
                                )}
                                {/*display categories if network is using categories as nodes*/}
                                {props.plot_categories && (
                                    props.categories.map(id => <span key={id}>
                                        <input type="checkbox" className="btn-check" id={'timeseriesc' + id} name={id} autoComplete="off" onChange={handleCategorySelect}></input>
                                        <label className="btn btn-primary custom-btn shadow-none" htmlFor={'timeseriesc' + id}>{id}</label>
                                    </span>)
                                )}
                            </td>}
                        </tr>
                    </tbody>
                </Table>

                <div className="left-panel-25">
                    {/* apply button to give changes to parent and thus request new calculation */}
                    {props.timeseries_new_config && (<button type="button" className="btn btn-success btn-lg" onClick={applyChanges}>Apply changes</button>)}
                    {!props.timeseries_new_config && (<button type="button" className="btn btn-secondary btn-lg" disabled>Apply changes</button>)}
                </div>
                <div className="right-panel-75">
                    {/* download image */}
                    <button type="button" className="btn btn-link custom-btn" onClick={downloadSVG}>{" "}{"\u21E9 export Image (.svg)"}{" "}</button>
                </div>
                <div className="imgbox">
                    <img className="center-fit" src={props.image} alt="Could not handle request. Try other parameters." />
                </div>
            </div>
        </div >
    );
}

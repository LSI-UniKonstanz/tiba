import React from "react";
import Form from 'react-bootstrap/Form';

export default function Upload(props) {
  /**
   * Enables the user to upload a file
   */

  const upload_name = "upload_name";

  //pass input files to parent component (multiple files are passed after each other)
  const handleFileChange = (e) => {
    props.passUpload({
      [e.target.name]: e.target.files[0],
    });
    props.passName({
      [upload_name]: e.target.files[0].name,
    });
  };

  //return the title followed by description and file input widget
  return (
    <div className="padded text">
      <h3>File Upload</h3>

      <div className=" background">
        <b>No data?</b> Export from <a href="https://www.boris.unito.it/">BORIS</a>
        <ul>
          <li><b>Accepted filetypes</b>: <i>.xlsx</i>, <i>.csv</i>
          </li>
          <li><b>Required columns</b>: <i>Time</i>, <i>Subject</i>, <i>Behavior</i>, <i>Status</i></li>
        </ul>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Control type="file" name="upload"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />
        </Form.Group>
      </div>
    </div>
  );
}

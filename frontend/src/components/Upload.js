import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Form from 'react-bootstrap/Form';

export default function Upload(props) {
  /**
   * Enables the user to upload a file
   */

  const upload_name = "upload_name";
  const description = `
* **Accepted filetypes**: *.xlsx*, *.csv*
* **Required columns**: *Time*, *Subject*, *Behavior*
* **Optional columns**: *Modifier 1*, *Behavioral category*, *Status*
`;

  //pass input files to parent component (multiple files are passed after each other)
  const handleFileChange = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      props.passUpload({
        [e.target.name]: e.target.files[i],
      });
      props.passName({
        [upload_name]: e.target.files[i].name,
      });
    };
  };

  //return the title followed by description and file input widget
  return (
    <div className="padded text">
      <h3>File Upload</h3>
      <div className="border background">

        <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Control type="file" name="upload"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            onChange={handleFileChange}
          />
        </Form.Group>
      </div>
    </div>
  );
}

import React from "react";

// Short description of stuff related to the tool
function About() {
  return (
    <div>
      {/* Development */}
      <div className="padded text">
        <h3>Development</h3>
        <div className="border background">
          The tool is developed at the Chair for Life Science Informatics at University of Konstanz in Germany.
          The aim is to provide support for the analysis of biological networks and systems.
          The current website focus lies on the interactive visualization of behaviour data and we are working on the extension of the functionality to upload and generate the transition network on multiple datasets at once,
          thus enabling the comparison and clustering of these.
        </div>
      </div>
      {/* Contact */}
      <div className="padded text">
        <h3>Contact</h3>
        <div className="border background">
          Please feel free to reach out to nicolai.kraus@uni-konstanz.de for recommendations, bug reports or similar.
        </div>
      </div>
      {/* Credits */}
      <div className="padded text">
        <h3>Credits</h3>
        <div className="border background">
          <p>TIBA is developed entirely with open source software.</p>
          <p><a href="https://www.python.org/">Python 3.8</a> is used for data handling and analysis</p>
          <p><a href="https://www.djangoproject.com/">Django</a> is used to make the Python functions available as API</p>
          <p><a href="https://networkx.org/">Networkx</a> python library is used to create and manipulate the interaction and transition networks</p>
          <p><a href="https://www.matplotlib.org/">Matplotlib</a> python plotting library is used for the plots</p>
          <p><a href="https://www.graphviz.org/">Graphviz</a> graph visualization software is used for the visualization of the interaction and transition graphs</p>
          <p><a href="https://reactjs.org/">React</a> is used for the User Interface</p>
        </div>
      </div>
    </div>
  );
}

export default About;

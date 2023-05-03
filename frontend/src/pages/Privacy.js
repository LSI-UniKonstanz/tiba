import React from "react";

// Data on data protection/privacy policy
function Privacy() {
  return (
    <div>
      {/* Data protection */}
      <div className="padded text">
        <h3>Information on data protection</h3>
        <div className="border background">
          <h4>I. Name and address of the data protection officer</h4>
          <p>
            The university's data protection officer is:<br></br> <br></br>DDSK GmbH <br></br> Irina Weiß <br></br>
            Email: <a href="mailto:datenschutzbeauftragter@uni-konstanz.de">datenschutzbeauftragter@uni-konstanz.de</a>
            <br></br>
            Website: <a href="https://www.uni-konstanz.de/en/data-protection/">Data protection officer</a>
          </p>
          <h4>II. Name and address of the responsible institution</h4>
          <p>
            The  responsible institution as per the General Data Protection Regulation (GDPR), other national data protection laws of the member states as well as additional data protection regulations is the: <br></br><br></br>
            University of Konstanz <br></br>
            represented by its rector Professor Katharina Holzinger <br></br>
            Universitaetsstrasse 10 <br></br>
            78464 Konstanz <br></br>
            GERMANY <br></br>
            78464 Konstanz <br></br>
            Email: <a href="mailto:onlineredaktion@uni-konstanz.de">onlineredaktion@uni-konstanz.de</a><br></br>
            <br></br>
            Website: <a href="https://www.uni-konstanz.de/en">uni.kn/en</a><br></br><br></br></p>
          <h4>III. Providing access to the website and creation of log files</h4>
          <h5>1. Description and scope of the processing of data</h5>
          <p>Every time a user accesses this web page, the following data related to this process is stored in a log file:</p>
          <ul>
            <li>date and time of request</li>
            <li>address and file size (in bytes) of the resource requested and/or accessed</li>
            <li>the visitor's IP address</li>
            <li>server response (HTTP status code, e.g. “file sent”, “file not found”, etc.)</li>
            <li>connection information from the browser and operating system used, if available</li>
          </ul>
          <br></br>
          <h5>2. Legal basis:</h5>
          <p>The legal basis for storing logfiles is Art. 6 para 1. lit e) in connection with Art. 3 GDPR in connection with § 4 Landesdatenschutzgesetz (LDSG, law for the protection of personal data)
            in the version coming into effect on 6 June 2018.<br></br><br></br>
          </p>
          <h5>3. Purpose of processing data</h5>
          <p>The logged information is used to identify, isolate and fix disruptions or errors in the systems needed to operate this web page. These may also include disruptions or errors that lead to the restricted availability of information and communication services or allow unauthorised access to the systems.<br></br><br></br></p>
          <h5>4. Storage duration:</h5>
          <p>Information regarding the IP address is deleted after thirty days so that any other data collected in the process can no longer be associated with a particular person.<br></br><br></br>
          </p>
          <h4>IV. Using cookies</h4>
          <p>No cookies are applied on this page, neither from us nor from third-parties.</p><br></br>
          <h4>V. Rights of the parties involved</h4>
          <ul>
            <li>In accordance with Art. 15 GDPR, you have the right to request information from the University of Konstanz about any data it saves that is related to your person and/or to have incorrect data corrected as per Art. 16 GDPR.</li>
            <li>You also have the right to demand that your data be deleted (Art. 17 GDPR) or that the processing and use thereof be restricted (Art. 18 GDPR), as well as to object to the processing and use of your data (Art. 21 GDPR).</li>
            <li>If you raise an objection while in a contractual relationship with the university, it may no longer be possible to fulfil the contract.</li>
            <li>You can withdraw your consent regarding the processing and use of your data at any time. The fact that all data processed between the point in time that consent was given and it being withdrawn was processed lawfully remains untouched.</li>
            <li>To better understand and exercise your rights, please contact our data protection officer by emailing  <a href="mailto:datenschutzbeauftragter@uni-konstanz.de">datenschutzbeauftragter@uni-konstanz.de</a></li>
            <li>You also have the right to file a complaint with the regulating authority if you believe that the processing and use of your personal data is in violation of the law (Art. 77 GDPR). The responsible contact person at the regulating authority is the Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg (state commissioner for data protection and the freedom of information in Baden-Württemberg) (<a href="https://www.baden-wuerttemberg.datenschutz.de">https://www.baden-wuerttemberg.datenschutz.de</a>).</li>        </ul>
        </div>
      </div>
    </div>
  );
}

export default Privacy;

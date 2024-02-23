import React, { useState } from "react";
import {
  uploadJob,
  getJobList,
  abortJob,
  getJobReport,
  getNodeStatus,
} from "./api";
import "./JobSubmissionForm.css";

function JobSubmissionForm() {
  const [pythonScript, setPythonScript] = useState(null);
  const [yamlFile, setYamlFile] = useState(null);
  const [jobName, setJobName] = useState("");
  const [selectedJob, setSelectedJob] = useState("item1");
  const [selectedAction, setSelectedAction] = useState("execute");
  const [jobOutput, setJobOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === "pythonScript") {
      setPythonScript(files[0]);
    } else if (name === "yamlFile") {
      setYamlFile(files[0]);
    }
  };

  const handleInputChange = (event) => {
    setJobName(event.target.value);
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name === "jobList") {
      setSelectedJob(value);
    } else if (name === "actionList") {
      setSelectedAction(value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("pythonFile", pythonScript);
    formData.append("yamlFile", yamlFile);
    formData.append("jobName", jobName);

    try {
      const result = await uploadJob(formData);
      if (result.error) {
        console.error("Error submitting job:", result.error);
        setJobOutput(`Error: ${result.error}`);
      } else {
        setJobOutput(result.result);

        const jobListResult = await getJobList();
        console.log("Job List:", jobListResult);

        const nodeStatusResult = await getNodeStatus();
        console.log("Node Status:", nodeStatusResult);

        const abortResult = await abortJob(jobName);
        console.log("Abort Result:", abortResult);

        const reportResult = await getJobReport(jobName);
        console.log("Job Report:", reportResult);
      }
    } catch (error) {
      console.error("There was an error submitting the form", error);
      setJobOutput(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="jobName">Job Name</label>
          <input
            type="text"
            id="jobName"
            name="jobName"
            value={jobName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="pythonScript">Python Script</label>
          <input
            type="file"
            id="pythonScript"
            name="pythonScript"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label htmlFor="yamlFile">YAML File</label>
          <input
            type="file"
            id="yamlFile"
            name="yamlFile"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label htmlFor="jobList">Job List</label>
          <select
            id="jobList"
            name="jobList"
            value={selectedJob}
            onChange={handleSelectChange}
          >
            <option value="item1">Item 1</option>
            <option value="item2">Item 2</option>
            <option value="item3">Item 3</option>
          </select>
        </div>
        <div>
          <label htmlFor="actionList">Action List</label>
          <select
            id="actionList"
            name="actionList"
            value={selectedAction}
            onChange={handleSelectChange}
          >
            <option value="execute">Execute</option>
            <option value="execute">Execute</option>
            <option value="execute">Execute</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
      {jobOutput && (
        <div>
          <h3>Job Output:</h3>
          <pre>{jobOutput}</pre>
        </div>
      )}
    </div>
  );
}

export default JobSubmissionForm;

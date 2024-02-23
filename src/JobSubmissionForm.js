import React, { useState, useEffect } from "react";
import { uploadJob, getJobList, getJobReport, getNodeStatus } from "./api";
import "./JobSubmissionForm.css";

function JobSubmissionForm() {
  const [yamlFile, setYamlFile] = useState(null);
  const [yamlContent, setYamlContent] = useState("");
  const [jobList, setJobList] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [actionOutput, setActionOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null); // Error message initialized to null

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setYamlFile(file);
      setYamlContent(""); // Clear previous content
      const reader = new FileReader();
      reader.onload = (e) => {
        setYamlContent(e.target.result); // Set new content
      };
      reader.readAsText(file);
    }
  };

  const executeJob = async () => {
    setIsSubmitting(true);
    setErrorMessage(null); // Clear error message before executing
    const formData = new FormData();
    formData.append("yamlFile", yamlFile);

    try {
      const result = await uploadJob(formData);
      if (result.error) {
        console.error("Error executing job:", result.error);
        setErrorMessage(
          "Please modify the job name in your YAML file and try again."
        );
        setMessage(""); // Clear any previous message
      } else {
        await fetchJobList();
        setMessage("Job executed successfully.");
        setErrorMessage(null); // Clear error message on success
      }
    } catch (error) {
      console.error("There was an error executing the job", error);
      setErrorMessage(`Execution failed: ${error.message}`);
      setMessage(""); // Clear any previous message
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchJobList = async () => {
    try {
      const jobListResult = await getJobList();
      setJobList(jobListResult.jobs || []);
    } catch (error) {
      console.error("Failed to fetch job list:", error);
      // Optionally set an error message for job list fetch failures, if desired
    }
  };

  const handleActionSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null); // Clear error message before action
    try {
      let output;
      if (selectedAction === "report") {
        output = await getJobReport(selectedJob);
      } else if (selectedAction === "status") {
        output = await getNodeStatus();
      }
      setActionOutput(JSON.stringify(output, null, 2));
      setMessage(""); // Clear any previous message
    } catch (error) {
      console.error("Error fetching action data:", error);
      setErrorMessage(`Failed to fetch ${selectedAction}: ${error.message}`);
      setMessage(""); // Clear any previous message
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchJobList();
  }, []);

  return (
    <div>
      {message && <div className="message">{message}</div>}
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="yamlFile">YAML File</label>
          <input
            type="file"
            id="yamlFile"
            name="yamlFile"
            onChange={handleFileChange}
          />
        </div>
        {yamlContent && (
          <div>
            <label>YAML Content:</label>
            <pre>{yamlContent}</pre>
            <button onClick={executeJob} disabled={isSubmitting || !yamlFile}>
              {isSubmitting ? "Executing..." : "Execute"}
            </button>
            {/* Only display the error message if it exists */}
            {errorMessage && (
              <span className="error-message">{errorMessage}</span>
            )}
          </div>
        )}
        <div>
          <label>Job List</label>
          <select
            id="jobList"
            name="jobList"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            {jobList.map((job, index) => (
              <option key={index} value={job.name}>
                {job.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="actionList">Action List</label>
          <select
            id="actionList"
            name="actionList"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="">Select Action</option>
            <option value="report">Report</option>
            <option value="status">Status</option>
          </select>
        </div>
        <button
          onClick={handleActionSubmit}
          disabled={isSubmitting || !selectedAction}
        >
          Submit
        </button>
      </form>
      {actionOutput && (
        <div>
          <h3>Action Output:</h3>
          <pre>{actionOutput}</pre>
        </div>
      )}
    </div>
  );
}

export default JobSubmissionForm;

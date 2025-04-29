import { useEffect, useState } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";

const AgentDashboardPage = () => {
  const { instance, accounts } = useMsal();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL; // From your .env

  useEffect(() => {
    if (analysis) {
      console.log("🔍 Full Analysis Result:", analysis);
    }
  }, [analysis]);

  const handleAnalyzeInquiry = async () => {
    if (!title || !description) return;

    setLoading(true);
    try {
      const response = await instance.acquireTokenSilent({
        scopes: [import.meta.env.VITE_SCOPE],
        account: accounts[0],
      });

      const result = await axios.post(
        `${apiUrl}/inquiries/analyze`,
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        }
      );

      setAnalysis(result.data);
    } catch (error) {
      console.error("Error analyzing inquiry:", error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Agent Support Dashboard</h1>
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>
      <div style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <textarea
          placeholder="Describe the issue in detail"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", height: "150px" }}
        />
        <button
          onClick={handleAnalyzeInquiry}
          style={{ marginTop: "1rem", padding: "0.75rem 2rem" }}
        >
          Analyze Inquiry
        </button>
      </div>

      {loading && <p>Loading AI suggestions...</p>}

      {analysis && (
        <div>
          <h2>🔍 Root Causes</h2>
          {Array.isArray(analysis?.RootCauses) && analysis.RootCauses.map((cause, index) => (
            <div key={index} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
              <h3>{cause.Hypothesis}</h3>
              <p><strong>Confidence:</strong> {cause.Confidence * 100}%</p>
              <p><strong>Suggested Actions:</strong></p>
              <ul>
                {cause.Actions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
              <p><strong>Documentation:</strong></p>
              <ul>
                {cause.Docs.map((doc, idx) => (
                  <li key={idx}>
                    <a href={doc.Link} target="_blank" rel="noopener noreferrer">
                      {doc.Title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h2>🛠 Azure CLI / Portal Commands</h2>
          <ul>
            {Array.isArray(analysis?.AzureCommands) && analysis.AzureCommands.map((command, idx) => (
              <li key={idx}><code>{command}</code></li>
            ))}
          </ul>

          <h2>🧠 Explain Like I'm 5</h2>
          <p>{analysis.Eli5Explanation}</p>

          {analysis.Metrics && (
            <>
              <h2>📈 App Service Metrics</h2>
              <p><strong>CPU Usage:</strong> {analysis.Metrics.CpuUsage}</p>
              <p><strong>Memory Usage:</strong> {analysis.Metrics.MemoryUsage}</p>
              <p><strong>Recent Errors:</strong></p>
              <ul>
                {Array.isArray(analysis?.Metrics?.RecentErrors) && analysis.Metrics.RecentErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDashboardPage;

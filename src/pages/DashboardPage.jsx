import { useMsal, useAccount } from "@azure/msal-react";
import { useEffect, useState } from "react";
import axios from "axios";

function DashboardPage() {
    const apiUrl = import.meta.env.VITE_API_URL;
const scope = import.meta.env.VITE_SCOPE;

  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [account, instance]);

  const fetchProjects = async () => {
    if (account) {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: [`${scope}`],
          account: account,
        });
  
        const apiResponse = await axios.get(
          `${apiUrl}/projects`,
          {
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
            },
          }
        );
        console.log("API Response:", apiResponse.data);
        setProjects(apiResponse.data);
        console.log("API Response:", projects);
  
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
  };
  

  const handleCreateProject = async () => {
    if (account && title) {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: [`${scope}`],
          account: account,
        });
  
        // ✅ Only send title, description, and userId
        await axios.post(
          `${apiUrl}/projects`,
          {
            title: title,
            description: description,
            userId: 1 // 👈 Replace with dynamic userId later if needed
          },
          {
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
            },
          }
        );
  
        // Refresh Projects after creation
        fetchProjects();
        setTitle(""); // Clear form
        setDescription("");
      } catch (error) {
        console.error("Error creating project:", error);
      }
    }
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      <h2>Create New Project</h2>
      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "300px" }}
      />
      <textarea
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "300px", height: "100px" }}
      ></textarea>
      <button onClick={handleCreateProject}>Create Project</button>

      <h2 style={{ marginTop: "40px" }}>Your Projects</h2>
      <div>
  {Array.isArray(projects) && projects.map((project) => (
    <div key={project.Id}>
      <h2>{project.Title}</h2>
      <p>{project.Description}</p>
      <p><strong>AI Plan:</strong> {project.AiPlan}</p>

      {/* ✅ If project has tasks, map them */}
      {Array.isArray(project.tasks) && project.tasks.map((task) => (
        <div key={task.id}>
          <p><strong>Task:</strong> {task.title}</p>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  ))}
</div>


    </div>
  );
}

export default DashboardPage;

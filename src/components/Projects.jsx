import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All Projects");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const taskStatusOptions = ["Not Started", "In Progress", "Completed"];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("employeeToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.get("https://backend-6bli.onrender.com/employee/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.projects || res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch projects";
      setError(errorMsg);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    if (!projectId) {
      setError("Invalid project ID");
      setTasks([]);
      return;
    }
    try {
      setTaskLoading(true);
      setError("");
      const token = sessionStorage.getItem("employeeToken");
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get(
        `https://backend-6bli.onrender.com/employee/projects/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch tasks";
      setError(errorMsg);
      setTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = sessionStorage.getItem("employeeToken");
      if (!token) throw new Error("No authentication token found");

      await axios.patch(
        `https://backend-6bli.onrender.com/employee/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (selectedProject) {
        fetchTasks(selectedProject._id);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      const errorMsg = err.response?.data?.message || "Failed to update task status";
      setError(errorMsg);
    }
  };

  const handleProjectClick = (project) => {
    if (!project?._id) {
      setError("Invalid project selected");
      setTasks([]);
      return;
    }
    setSelectedProject(project);
    fetchTasks(project._id);
  };

  const filteredProjects =
    filter === "All Projects"
      ? projects
      : projects.filter((p) => p.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      "Not Started": "bg-gray-100 text-gray-700",
      "In Progress": "bg-blue-100 text-blue-700",
      "On Hold": "bg-yellow-100 text-yellow-700",
      "Completed": "bg-green-100 text-green-700",
      "Cancelled": "bg-red-100 text-red-700",
    };
    return colors[status] || colors["Not Started"];
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      "Not Started": "bg-gray-100 text-gray-700",
      "In Progress": "bg-blue-100 text-blue-700",
      Completed: "bg-green-100 text-green-700",
    };
    return colors[status] || colors["Not Started"];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#113a69]">My Projects</h1>
          <p className="text-gray-600 text-sm">Track your assigned projects and tasks</p>
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 border-b mb-6">
        {["All Projects", "In Progress", "On Hold", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setSelectedProject(null);
              setTasks([]);
              setError("");
            }}
            className={`pb-2 px-2 text-sm md:text-base transition-colors ${filter === tab
                ? "border-b-2 border-[#113a69] text-[#113a69] font-semibold"
                : "text-gray-600 hover:text-[#1b5393] hover:border-b-2 hover:border-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
        {loading ? (
          <div className="text-center py-6 text-gray-500">
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No projects found</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const daysRemaining = getDaysRemaining(project.deadline);
                return (
                  <tr
                    key={project._id}
                    className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedProject?._id === project._id ? "bg-blue-50" : ""
                      }`}
                    onClick={() => handleProjectClick(project)}
                  >
                    <td className="px-6 py-3">
                      <div>
                        <div className="font-medium text-[#113a69]">
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)} days overdue`
                            : daysRemaining === 0
                              ? "Due today"
                              : `${daysRemaining} days left`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {formatDate(project.startDate)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {formatDate(project.deadline)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${project.progress === 100
                                ? "bg-green-500"
                                : "bg-[#113a69]"
                              }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-[#113a69] hover:text-blue-800 text-sm"
                        disabled={!selectedProject?._id || selectedProject._id !== project._id}
                      >
                        {selectedProject?._id === project._id ? "✓ Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedProject && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#113a69]">
                Tasks for {selectedProject.name}
              </h2>
              <p className="text-sm text-gray-600">
                Update your task status below
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProject(null);
                setTasks([]);
              }}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Back to Projects
            </button>
          </div>

          {taskLoading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tasks assigned to you in this project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{task.description}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Created: {formatDate(task.createdAt)}
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#113a69] text-sm"
                  >
                    {taskStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
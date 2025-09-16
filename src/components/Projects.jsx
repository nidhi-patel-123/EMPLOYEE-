import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All Projects");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("employeeToken");
      const res = await axios.get("http://localhost:3001/employee/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects =
    filter === "All Projects"
      ? projects
      : projects.filter((p) => p.status === filter);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">My Projects</h1>
      </div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b mb-6">
        {["All Projects", "In Progress", "Completed", "On Hold"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-2 px-2 text-sm md:text-base ${filter === tab
              ? "border-b-2 border-[#113a69] text-[#113a69] font-semibold"
              : "text-gray-600 hover:text-[#1b5393]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Responsive Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="text-center py-6 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-[#337dd3] font-medium">
                    {project.name}
                  </td>
                  <td className="px-6 py-3">{project.client}</td>
                  <td className="px-6 py-3">
                    {project.startDate?.slice(0, 10)}
                  </td>
                  <td className="px-6 py-3">
                    {project.deadline?.slice(0, 10)}
                  </td>
                  <td className="px-6 py-3">
                    {Array.isArray(project.team)
                      ? project.team.map((member) => member.name).join(", ")
                      : ""}
                  </td>
                  <td className="px-6 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${project.progress === 100
                          ? "bg-green-500"
                          : "bg-orange-400"
                          }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">{project.progress}%</span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${project.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : project.status === "On Hold"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TaskCreatorTab from './TaskCreatorTab';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [globalStats, setGlobalStats] = useState(null);
  const [taskStats, setTaskStats] = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchGlobalStats();
    fetchTaskStats();
  }, []);

  const fetchGlobalStats = async () => {
    setLoadingGlobal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats/global', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGlobalStats(data);
      }
    } catch (error) {
      console.error("Error fetching global stats:", error);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const fetchTaskStats = async () => {
    setLoadingTasks(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats/task-specific', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTaskStats(data);
      }
    } catch (error) {
      console.error("Error fetching task stats:", error);
    } finally {
      setLoadingTasks(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/register">
             <Button variant="secondary">Register New User</Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      
      <Tabs defaultValue="global-stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global-stats">Global Stats</TabsTrigger>
          <TabsTrigger value="task-stats">Task Stats</TabsTrigger>
          <TabsTrigger value="content-creation">Content Creation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="global-stats">
          <Card>
            <CardHeader>
              <CardTitle>Global User Statistics</CardTitle>
              <CardDescription>Overview of user performance and engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGlobal ? (
                <p>Loading...</p>
              ) : globalStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{globalStats.total_users}</div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Total Students</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{globalStats.total_tasks}</div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Total Tasks</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{globalStats.total_problems_solved}</div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Problems Solved</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{(globalStats.overall_accuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Overall Accuracy</div>
                  </div>
                </div>
              ) : (
                <p>Failed to load global stats.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="task-stats">
          <Card>
            <CardHeader>
              <CardTitle>Task Specific Statistics</CardTitle>
              <CardDescription>Detailed analysis per task or topic (Top 20 most attempted).</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <p>Loading...</p>
              ) : taskStats && taskStats.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Topic</th>
                                <th className="px-4 py-3">Task Preview</th>
                                <th className="px-4 py-3">Attempts</th>
                                <th className="px-4 py-3">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskStats.map(stat => (
                                <tr key={stat.task_id} className="border-b">
                                    <td className="px-4 py-3 font-medium text-gray-900">{stat.task_id}</td>
                                    <td className="px-4 py-3">{stat.topic_name}</td>
                                    <td className="px-4 py-3 max-w-[200px] truncate" title={stat.task_text}>{stat.task_text}</td>
                                    <td className="px-4 py-3">{stat.total_attempts || 0}</td>
                                    <td className="px-4 py-3">
                                        {stat.total_attempts ? ((stat.total_correct / stat.total_attempts) * 100).toFixed(1) + '%' : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
              ) : (
                <p>No task statistics available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content-creation">
          <TaskCreatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

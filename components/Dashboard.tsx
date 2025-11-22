
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User } from '../types';
import { getTestHistory } from '../services/firebaseService';
import { TestResultData } from '../types';
import { BarChart as BarChartIcon, Bookmark, Clock } from './icons/Icons';

interface DashboardProps {
    user: User;
}

const COLORS = ['#28a745', '#dc3545', '#ffc107'];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [history, setHistory] = useState<TestResultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const userHistory = await getTestHistory(user.uid);
          setHistory(userHistory);
        } catch (error) {
          console.error("Failed to fetch test history:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  const totalTests = history.length;
  const overallAccuracy = totalTests > 0 ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / totalTests) : 0;
  
  const totalCorrect = history.reduce((acc, h) => acc + h.score, 0);
  const totalQuestions = history.reduce((acc, h) => acc + h.total, 0);
  const totalIncorrect = totalQuestions - totalCorrect; // Simplified for now

  const pieData = [
    { name: 'Correct', value: totalCorrect },
    { name: 'Incorrect', value: totalIncorrect },
  ];

  const performanceData = history.slice(0, 5).reverse().map(h => ({
      name: h.test.title.slice(0, 20) + (h.test.title.length > 20 ? '...' : ''),
      accuracy: h.percentage,
  }));


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tests Taken" value={totalTests.toString()} icon={<BarChartIcon className="w-8 h-8 text-primary"/>} />
        <StatCard title="Overall Accuracy" value={`${overallAccuracy}%`} icon={<Bookmark className="w-8 h-8 text-secondary"/>} />
        <StatCard title="Avg. Speed" value="N/A" icon={<Clock className="w-8 h-8 text-yellow-500"/>} />
        <StatCard title="Questions Bookmarked" value="N/A" icon={<Bookmark className="w-8 h-8 text-red-500"/>} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Recent Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill="#007BFF" name="Accuracy (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Overall Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Test History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 font-semibold">Test Name</th>
                <th className="p-3 font-semibold">Score</th>
                <th className="p-3 font-semibold">Accuracy</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((test) => (
                <tr key={test.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{test.test.title}</td>
                  <td className="p-3 font-semibold">{test.score}/{test.total}</td>
                   <td className="p-3 font-semibold">{test.percentage}%</td>
                  <td className="p-3">{new Date(test.date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button className="text-primary hover:underline font-semibold">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
        <div className="bg-slate-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export default Dashboard;
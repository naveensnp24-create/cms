import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { contactAPI } from '../services/api';

// register chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [recentCalls, setRecentCalls] = useState([]);
  const [bloodGroupStats, setBloodGroupStats] = useState([]);
  const [callFrequency, setCallFrequency] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      fetchAnalytics(email);
    }
  }, []);

  const fetchAnalytics = async (email) => {
    try {
      // fetch all analytics data at once
      const [recent, bloodStats, frequency] = await Promise.all([
        contactAPI.getRecentCalls(email),
        contactAPI.getBloodGroupStats(email),
        contactAPI.getCallFrequency(email)
      ]);
      
      setRecentCalls(recent.data);
      setBloodGroupStats(bloodStats.data);
      setCallFrequency(frequency.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // prepare data for blood group pie chart
  const bloodGroupChartData = {
    labels: bloodGroupStats.map((stat) => stat._id),
    datasets: [{
      data: bloodGroupStats.map((stat) => stat.count),
      backgroundColor: [
        'crimson', 'dodgerblue', 'gold', 'mediumturquoise',
        'mediumslateblue', 'orange', 'crimson', 'lightgray'
      ]
    }]
  };

  // prepare data for call frequency bar chart
  const callFrequencyChartData = {
    labels: callFrequency.map((freq) => `${freq._id} calls`),
    datasets: [{
      label: 'Number of Contacts',
      data: callFrequency.map((freq) => freq.contacts),
      backgroundColor: '#36A2EB'
    }]
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Analytics Dashboard</h2>
      <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 break-all">Data for: {userEmail}</p>
      
      {/* charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-700 text-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Blood Group Distribution</h3>
          <div className="max-w-xs sm:max-w-sm mx-auto">
            {bloodGroupStats.length > 0 ? (
              <Pie data={bloodGroupChartData} />
            ) : (
              <p className="text-gray-300 text-sm">No data available</p>
            )}
          </div>
        </div>
        
        <div className="bg-slate-700 text-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Call Frequency</h3>
          {callFrequency.length > 0 ? (
            <Bar data={callFrequencyChartData} />
          ) : (
            <p className="text-gray-300 text-sm">No data available</p>
          )}
        </div>
      </div>

      {/* recent calls table */}
      <div className="bg-slate-700 text-white p-3 sm:p-4 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Calls</h3>
        {recentCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2 hidden sm:table-cell">Last Called</th>
                  <th className="text-left p-2">Calls</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((contact) => (
                  <tr key={contact._id} className="border-b border-slate-600">
                    <td className="p-2 break-words">{contact.name}</td>
                    <td className="p-2 break-all">{contact.phone}</td>
                    <td className="p-2 hidden sm:table-cell">{new Date(contact.lastCalled).toLocaleDateString()}</td>
                    <td className="p-2">{contact.callCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent calls</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
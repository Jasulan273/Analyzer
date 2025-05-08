import React, { useState, useEffect } from 'react';
import { getUserHistory, getUserFiles, downloadUserFile, downloadReport } from '../api/api';
import { FileText, Clock, Download } from 'lucide-react';

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [historyRes, filesRes] = await Promise.all([
          getUserHistory(token),
          getUserFiles(token)
        ]);
        setHistory(await historyRes.json());
        setFiles(await filesRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const fileBlob = await downloadUserFile(fileId, token);
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `file_${Date.now()}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Не удалось скачать файл. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (requestId, fileName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const fileBlob = await downloadReport(requestId, token);
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Не удалось скачать отчет. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>
    
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Analyze History</h2>
          {history.length === 0 ? (
            <div className="text-center text-gray-400 text-lg">Analyze history is empty</div>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-500" />
                      <span className="font-medium">Analyze #{item.id}</span>
                    </div>
                    {item.report_path && (
                      <button
                        onClick={() => handleDownloadReport(item.id, `report_${item.id}.pdf`)}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={18} />
                        Download
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Created at: {new Date(item.request_date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
import React, { useState } from 'react';

const SetupScreen = ({ onSetupComplete }) => {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jd.trim()) {
      alert('Please upload a resume and provide a job description.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jd);

    try {
      const response = await fetch('http://localhost:8000/api/setup-interview', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.session_id) {
        onSetupComplete(data.session_id); // Pass session ID back to parent to route to MockInterviewer
      } else {
        alert('Failed to initialize session.');
      }
    } catch (error) {
      console.error('Setup error:', error);
      alert('An error occurred connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">Interview Setup</h1>
        <p className="text-slate-500 text-center mb-8">Provide your details to tailor the AI questions.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Resume (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-3 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
            <textarea 
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows="6"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Paste the target job description here..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg transition-all ${
              loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Preparing Context...' : 'Start Interview'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;

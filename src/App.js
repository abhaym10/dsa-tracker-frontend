import React, { useState, useEffect } from 'react';

const BACKEND_URL = "https://dsa-tracker-backend-production-<your-id>.up.railway.app"; 
// 🔹 Replace <your-id> with your Railway backend URL

function App() {
  const [problems, setProblems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    difficulty: '',
    tags: '',
    status: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch problems + stats on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/problems`)
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        fetchStats();
      })
      .catch(err => console.error('Error fetching problems:', err));
  }, []);

  const fetchStats = () => {
    fetch(`${BACKEND_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(tag => tag.trim());

    if (editingId) {
      // Update existing problem
      const res = await fetch(`${BACKEND_URL}/api/problems/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags: tagsArray })
      });
      const updated = await res.json();
      setProblems(problems.map(p => (p._id === updated._id ? updated : p)));
      setEditingId(null);
    } else {
      // Add new problem
      const res = await fetch(`${BACKEND_URL}/api/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags: tagsArray })
      });
      const newProblem = await res.json();
      setProblems([...problems, newProblem]);
    }

    setFormData({ title: '', difficulty: '', tags: '', status: '' });
    fetchStats();
  };

  const handleDelete = async (id) => {
    await fetch(`${BACKEND_URL}/api/problems/${id}`, {
      method: 'DELETE'
    });
    setProblems(problems.filter(p => p._id !== id));
    fetchStats();
  };

  const handleEdit = (problem) => {
    setEditingId(problem._id);
    setFormData({
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags.join(', '),
      status: problem.status
    });
  };

  const filteredProblems = problems.filter((p) => {
    const matchesTitle = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter ? p.difficulty === difficultyFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesTitle && matchesDifficulty && matchesStatus;
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>DSA Problem Tracker</h1>

      {stats && (
        <div style={{ marginBottom: '2rem', background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h2>📊 Stats</h2>
          <p><strong>Total:</strong> {stats.total}</p>
          <p><strong>Solved:</strong> {stats.solved}</p>
          <p><strong>Unsolved:</strong> {stats.unsolved}</p>
          <p><strong>By Difficulty:</strong></p>
          <ul>
            {Object.entries(stats.difficultyCount).map(([lvl, cnt]) => (
              <li key={lvl}>{lvl.toUpperCase()}: {cnt}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />{' '}
        <input name="difficulty" placeholder="Difficulty" value={formData.difficulty} onChange={handleChange} required />{' '}
        <input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} />{' '}
        <input name="status" placeholder="Status" value={formData.status} onChange={handleChange} />{' '}
        <button type="submit">{editingId ? 'Update Problem' : 'Add Problem'}</button>
      </form>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>
      </div>

      <ul>
        {filteredProblems.map((p) => (
          <li key={p._id}>
            <strong>{p.title}</strong> ({p.difficulty}) — {p.status}<br />
            Tags: {p.tags.join(', ')}{' '}
            <button onClick={() => handleEdit(p)}>✏️ Edit</button>{' '}
            <button onClick={() => handleDelete(p._id)}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

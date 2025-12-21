import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    categoryId: '',
    tags: ''
  });

  const API_BASE = '/api';

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchMaterials = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const response = await axios.get(`${API_BASE}/materials`, { params });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tags`);
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('categoryId', formData.categoryId);
    data.append('tags', formData.tags);
    data.append('file', formData.file);

    try {
      await axios.post(`${API_BASE}/materials`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData({
        title: '',
        description: '',
        file: null,
        categoryId: '',
        tags: ''
      });
      fetchMaterials();
      fetchTags();
    } catch (error) {
      console.error('Error uploading material:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(searchQuery);
  };

  const handleAccess = async (id) => {
    try {
      await axios.put(`${API_BASE}/materials/${id}/access`);
    } catch (error) {
      console.error('Error updating access time:', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>学习资料管理工具</h1>
      </div>

      <div className="upload-section">
        <h2>上传学习资料</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">分类</label>
            <select
              id="category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
            >
              <option value="">请选择分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tags">标签（用逗号分隔）</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="例如：数学, 计算机科学"
            />
          </div>
          <div className="form-group">
            <label htmlFor="file">选择文件</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit">上传</button>
        </form>
      </div>

      <div className="search-section">
        <h2>搜索资料</h2>
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="搜索标题、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">搜索</button>
        </form>
      </div>

      <div className="materials-section">
        <h2>学习资料列表</h2>
        {loading ? (
          <p>加载中...</p>
        ) : materials.length === 0 ? (
          <p>暂无资料</p>
        ) : (
          <div className="material-list">
            {materials.map(material => (
              <div key={material.id} className="material-item">
                <h3>{material.title}</h3>
                <p>{material.description}</p>
                <div className="material-meta">
                  <span>上传时间: {new Date(material.created_at).toLocaleString()}</span>
                  <br />
                  <span>最后访问: {new Date(material.last_accessed).toLocaleString()}</span>
                  {material.category_name && (
                    <span> | 分类: {material.category_name}</span>
                  )}
                </div>
                <div className="material-actions">
                  <button onClick={() => handleAccess(material.id)}>
                    访问
                  </button>
                  <a
                    href={`${API_BASE.replace('/api', '')}${material.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button"
                  >
                    <button>下载</button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
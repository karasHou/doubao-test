import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchEditModal, setShowBatchEditModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editTagName, setEditTagName] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    job_title: '',
    groups: [],
    tags: []
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newBatchGroupName, setNewBatchGroupName] = useState('');
  const [newBatchTagName, setNewBatchTagName] = useState('');
  const [batchUpdates, setBatchUpdates] = useState({
    groups: [],
    tags: []
  });

  // 获取所有数据
  useEffect(() => {
    loadContacts();
    loadGroups();
    loadTags();
  }, []);

  const loadContacts = async (search = '') => {
    try {
      const params = search ? { search } : {};
      const response = await axios.get(`${API_BASE_URL}/contacts`, { params });
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tags`);
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  // 搜索功能
  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    loadContacts(search);
  };

  // 选择联系人
  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // 全选联系人
  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  // 添加新分组
  const addNewGroup = () => {
    if (newGroupName.trim() && !newContact.groups.includes(newGroupName.trim())) {
      setNewContact(prev => ({
        ...prev,
        groups: [...prev.groups, newGroupName.trim()]
      }));
      setNewGroupName('');
    }
  };

  // 添加新标签
  const addNewTag = () => {
    if (newTagName.trim() && !newContact.tags.includes(newTagName.trim())) {
      setNewContact(prev => ({
        ...prev,
        tags: [...prev.tags, newTagName.trim()]
      }));
      setNewTagName('');
    }
  };

  // 移除分组
  const removeGroup = (groupName) => {
    setNewContact(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g !== groupName)
    }));
  };

  // 移除标签
  const removeTag = (tagName) => {
    setNewContact(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagName)
    }));
  };

  // 批量编辑 - 添加新分组
  const addNewBatchGroup = () => {
    if (newBatchGroupName.trim() && !batchUpdates.groups.includes(newBatchGroupName.trim())) {
      setBatchUpdates(prev => ({
        ...prev,
        groups: [...prev.groups, newBatchGroupName.trim()]
      }));
      setNewBatchGroupName('');
    }
  };

  // 批量编辑 - 添加新标签
  const addNewBatchTag = () => {
    if (newBatchTagName.trim() && !batchUpdates.tags.includes(newBatchTagName.trim())) {
      setBatchUpdates(prev => ({
        ...prev,
        tags: [...prev.tags, newBatchTagName.trim()]
      }));
      setNewBatchTagName('');
    }
  };

  // 批量编辑 - 移除分组
  const removeBatchGroup = (groupName) => {
    setBatchUpdates(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g !== groupName)
    }));
  };

  // 批量编辑 - 移除标签
  const removeBatchTag = (tagName) => {
    setBatchUpdates(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagName)
    }));
  };

  // 打开编辑模态框
  const openEditModal = async (contactId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts/${contactId}`);
      setEditingContact(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  // 保存编辑
  const handleEditContact = async (e) => {
    e.preventDefault();
    if (!editingContact) return;

    try {
      await axios.put(`${API_BASE_URL}/contacts/${editingContact.id}`, editingContact);
      setShowEditModal(false);
      setEditingContact(null);
      loadContacts(searchTerm);
      loadGroups();
      loadTags();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  // 删除单个联系人
  const handleDeleteContact = async (contactId) => {
    if (window.confirm('确定要删除这个联系人吗？')) {
      try {
        await axios.delete(`${API_BASE_URL}/contacts/${contactId}`);
        loadContacts(searchTerm);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  // 编辑模式 - 添加新分组
  const addEditGroup = () => {
    if (editGroupName.trim() && !editingContact.groups.includes(editGroupName.trim())) {
      setEditingContact(prev => ({
        ...prev,
        groups: [...prev.groups, editGroupName.trim()]
      }));
      setEditGroupName('');
    }
  };

  // 编辑模式 - 添加新标签
  const addEditTag = () => {
    if (editTagName.trim() && !editingContact.tags.includes(editTagName.trim())) {
      setEditingContact(prev => ({
        ...prev,
        tags: [...prev.tags, editTagName.trim()]
      }));
      setEditTagName('');
    }
  };

  // 编辑模式 - 移除分组
  const removeEditGroup = (groupName) => {
    setEditingContact(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g !== groupName)
    }));
  };

  // 编辑模式 - 移除标签
  const removeEditTag = (tagName) => {
    setEditingContact(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagName)
    }));
  };

  // 添加新联系人
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/contacts`, newContact);
      setShowAddModal(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        company: '',
        job_title: '',
        groups: [],
        tags: []
      });
      loadContacts(searchTerm);
      loadGroups();
      loadTags();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (window.confirm(`确定要删除选中的 ${selectedContacts.length} 个联系人吗？`)) {
      try {
        await axios.delete(`${API_BASE_URL}/contacts`, { data: { ids: selectedContacts } });
        setSelectedContacts([]);
        loadContacts(searchTerm);
      } catch (error) {
        console.error('Error deleting contacts:', error);
      }
    }
  };

  // 批量编辑
  const handleBatchEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/contacts/batch`, {
        ids: selectedContacts,
        updates: batchUpdates
      });
      setShowBatchEditModal(false);
      setBatchUpdates({ groups: [], tags: [] });
      setSelectedContacts([]);
      loadContacts(searchTerm);
      loadGroups();
      loadTags();
    } catch (error) {
      console.error('Error updating contacts:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>通讯录管理工具</h1>
      </header>

      <main className="app-main">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索联系人..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="action-buttons">
            <button onClick={() => setShowAddModal(true)}>添加联系人</button>
            {selectedContacts.length > 0 && (
              <>
                <button onClick={() => setShowBatchEditModal(true)}>批量编辑</button>
                <button className="danger" onClick={handleBatchDelete}>批量删除</button>
              </>
            )}
          </div>
        </div>

        <div className="contacts-list">
          <div className="contacts-header">
            <input
              type="checkbox"
              checked={selectedContacts.length === contacts.length && contacts.length > 0}
              onChange={selectAllContacts}
            />
            <span>姓名</span>
            <span>电话</span>
            <span>邮箱</span>
            <span>公司</span>
            <span>分组</span>
            <span>标签</span>
            <span>操作</span>
          </div>
          {contacts.map(contact => (
            <div key={contact.id} className="contact-item">
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact.id)}
                onChange={() => toggleContactSelection(contact.id)}
              />
              <span>{contact.name}</span>
              <span>{contact.phone}</span>
              <span>{contact.email}</span>
              <span>{contact.company}</span>
              <span>{contact.groups?.join(', ')}</span>
              <span>{contact.tags?.join(', ')}</span>
              <div className="contact-actions">
                <button className="edit-btn" onClick={() => openEditModal(contact.id)}>编辑</button>
                <button className="delete-btn" onClick={() => handleDeleteContact(contact.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 添加联系人模态框 */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>添加联系人</h2>
            <form onSubmit={handleAddContact}>
              <input
                type="text"
                placeholder="姓名"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="电话"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              />
              <input
                type="email"
                placeholder="邮箱"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                type="text"
                placeholder="公司"
                value={newContact.company}
                onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
              />
              <input
                type="text"
                placeholder="职位"
                value={newContact.job_title}
                onChange={(e) => setNewContact(prev => ({ ...prev, job_title: e.target.value }))}
              />
              <div>
                <label>分组：</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="输入新分组名称"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewGroup()}
                  />
                  <button type="button" onClick={addNewGroup}>添加</button>
                </div>
                <div className="selected-items">
                  {newContact.groups.map(group => (
                    <span key={group} className="tag">
                      {group}
                      <button type="button" onClick={() => removeGroup(group)}>×</button>
                    </span>
                  ))}
                </div>
                <select
                  multiple
                  value={newContact.groups}
                  onChange={(e) => setNewContact(prev => ({
                    ...prev,
                    groups: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.name}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>标签：</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="输入新标签名称"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
                  />
                  <button type="button" onClick={addNewTag}>添加</button>
                </div>
                <div className="selected-items">
                  {newContact.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <select
                  multiple
                  value={newContact.tags}
                  onChange={(e) => setNewContact(prev => ({
                    ...prev,
                    tags: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">保存</button>
                <button type="button" onClick={() => setShowAddModal(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑联系人模态框 */}
      {showEditModal && editingContact && (
        <div className="modal">
          <div className="modal-content">
            <h2>编辑联系人</h2>
            <form onSubmit={handleEditContact}>
              <input
                type="text"
                placeholder="姓名"
                value={editingContact.name}
                onChange={(e) => setEditingContact(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="电话"
                value={editingContact.phone}
                onChange={(e) => setEditingContact(prev => ({ ...prev, phone: e.target.value }))}
              />
              <input
                type="email"
                placeholder="邮箱"
                value={editingContact.email}
                onChange={(e) => setEditingContact(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                type="text"
                placeholder="公司"
                value={editingContact.company}
                onChange={(e) => setEditingContact(prev => ({ ...prev, company: e.target.value }))}
              />
              <input
                type="text"
                placeholder="职位"
                value={editingContact.job_title}
                onChange={(e) => setEditingContact(prev => ({ ...prev, job_title: e.target.value }))}
              />
              <div>
                <label>分组：</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="输入新分组名称"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEditGroup()}
                  />
                  <button type="button" onClick={addEditGroup}>添加</button>
                </div>
                <div className="selected-items">
                  {editingContact.groups.map(group => (
                    <span key={group} className="tag">
                      {group}
                      <button type="button" onClick={() => removeEditGroup(group)}>×</button>
                    </span>
                  ))}
                </div>
                <select
                  multiple
                  value={editingContact.groups}
                  onChange={(e) => setEditingContact(prev => ({
                    ...prev,
                    groups: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.name}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>标签：</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="输入新标签名称"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEditTag()}
                  />
                  <button type="button" onClick={addEditTag}>添加</button>
                </div>
                <div className="selected-items">
                  {editingContact.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeEditTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <select
                  multiple
                  value={editingContact.tags}
                  onChange={(e) => setEditingContact(prev => ({
                    ...prev,
                    tags: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">保存</button>
                <button type="button" onClick={() => setShowEditModal(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 批量编辑模态框 */}
      {showBatchEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>批量编辑</h2>
            <form onSubmit={handleBatchEdit}>
              <div>
                <label>分组：</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="输入新分组名称"
                    value={newBatchGroupName}
                    onChange={(e) => setNewBatchGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewBatchGroup()}
                  />
                  <button type="button" onClick={addNewBatchGroup}>添加</button>
                </div>
                <div className="selected-items">
                  {batchUpdates.groups.map(group => (
                    <span key={group} className="tag">
                      {group}
                      <button type="button" onClick={() => removeBatchGroup(group)}>×</button>
                    </span>
                  ))}
                </div>
                <select
                  multiple
                  value={batchUpdates.groups}
                  onChange={(e) => setBatchUpdates(prev => ({
                    ...prev,
                    groups: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.name}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>标签：</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="输入新标签名称"
                    value={newBatchTagName}
                    onChange={(e) => setNewBatchTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewBatchTag()}
                  />
                  <button type="button" onClick={addNewBatchTag}>添加</button>
                </div>
                <div className="selected-items">
                  {batchUpdates.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeBatchTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <select
                  multiple
                  value={batchUpdates.tags}
                  onChange={(e) => setBatchUpdates(prev => ({
                    ...prev,
                    tags: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">保存</button>
                <button type="button" onClick={() => setShowBatchEditModal(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

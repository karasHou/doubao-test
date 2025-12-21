import { useState, useEffect } from 'react';
import PetSVG from './components/PetSVG';
import { petAPI, vaccinationAPI, checkupAPI, reminderAPI } from './services/api';
import './index.css';

function App() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [checkups, setCheckups] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', type: 'dog', breed: '', birthday: '', weight: '' });

  useEffect(() => {
    loadPets();
    loadReminders();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadVaccinations(selectedPet.id);
      loadCheckups(selectedPet.id);
    }
  }, [selectedPet]);

  const loadPets = async () => {
    try {
      const response = await petAPI.getAll();
      setPets(response.data);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadVaccinations = async (petId) => {
    try {
      const response = await vaccinationAPI.getByPet(petId);
      setVaccinations(response.data);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
    }
  };

  const loadCheckups = async (petId) => {
    try {
      const response = await checkupAPI.getByPet(petId);
      setCheckups(response.data);
    } catch (error) {
      console.error('Error loading checkups:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const response = await reminderAPI.getAll();
      setReminders(response.data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      await petAPI.create(newPet);
      setShowAddPetModal(false);
      setNewPet({ name: '', type: 'dog', breed: '', birthday: '', weight: '' });
      loadPets();
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const handleSelectPet = (pet) => {
    setSelectedPet(pet);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">宠物健康管理工具</h1>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">我的宠物</h2>
                <button
                  onClick={() => setShowAddPetModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  添加
                </button>
              </div>
              <div className="space-y-2">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => handleSelectPet(pet)}
                    className={`p-3 rounded cursor-pointer ${
                      selectedPet?.id === pet.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <PetSVG type={pet.type} size={40} />
                      <span className="ml-2 font-medium">{pet.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedPet ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <PetSVG type={selectedPet.type} size={120} />
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold">{selectedPet.name}</h2>
                    <p className="text-gray-600">类型: {selectedPet.type === 'dog' ? '狗' : '猫'}</p>
                    {selectedPet.breed && <p className="text-gray-600">品种: {selectedPet.breed}</p>}
                    {selectedPet.birthday && <p className="text-gray-600">生日: {selectedPet.birthday}</p>}
                    {selectedPet.weight && <p className="text-gray-600">体重: {selectedPet.weight}kg</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">疫苗记录</h3>
                    {/* Vaccine management will be implemented here */}
                    <div className="space-y-2">
                      {vaccinations.map((v) => (
                        <div key={v.id} className="bg-gray-50 p-2 rounded">
                          <p className="font-medium">{v.vaccine_name}</p>
                          <p className="text-sm text-gray-600">接种日期: {v.date_administered}</p>
                          {v.next_due_date && (
                            <p className="text-sm text-yellow-600">下次接种: {v.next_due_date}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">体检记录</h3>
                    {/* Checkup management will be implemented here */}
                    <div className="space-y-2">
                      {checkups.map((c) => (
                        <div key={c.id} className="bg-gray-50 p-2 rounded">
                          <p className="font-medium">体检日期: {c.checkup_date}</p>
                          <p className="text-sm text-gray-600">兽医: {c.vet_name}</p>
                          {c.weight && <p className="text-sm text-gray-600">体重: {c.weight}kg</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <PetSVG type="dog" size={160} className="mx-auto mb-4" />
                <p className="text-gray-500 text-lg">请选择一个宠物查看详细信息</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">添加宠物</h2>
            <form onSubmit={handleAddPet} className="space-y-3">
              <input
                type="text"
                placeholder="宠物名字"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <select
                value={newPet.type}
                onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="dog">狗</option>
                <option value="cat">猫</option>
              </select>
              <input
                type="text"
                placeholder="品种"
                value={newPet.breed}
                onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="date"
                value={newPet.birthday}
                onChange={(e) => setNewPet({ ...newPet, birthday: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="number"
                step="0.1"
                placeholder="体重 (kg)"
                value={newPet.weight}
                onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
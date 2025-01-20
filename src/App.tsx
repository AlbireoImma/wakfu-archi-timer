import React, { useState, useEffect } from 'react';
import { Clock, Skull, Plus, Trash2, RefreshCw, MapPin } from 'lucide-react';

interface Monster {
  id: string;
  name: string;
  spawnTime: number;
  lastKilled: number;
  location: string;
}

function App() {
  const [monsters, setMonsters] = useState<Monster[]>(() => {
    const saved = localStorage.getItem('wakfu-monsters');
    return saved ? JSON.parse(saved) : [];
  });
  const [locations, setLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('wakfu-locations');
    return saved ? JSON.parse(saved) : ['Astrub', 'Amakna', 'Bonta', 'Brakmar'];
  });
  const [newMonsterName, setNewMonsterName] = useState('');
  const [newSpawnTime, setNewSpawnTime] = useState('60');
  const [newLocation, setNewLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(locations[0] || '');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('wakfu-monsters', JSON.stringify(monsters));
  }, [monsters]);

  useEffect(() => {
    localStorage.setItem('wakfu-locations', JSON.stringify(locations));
  }, [locations]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || locations.includes(newLocation.trim())) return;
    
    const updatedLocations = [...locations, newLocation.trim()].sort();
    setLocations(updatedLocations);
    setSelectedLocation(newLocation.trim());
    setNewLocation('');
    setShowLocationInput(false);
  };

  const addMonster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonsterName.trim() || !selectedLocation) return;

    const newMonster: Monster = {
      id: crypto.randomUUID(),
      name: newMonsterName.trim(),
      spawnTime: parseInt(newSpawnTime) * 60 * 1000, // Convert minutes to milliseconds
      lastKilled: Date.now(),
      location: selectedLocation
    };

    setMonsters(prev => [...prev, newMonster]);
    setNewMonsterName('');
    setNewSpawnTime('60');
  };

  const markKilled = (id: string) => {
    setMonsters(prev =>
      prev.map(monster =>
        monster.id === id
          ? { ...monster, lastKilled: Date.now() }
          : monster
      )
    );
  };

  const removeMonster = (id: string) => {
    setMonsters(prev => prev.filter(monster => monster.id !== id));
  };

  const getTimeRemaining = (monster: Monster) => {
    const timePassed = currentTime - monster.lastKilled;
    const timeRemaining = monster.spawnTime - timePassed;
    
    if (timeRemaining <= 0) return 'Ready!';
    
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const getProgressPercentage = (monster: Monster) => {
    const timePassed = currentTime - monster.lastKilled;
    const progress = (timePassed / monster.spawnTime) * 100;
    return Math.min(100, progress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Skull className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Wakfu Monster Timer</h1>
        </div>

        <form onSubmit={addMonster} className="bg-white/10 p-6 rounded-lg backdrop-blur-sm mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newMonsterName}
                onChange={(e) => setNewMonsterName(e.target.value)}
                placeholder="Monster name"
                className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 focus:outline-none focus:border-white/50"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="flex-1 px-4 py-2 rounded bg-white/20 border border-white/30 focus:outline-none focus:border-white/10 text:color-black/10"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowLocationInput(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Add Location
                </button>
              </div>
              
              {showLocationInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="New location name"
                    className="flex-1 px-4 py-2 rounded bg-white/20 border border-white/30 focus:outline-none focus:border-white/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLocationSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleLocationSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLocationInput(false);
                      setNewLocation('');
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="spawnTime"
                  value="60"
                  checked={newSpawnTime === '60'}
                  onChange={(e) => setNewSpawnTime(e.target.value)}
                  className="w-4 h-4 text-emerald-600 bg-white/20 border-white/30 focus:ring-emerald-500"
                />
                <span className="ml-2">60 min</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="spawnTime"
                  value="150"
                  checked={newSpawnTime === '150'}
                  onChange={(e) => setNewSpawnTime(e.target.value)}
                  className="w-4 h-4 text-emerald-600 bg-white/20 border-white/30 focus:ring-emerald-500"
                />
                <span className="ml-2">150 min</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="spawnTime"
                  value="240"
                  checked={newSpawnTime === '240'}
                  onChange={(e) => setNewSpawnTime(e.target.value)}
                  className="w-4 h-4 text-emerald-600 bg-white/20 border-white/30 focus:ring-emerald-500"
                />
                <span className="ml-2">240 min</span>
              </label>
            </div>
            
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-2 w-fit"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>

        <div className="grid gap-4">
          {monsters.map(monster => (
            <div
              key={monster.id}
              className="bg-white/10 p-4 rounded-lg backdrop-blur-sm relative overflow-hidden"
            >
              <div
                className="absolute left-0 bottom-0 h-1 bg-emerald-500 transition-all duration-1000"
                style={{ width: `${getProgressPercentage(monster)}%` }}
              />
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{monster.name}</h3>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeRemaining(monster)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{monster.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => markKilled(monster.id)}
                    className="p-2 bg-amber-600 hover:bg-amber-700 rounded"
                    title="Mark as killed"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeMonster(monster.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded"
                    title="Remove timer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {monsters.length === 0 && (
          <div className="text-center text-white/60 mt-8">
            <p>No monsters added yet. Add your first monster timer above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
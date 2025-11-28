import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { Trash2, Loader } from 'lucide-react';

export default function ColorManager() {
  const [uniqueColorValues, setUniqueColorValues] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [colorInput, setColorInput] = useState({});

  useEffect(() => {
    fetchUniqueColorValues();
    fetchColors();
  }, []);

  const fetchUniqueColorValues = async () => {
    try {
      console.log('Fetching unique color values...');
      const res = await axios.get(`${API_BASE_URL}/colors/unique-values`);
      console.log('Unique color values:', res.data);
      setUniqueColorValues(res.data || []);
    } catch (err) {
      console.error('Error fetching unique color values:', err);
    }
  };

  const fetchColors = async () => {
    try {
      console.log('Fetching all colors...');
      const res = await axios.get(`${API_BASE_URL}/colors`);
      console.log('All colors:', res.data);
      setColors(res.data || []);
    } catch (err) {
      console.error('Error fetching colors:', err);
    }
  };

  const handleColorCodeChange = (colorName, colorCode) => {
    setColorInput(prev => ({
      ...prev,
      [colorName]: colorCode
    }));
  };

  const handleSaveColor = async (colorName) => {
    try {
      setLoading(true);
      const colorCode = colorInput[colorName] || null;
      
      console.log('Saving color:', { colorName, colorCode });
      await axios.post(`${API_BASE_URL}/colors`, {
        name: colorName,
        hex_code: colorCode
      });

      console.log('Color saved successfully');

      // Clear input
      setColorInput(prev => ({
        ...prev,
        [colorName]: ''
      }));

      // Fetch both lists to update UI
      await fetchColors();
      await fetchUniqueColorValues();
    } catch (err) {
      console.error('Error saving color:', err);
      alert('Error saving color: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColor = async (id) => {
    if (!confirm('Delete this color?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/colors/${id}`);
      await fetchColors();
    } catch (err) {
      console.error('Error deleting color:', err);
      alert('Error deleting color');
    } finally {
      setLoading(false);
    }
  };

  const createdColorNames = colors.map(c => c.name);

  return (
    <div className="space-y-8">
      {/* Unique Color Values Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Colors From Variations</h2>
        <p className="text-gray-600 mb-6">Select unique color variation values and enter their color codes</p>

        {loading && uniqueColorValues.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : uniqueColorValues.length === 0 ? (
          <div className="text-gray-500">No color variations found</div>
        ) : (
          <div className="space-y-3">
            {uniqueColorValues.map((colorName) => {
              const isCreated = createdColorNames.includes(colorName);
              return (
                <div
                  key={colorName}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{colorName}</p>
                    {isCreated && <p className="text-sm text-green-600">✓ Created</p>}
                  </div>

                  {!isCreated ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorInput[colorName] || '#000000'}
                        onChange={(e) => handleColorCodeChange(colorName, e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="#000000"
                        value={colorInput[colorName] || ''}
                        onChange={(e) => handleColorCodeChange(colorName, e.target.value)}
                        className="border px-3 py-2 rounded text-sm font-mono w-24"
                      />
                      <button
                        onClick={() => handleSaveColor(colorName)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="text-green-600 font-semibold">Saved ✓</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Colors Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Colors</h2>

        {loading && colors.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : colors.length === 0 ? (
          <div className="text-gray-500">No colors saved yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((color) => (
              <div
                key={color.id}
                className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: color.hex_code || '#eee' }}
                    className="w-12 h-12 rounded border border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{color.name}</p>
                    <p className="text-sm text-gray-600">{color.hex_code || 'No code'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteColor(color.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // Import from env file to secure API key
  const API_URL = process.env.REACT_APP_API_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const stockSymbol = "AAPL";

  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    yearRange: { start: 2020, end: 2024 },
    revenueRange: { min: 0, max: Infinity },
    netIncomeRange: { min: 0, max: Infinity },
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'date', // Default sorting by date
    direction: 'asc',
  });

  // Connecting and fetching data from API
  useEffect(() => {
    const fetchData = async () => {
      const url = `${API_URL}${stockSymbol}?period=annual&apikey=${API_KEY}`;

      try {
        const response = await axios.get(url);
        setData(response.data);
        setFilteredData(response.data); // Set initial filtered data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, API_KEY]);

  const applyFilters = React.useCallback(() => {
    if (data) {
      const filtered = data.filter(item => {
        const year = parseInt(item.date.split('-')[0]);
        return (
          year >= filters.yearRange.start &&
          year <= filters.yearRange.end &&
          item.revenue >= filters.revenueRange.min &&
          item.revenue <= filters.revenueRange.max &&
          item.netIncome >= filters.netIncomeRange.min &&
          item.netIncome <= filters.netIncomeRange.max
        );
      });
      setFilteredData(filtered);
    }
  }, [data, filters]);

  // Filter handler for years, revenue, and net income
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const [filterType, filterKey] = name.split('.');

    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterType]: {
          ...prevFilters[filterType],
          [filterKey]: value === '' ? (filterKey === 'max' ? Infinity : 0) : parseInt(value),
        },
      };

      // Apply the updated filters immediately
      applyFilters(newFilters);
      return newFilters;
    });
  };

  // Function to toggle filter visibility
  const toggleFilters = () => {
    setIsFilterVisible(prevState => !prevState);
  };

  useEffect(() => {
    applyFilters(); // Apply filters when the component is mounted or filters change
  }, [filters, applyFilters]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortConfig.key === 'revenue' || sortConfig.key === 'netIncome') {
          return sortConfig.direction === 'asc'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const formatToBillions = (num) => {
    if (num === null || num === undefined) return 'N/A'; // Handle null or undefined values
    const formattedNumber = (num / 1_000_000_000).toFixed(3); // Format to 3 decimal places
    return `${formattedNumber} B`; // Add "B" for billions
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-stocks-bg bg-center min-h-screen flex justify-center items-center py-4 px-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-[32px] font-semibold leading-tight text-custom-blue mobile:text-[64px] text-center mb-6">Income Statement for AAPL {"(USD)"}</h1>
  
        {/* Button to toggle filters */}
        <button
          onClick={toggleFilters}
          className="ml-0 text-left bg-blue-theme text-white py-2 px-4 rounded mb-6 inline-block"
        >
          {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {/* Filters Section */}
        {isFilterVisible && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            <div className="space-y-4">
              <div>
                <label className="block">Year Range:</label>
                <div className="flex space-x-2">
                  <select
                    name="yearRange.start"
                    value={filters.yearRange.start}
                    onChange={handleFilterChange}
                    className="w-1/2 p-2 border border-black rounded"
                  >
                    {Array.from({ length: 5 }, (_, i) => 2020 + i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="my-auto">-</span>
                  <select
                    name="yearRange.end"
                    value={filters.yearRange.end}
                    onChange={handleFilterChange}
                    className="w-1/2 p-2 border border-black rounded"
                  >
                    {Array.from({ length: 5 }, (_, i) => 2020 + i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block">Revenue Range:</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="revenueRange.min"
                    value={filters.revenueRange.min}
                    onChange={handleFilterChange}
                    className="w-1/2 p-2 border border-black rounded"
                    placeholder="Min Revenue"
                  />
                  <span className="my-auto">-</span>
                  <input
                    type="number"
                    name="revenueRange.max"
                    value={filters.revenueRange.max}
                    onChange={handleFilterChange}
                    className="w-1/2 p-2 border border-black rounded"
                    placeholder="Max Revenue"
                  />
                </div>
              </div>

              <div>
                <label className="block">Net Income Range:</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="netIncomeRange.min"
                    value={filters.netIncomeRange.min}
                    onChange={handleFilterChange}
                    className="w-1/2 p-2 border border-black rounded"
                    placeholder="Min Net Income"
                  />
                  <span className="my-auto">-</span>
                  <input
                    type="number"
                    name="netIncomeRange.max"
                    value={filters.netIncomeRange.max}
                    onChange={handleFilterChange}
                    className="w-1/2 p-2 border border-black rounded"
                    placeholder="Max Net Income"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
  
        {filteredData && filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-auto mb-6">
              <thead className="bg-gray-200">
                <tr>
                  <th
                    className="p-2 border-b w-13 whitespace-nowrap cursor-pointer text-center border font-medium bg-blue-theme text-white focus:bg-blue-shade disabled:bg-black-400 disabled:text-white border-transparent"
                    onClick={() => handleSort('date')}
                  >
                    Year
                    {sortConfig.key === 'date' && sortConfig.direction === 'asc' ? ' ↑' : ''}
                    {sortConfig.key === 'date' && sortConfig.direction === 'desc' ? ' ↓' : ''}
                  </th>
                  <th
                    className="p-2 border-b w-50 whitespace-nowrap cursor-pointer text-center border font-medium bg-blue-theme text-white focus:bg-blue-shade disabled:bg-black-400 disabled:text-white border-transparent"
                    onClick={() => handleSort('revenue')}
                  >
                    Revenue
                    {sortConfig.key === 'revenue' && sortConfig.direction === 'asc' ? ' ↑' : ''}
                    {sortConfig.key === 'revenue' && sortConfig.direction === 'desc' ? ' ↓' : ''}
                  </th>
                  <th
                    className="p-2 border-b w-32 whitespace-nowrap cursor-pointer text-center border font-medium bg-blue-theme text-white focus:bg-blue-shade disabled:bg-black-400 disabled:text-white border-transparent"
                    onClick={() => handleSort('netIncome')}
                  >
                    Net Income
                    {sortConfig.key === 'netIncome' && sortConfig.direction === 'asc' ? ' ↑' : ''}
                    {sortConfig.key === 'netIncome' && sortConfig.direction === 'desc' ? ' ↓' : ''}
                  </th>
                  <th className="p-2 border-b w-32 whitespace-nowrap cursor-pointer text-center border font-medium bg-blue-theme text-white focus:bg-blue-shade disabled:bg-black-400 disabled:text-white border-transparent">Gross Profit</th>
                  <th className="p-2 border-b w-13 whitespace-nowrap cursor-pointer text-center border font-medium bg-blue-theme text-white focus:bg-blue-shade disabled:bg-black-400 disabled:text-white border-transparent">EPS</th>
                  <th className="p-2 border-b w-16 whitespace-nowrap cursor-pointer text-center border font-medium bg-blue-theme text-white focus:bg-blue-shade disabled:bg-black-400 disabled:text-white border-transparent">Operating Income</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index} className={index !== sortedData.length - 1 ? "border-b border-black" : ""}>
                    <td className="p-2 text-center min-w-[120px]">{item.date}</td>
                    <td className="p-2 text-center min-w-[120px]">{formatToBillions(item.revenue)}</td>
                    <td className="p-2 text-center">{formatToBillions(item.netIncome)}</td>
                    <td className="p-2 text-center">{formatToBillions(item.grossProfit)}</td>
                    <td className="p-2 text-center">{item.eps}</td>
                    <td className="p-2 text-center">{formatToBillions(item.operatingIncome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
}

export default App;

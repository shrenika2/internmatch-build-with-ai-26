import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mx-2">
      <input 
        type="text" 
        className="bg-[#1e1f22] text-sm text-[#dbdee1] rounded px-2 py-1 outline-none w-32 focus:w-48 transition-all"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="absolute right-2 top-1 text-gray-500 text-xs">🔍</span>
    </form>
  );
};

export default SearchBar;

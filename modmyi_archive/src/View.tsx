// Updated PackageList component

import React, { useState, useEffect } from 'react';

const PackageList = () => {
  const [packages, setPackages] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Default items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/db.json'); // Replace with the correct path
        const data = await response.json();
        setPackages(
          data.posts.map((item: any) => {
            const isAvailable = Object.keys(item.archived_snapshots).length > 0;
            return {
              ...item,
              status: isAvailable ? 'available' : 'unavailable'
            };
          })
        );
      } catch (error) {
        console.error('Erreur de chargement du fichier JSON :', error);
      }
    };

    fetchData();
  }, []);

  const filteredPackages = packages.filter(
    (packageInfo: any) =>
      packageInfo.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (packageInfo.archived_snapshots.closest?.url.toLowerCase().includes(searchTerm.toLowerCase()) &&
        packageInfo.archived_snapshots.closest.url) // Filter based on archived_snapshots.closest.url
  );

  const totalPackages = filteredPackages.length;
  const totalPages = Math.ceil(totalPackages / itemsPerPage);

  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to the first page when changing items per page
  };

  const totalAvailablePackages = filteredPackages.reduce(
    (count: number, packageInfo: any) => (packageInfo.status === 'available' ? count + 1 : count),
    0
  );
  
  const totalUnavailablePackages = filteredPackages.reduce(
    (count: number, packageInfo: any) => (packageInfo.status === 'unavailable' ? count + 1 : count),
    0
  );

  function formatDate(timestamp: string | undefined) {
    if (!timestamp) return '';
  
    // Assuming the timestamp format is "YYYYMMDDHHmmss"
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);
    const second = timestamp.slice(12, 14);
  
    // Constructing a Date object with the extracted components
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  
    return date.toLocaleString(); // Adjust the formatting based on your needs
  }

  return (
    <div>
      <h1>NostalGiOS ModMyi debs extractor</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    <div>

    <p>
      Total Packages:{' '}
      <span className="available-count">{totalAvailablePackages}</span> Available /{' '}
      <span className="unavailable-count">{totalUnavailablePackages}</span> Unavailable
    </p>
    <table className="package-table">
      <thead>
        <tr>
          <th>#</th>
          <th>URL</th>
          <th>Date</th> {/* New column for formatted date */}
          <th>Télécharger</th>
        </tr>
      </thead>
      <tbody>
        {paginatedPackages.map((packageInfo: any, index: number) => (
          <tr key={index + 1} className={`package-item ${packageInfo.status}`}>
            <td>{index + 1}</td>
            <td>{packageInfo.url.split('/').slice(6).join(' - ')}</td>
            <td>{formatDate(packageInfo.archived_snapshots.closest?.timestamp)}</td>
            <td>
              <a href={packageInfo.archived_snapshots?.closest?.url} target="_blank" rel="noopener noreferrer">
                Télécharger
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
        <div className="items-per-page">
          <input
            type="number"
            min="1"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          />
        </div>
      </div>
  </div>
    </div>
  );
};

export default PackageList;

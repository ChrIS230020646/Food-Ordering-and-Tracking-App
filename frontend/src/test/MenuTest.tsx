import React, { useState, useEffect } from 'react';

function MenuTest() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/menu/restaurant/1')
      .then(response => response.json())
      .then(data => {
        console.log('menu data:', data);
        setMenu(data);
      })
      .catch(error => console.error('get menu failed:', error));
  }, []);

  return (
    <div>
      <h2>Menu Test</h2>
      {menu.map(item => (
        <div key={item.itemId}>
          <h3>{item.itemName}</h3>
          <p>{item.description} - ${item.price}</p>
        </div>
      ))}
    </div>
  );
}

export default MenuTest;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // const [data, setData] = useState('')
  const [todo, setTodo] = useState([]);

  const getTodos = async () => {
    const response = await axios.get('/todos');
  };

  useEffect(() => {
    getTodos();
  }, []);

  //   useEffect(() => {
  //     axios
  //       .get('http://localhost:6005/api/data')
  //       .then((response) => {
  //         setData(response.data.message)
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching data: ', error)
  //       })
  //   }, [])

  return (
    <div>
      <h1>Data from Express API:</h1>
      <p></p>
    </div>
  );
}

export default App;

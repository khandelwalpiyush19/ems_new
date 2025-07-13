import { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [storageStatus, setStorageStatus] = useState('Initializing...');

  // Enhanced localStorage initialization
  useEffect(() => {
    const initializeTodos = () => {
      try {
        setStorageStatus('Loading todos...');
        const savedTodos = localStorage.getItem('todos');
        
        
        if (savedTodos) {
          const parsed = JSON.parse(savedTodos);
          if (Array.isArray(parsed)) {
            setTodos(parsed);
            setStorageStatus('Todos loaded successfully');
          } else {
            console.warn('Invalid todos format - resetting');
            localStorage.removeItem('todos');
            setStorageStatus('Reset invalid todo data');
          }
        } else {
          setStorageStatus('No saved todos found');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setStorageStatus(`Error: ${error.message}`);
        localStorage.removeItem('todos');
      }
    };

    // Test if localStorage is available
    const testLocalStorage = () => {
      try {
        const testKey = `test_${Date.now()}`;
        localStorage.setItem(testKey, 'test_value');
        localStorage.removeItem(testKey);
        initializeTodos();
      } catch (e) {
        console.error('localStorage unavailable:', e);
        setStorageStatus('localStorage not available - using in-memory storage');
      }
    };

    testLocalStorage();
  }, []);

  // Save todos with error handling
  useEffect(() => {
    if (todos.length === 0 && storageStatus.includes('Initializing')) {
      return; // Skip initial empty save
    }

    try {
      localStorage.setItem('todos', JSON.stringify(todos));
      setStorageStatus(`Saved ${todos.length} todos`);
    } catch (error) {
      console.error('Save error:', error);
      setStorageStatus(`Save failed: ${error.message}`);
    }
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === '') return;
    
    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false
    };
    
    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = (id) => {
    if (editValue.trim() === '') {
      cancelEditing();
      return;
    }
    
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: editValue } : todo
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const clearAllTodos = () => {
    if (window.confirm('Are you sure you want to delete all todos?')) {
      setTodos([]);
      localStorage.removeItem('todos');
      setStorageStatus('All todos cleared');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg ">
      <h1 className="text-2xl font-bold text-center mb-4">To-Do List</h1>
      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaPlus className="mr-1" /> Add
        </button>
      </div>
      
      {/* Todo List */}
      <ul className="space-y-2">
        {todos.length === 0 ? (
          <li className="text-center text-gray-500 py-4 border rounded-md">
            No todos yet. Add one above!
          </li>
        ) : (
          todos.map(todo => (
            <li 
              key={todo.id}
              className={`flex items-center justify-between p-3 border rounded-md ${
                todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
              }`}
            >
              {editingId === todo.id ? (
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="text-green-500 hover:text-green-700 p-1"
                      title="Save"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Cancel"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="h-5 w-5 text-blue-500 rounded mr-3 flex-shrink-0"
                  />
                  <span 
                    className={`flex-1 break-words ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => startEditing(todo.id, todo.text)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Todo;
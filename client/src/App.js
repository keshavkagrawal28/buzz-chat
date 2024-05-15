import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Chat from './pages/Chat';

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/chats' Component={Chat} />
      </Routes>
    </div>
  );
}

export default App;

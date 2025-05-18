import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Groups from './Groups.js';
import Group from './Group.js';
import AddUser from './AddUser.js';
import Transaction from './Transaction.js';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AddUser />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/group/:id" element={<Group />} />
        <Route path="/transaction/:id" element={<Transaction />} />
        <Route path="*" element={<AddUser />} />
      </Routes>
    </Router>
  )
}


export default App;

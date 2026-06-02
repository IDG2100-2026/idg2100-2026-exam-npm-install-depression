import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";

function Header() {
   const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetch("http://localhost:4567/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);

        const savedUser = localStorage.getItem("userId");

        if (savedUser) {
          setSelectedUser(savedUser);
        }
      });
  }, []);

function handleUserChange(e) {
  const userId = e.target.value;

  setSelectedUser(userId);

  if (!userId) {
    localStorage.removeItem("userId");
    localStorage.removeItem("userPoints");
    return;
  }

  const user = users.find(user => user._id === userId);

  localStorage.setItem("userId", userId);
  localStorage.setItem("userPoints", user?.points || 0);
}

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/lobby">Lobby</Link>
        <Link to="/about">About</Link>
        <Link to="/about-dice">How to play</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/profile/:id">Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/admin">Admin</Link>

        <select value={selectedUser} onChange={handleUserChange}>
        <option value="">Select user</option>

        {users.map(user => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}

      </select>
      </nav>
    </header>
  );
}

export default Header;
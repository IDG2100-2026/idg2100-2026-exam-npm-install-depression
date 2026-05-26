import { Link } from 'react-router-dom';

export default function AdminDashPage() {
  return (
  <div>
  <h1>Admin Dashboard Page</h1>
    <Link to= "/admin/tournaments">Tournaments</Link>
    <Link to= "/admin/users">Users</Link>
    <Link to= "/admin/comments">Comments</Link>
  </div>
  )
}
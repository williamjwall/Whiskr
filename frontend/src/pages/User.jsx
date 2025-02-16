import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function User() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/users/${id}`)
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user:", error));
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Bookmarks:</strong> {JSON.stringify(user.bookmarks)}</p>
    </div>
  );
}

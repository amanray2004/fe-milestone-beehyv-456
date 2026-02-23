





import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./Login";
import Boards from "./pages/Boards";
import BoardDetails from "./pages/BoardDetails";



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-gray-100">
      {/* Navbar */}
      <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Trello Clone</h1>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Routes */}
      <Routes>
        
        <Route path="/" element={<Boards />} />
        <Route path="/board/:id" element={<BoardDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
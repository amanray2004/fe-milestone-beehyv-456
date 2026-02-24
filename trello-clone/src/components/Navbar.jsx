import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import logo from "../assets/beehyv.png";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-6">
        <h1
          onClick={() => navigate("/boards")}
          className="text-xl font-bold cursor-pointer hover:text-blue-600 transition"
        >
          BeeHyv Boards
        </h1>

        <button
          onClick={() => navigate("/boards")}
          className="text-sm text-gray-600 hover:text-black transition"
        >
          Boards
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        
        {/* COMPANY LOGO */}
        <img
          src={logo}
          alt="Company Logo"
          className="h-8 object-contain"
        />

        <span className="text-sm text-gray-600">
          {auth.currentUser?.email}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
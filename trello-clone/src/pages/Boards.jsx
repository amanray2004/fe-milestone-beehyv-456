








import { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Boards() {
  const [boards, setBoards] = useState([]);
  const [newBoard, setNewBoard] = useState("");
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");

  const navigate = useNavigate();
  const user = auth.currentUser;

  const fetchBoards = async () => {
    if (!user) return;

    const boardsRef = collection(db, "users", user.uid, "boards");
    const q = query(boardsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const boardsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setBoards(boardsList);
  };

  const createBoard = async () => {
    if (!newBoard.trim() || !user) return;

    const boardsRef = collection(db, "users", user.uid, "boards");

    await addDoc(boardsRef, {
      title: newBoard,
      createdAt: new Date(),
    });

    setNewBoard("");
    fetchBoards();
  };

  const startEdit = (board) => {
    setEditingBoardId(board.id);
    setEditedTitle(board.title);
  };

  const saveEdit = async (boardId) => {
    if (!editedTitle.trim() || !user) return;

    await updateDoc(
      doc(db, "users", user.uid, "boards", boardId),
      { title: editedTitle }
    );

    setEditingBoardId(null);
    fetchBoards();
  };

  const deleteBoard = async (boardId) => {
    if (!user) return;

    const confirmDelete = window.confirm("Delete this board?");
    if (!confirmDelete) return;

    await deleteDoc(
      doc(db, "users", user.uid, "boards", boardId)
    );

    fetchBoards();
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-200 px-8 py-8">

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Your Boards
        </h2>

        {/* Create Board */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={newBoard}
            onChange={(e) => setNewBoard(e.target.value)}
            placeholder="Create a new board..."
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={createBoard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + Create
          </button>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="relative bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 group"
            >
              {/* EDIT MODE */}
              {editingBoardId === board.id ? (
                <>
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => saveEdit(board.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  {/* BOARD TITLE */}
                  <div
                    onClick={() => navigate(`/board/${board.id}`)}
                    className="cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-800">
                      {board.title}
                    </h3>
                  </div>

                  {/* ACTION BUTTONS (show on hover) */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => startEdit(board)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

export default Boards;
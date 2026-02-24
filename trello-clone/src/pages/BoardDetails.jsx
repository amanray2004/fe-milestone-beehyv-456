import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { DragDropContext } from "@hello-pangea/dnd";
import ListColumn from "../components/ListColumn";
import Navbar from "../components/Navbar"; // ✅ IMPORT NAVBAR

function BoardDetails() {
  const { id: boardId } = useParams();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    fetchBoardData();
  }, [boardId]);

  const fetchBoardData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const boardRef = doc(db, "users", user.uid, "boards", boardId);
    const boardSnap = await getDoc(boardRef);

    if (boardSnap.exists()) {
      setBoard(boardSnap.data());
    }

    const listsRef = collection(
      db,
      "users",
      user.uid,
      "boards",
      boardId,
      "lists"
    );

    const listsSnap = await getDocs(listsRef);

    const listsData = [];

    for (const listDoc of listsSnap.docs) {
      const cardsRef = collection(
        db,
        "users",
        user.uid,
        "boards",
        boardId,
        "lists",
        listDoc.id,
        "cards"
      );

      const cardsSnap = await getDocs(query(cardsRef, orderBy("order")));

      listsData.push({
        id: listDoc.id,
        ...listDoc.data(),
        cards: cardsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      });
    }

    setLists(listsData);
  };

  const createList = async () => {
    if (!newListTitle.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(
      collection(db, "users", user.uid, "boards", boardId, "lists"),
      { title: newListTitle }
    );

    setNewListTitle("");
    fetchBoardData();
  };

  const deleteList = async (listId) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(
      doc(db, "users", user.uid, "boards", boardId, "lists", listId)
    );

    fetchBoardData();
  };

  const editList = async (listId, newTitle) => {
    if (!newTitle.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(
      doc(db, "users", user.uid, "boards", boardId, "lists", listId),
      { title: newTitle }
    );

    fetchBoardData();
  };

  const createCard = async (listId, title) => {
    if (!title.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    const list = lists.find(l => l.id === listId);

    await addDoc(
      collection(
        db,
        "users",
        user.uid,
        "boards",
        boardId,
        "lists",
        listId,
        "cards"
      ),
      {
        title,
        order: list.cards.length
      }
    );

    fetchBoardData();
  };

  const deleteCard = async (listId, cardId) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(
      doc(
        db,
        "users",
        user.uid,
        "boards",
        boardId,
        "lists",
        listId,
        "cards",
        cardId
      )
    );

    fetchBoardData();
  };

  const editCard = async (listId, cardId, newTitle) => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(
      doc(
        db,
        "users",
        user.uid,
        "boards",
        boardId,
        "lists",
        listId,
        "cards",
        cardId
      ),
      { title: newTitle }
    );

    fetchBoardData();
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const user = auth.currentUser;
    if (!user) return;

    const sourceListIndex = lists.findIndex(l => l.id === source.droppableId);
    const destListIndex = lists.findIndex(l => l.id === destination.droppableId);

    const sourceList = lists[sourceListIndex];
    const destList = lists[destListIndex];

    const sourceCards = Array.from(sourceList.cards);
    const [movedCard] = sourceCards.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCards.splice(destination.index, 0, movedCard);

      for (let i = 0; i < sourceCards.length; i++) {
        await updateDoc(
          doc(
            db,
            "users",
            user.uid,
            "boards",
            boardId,
            "lists",
            sourceList.id,
            "cards",
            sourceCards[i].id
          ),
          { order: i }
        );
      }
    } else {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "boards",
          boardId,
          "lists",
          sourceList.id,
          "cards",
          movedCard.id
        )
      );

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "boards",
          boardId,
          "lists",
          destList.id,
          "cards"
        ),
        {
          title: movedCard.title,
          order: destination.index
        }
      );
    }

    fetchBoardData();
  };

  if (!board) return <div>Loading...</div>;

  return (
    <>
      {/* ✅ NAVBAR AT TOP */}
      <Navbar />

      {/* ✅ BOARD AREA */}
      <div className="min-h-screen bg-gray-200 px-8 py-6">
        
        {/* Board Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {board.title}
        </h2>

        {/* Add List Section */}
        <div className="mb-6 flex gap-3">
          <input
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="Add a new list..."
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={createList}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + Add List
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {lists.map(list => (
              <ListColumn
                key={list.id}
                list={list}
                boardId={boardId}
                createCard={createCard}
                deleteCard={deleteCard}
                editCard={editCard}
                deleteList={deleteList}
                editList={editList}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}

export default BoardDetails;
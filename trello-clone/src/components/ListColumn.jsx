import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

export default function ListColumn({
  list,
  boardId,
  createCard,
  deleteCard,
  editCard,
  deleteList,
  editList
}) {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [editedCardTitle, setEditedCardTitle] = useState("");

  const [isEditingList, setIsEditingList] = useState(false);
  const [editedListTitle, setEditedListTitle] = useState(list.title);

  const [cardDescriptions, setCardDescriptions] = useState({});

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    createCard(list.id, newCardTitle);
    setNewCardTitle("");
  };

  const startCardEdit = (card) => {
    setEditingCardId(card.id);
    setEditedCardTitle(card.title);
  };

  const saveCardEdit = (cardId) => {
    if (!editedCardTitle.trim()) return;
    editCard(list.id, cardId, editedCardTitle);
    setEditingCardId(null);
  };

  const saveListEdit = () => {
    if (!editedListTitle.trim()) return;
    editList(list.id, editedListTitle);
    setIsEditingList(false);
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleUpdateDescription = async (cardId, value) => {
    const user = auth.currentUser;
    if (!user) return;

    setCardDescriptions((prev) => ({
      ...prev,
      [cardId]: value
    }));

    try {
      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          "boards",
          boardId,
          "lists",
          list.id,
          "cards",
          cardId
        ),
        { description: value }
      );
    } catch (error) {
      console.log(error);
    }
  };

    return (
    <div className="bg-gray-100 p-5 rounded-2xl w-72 shadow-inner border border-gray-200">

        {/* LIST HEADER */}
        <div className="flex justify-between items-center mb-4 group relative">
        {isEditingList ? (
            <div className="flex gap-2 w-full">
            <input
                value={editedListTitle}
                onChange={(e) => setEditedListTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
                onClick={saveListEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
            >
                Save
            </button>
            </div>
        ) : (
            <>
            <h3 className="font-semibold text-gray-800 text-base">
                {list.title}
            </h3>

            {/* Hover Buttons */}
            <div className="absolute right-0 flex gap-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition">
                <button
                onClick={() => setIsEditingList(true)}
                className="text-blue-600 hover:text-blue-800"
                >
                Edit
                </button>
                <button
                onClick={() => deleteList(list.id)}
                className="text-red-500 hover:text-red-700"
                >
                Delete
                </button>
            </div>
            </>
        )}
        </div>

        {/* CARDS */}
        <Droppable droppableId={list.id}>
        {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
            {list.cards?.map((card, index) => (
                <Draggable
                key={card.id}
                draggableId={card.id}
                index={index}
                >
                {(provided) => (
                    <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="relative bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-4 border border-gray-100 group"
                    >

                    {editingCardId === card.id ? (
                        <>
                        <input
                            value={editedCardTitle}
                            onChange={(e) =>
                            setEditedCardTitle(e.target.value)
                            }
                            className="w-full mb-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <button
                            onClick={() => saveCardEdit(card.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs transition"
                        >
                            Save
                        </button>
                        </>
                    ) : (
                        <>
                        <p className="font-medium text-gray-800 text-sm">
                            {card.title}
                        </p>

                        {/* Hover Buttons for Card */}
                        <div className="absolute top-3 right-3 flex gap-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition">
                            <button
                            onClick={() => startCardEdit(card)}
                            className="text-blue-600 hover:text-blue-800"
                            >
                            Edit
                            </button>

                            <button
                            onClick={() =>
                                deleteCard(list.id, card.id)
                            }
                            className="text-red-500 hover:text-red-700"
                            >
                            Delete
                            </button>
                        </div>
                        </>
                    )}

                    {/* DESCRIPTION */}
                    <textarea
                        value={
                        cardDescriptions[card.id] !== undefined
                            ? cardDescriptions[card.id]
                            : card.description || ""
                        }
                        onChange={(e) => {
                        handleUpdateDescription(card.id, e.target.value);
                        autoResize(e);
                        }}
                        onInput={autoResize}
                        placeholder="Add description..."
                        rows={1}
                        className="mt-3 w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    </div>
                )}
                </Draggable>
            ))}
            {provided.placeholder}
            </div>
        )}
        </Droppable>

        {/* ADD CARD */}
        <input
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
        placeholder="Add a new card..."
        className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
        onClick={handleAddCard}
        className="bg-blue-600 hover:bg-blue-700 transition text-white w-full mt-3 py-2 rounded-lg text-sm font-medium"
        >
        + Add Card
        </button>
    </div>
    );
}










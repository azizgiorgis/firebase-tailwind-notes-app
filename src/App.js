import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNote, setEditNote] = useState(null);
  const [newText, setNewText] = useState("");

  // Kullanıcı giriş durumunu izleme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchNotes(currentUser.uid);
      } else {
        setUser(null);
        setNotes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Kullanıcıya özel notları getir
  const fetchNotes = async (uid) => {
    const q = query(collection(db, "notes"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    const notesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotes(notesList);
  };

  // Yeni not ekleme
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addDoc(collection(db, "notes"), {
      text: newNote,
      uid: user.uid,
      createdAt: new Date(),
    });
    setNewNote("");
    fetchNotes(user.uid);
  };

  // Not silme
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    fetchNotes(user.uid);
  };
  // Not Düzenleme
  const handleEdit = (note) => {
    setEditNote(note);
    setNewText(note.text);
  };
  // Not KAydetme 
  const handleSaveEdit = async () => {
    if (!editNote) return;

    const noteRef = doc(db, "notes", editNote.id);
    await updateDoc(noteRef, { text: newText });

    setEditNote(null);
    setNewText("");
    await fetchNotes(user.uid);
  };


  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      fetchNotes(res.user.uid);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setNotes([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">📝 Notes App</h1>

      {!user ? (
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-sm">
          <input
            className="border border-gray-300 rounded-md w-full p-2 mb-2"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-md w-full p-2 mb-2"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 w-full"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2 w-full"
            >
              Register
            </button>
          </div>
        </div>

      ) : (
        <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <p className="text-xl font-semibold text-gray-700">Hoş Geldiniz, {user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 transition duration-150"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Yeni Not Ekleme Formu */}
          <div className="flex gap-2 mb-8">
            <input
              className="border border-gray-300 rounded-lg flex-grow p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Yeni bir not yazın..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button
              onClick={handleAddNote}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-3 transition duration-150"
            >
              Ekle
            </button>
          </div>

          {/* Not Listesi */}
          <ul className="space-y-4">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <span className="text-gray-800 flex-grow pr-4 break-words">{note.text}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md text-sm"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md text-sm"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Not Düzenleme Alanı (Modal benzeri) */}
          {editNote ? (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Notu Düzenle</h3>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg px-4 py-2 transition duration-150"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setEditNote(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg px-4 py-2 transition duration-150"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default App;

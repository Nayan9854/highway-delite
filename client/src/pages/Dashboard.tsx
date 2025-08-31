import { useEffect, useState } from "react";
import { api } from "../api";
import Button from "../components/Button";

type Note = { _id: string; text: string };
type User = { id: string; name: string; email: string; dob?: string };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  async function fetchAll() {
    const me = await api.get("/api/auth/me");
    setUser(me.data.user);
    const list = await api.get("/api/notes");
    setNotes(list.data.notes);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function addNote() {
    if (!text.trim()) return;
    const { data } = await api.post("/api/notes", { text });
    setNotes([data.note, ...notes]);
    setText("");
  }

  async function delNote(id: string) {
    await api.delete(`/api/notes/${id}`);
    setNotes(notes.filter((n) => n._id !== id));
  }

  async function logout() {
    await api.post("/api/auth/logout");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  }

  if (!user) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Logo on the left side */}
      <div className="flex items-center mb-6">
        <img src="/assets/top.jpg" alt="HD Logo" className="h-10 w-10 mr-2" />
        
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Dashboard</div>
          <h2 className="font-semibold">Welcome, {user.name}!</h2>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <button onClick={logout} className="text-sm text-blue-600">
          Logout
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note…"
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={addNote}>Create Note</Button>
      </div>

      <div className="mt-6 space-y-3">
        {notes.map((n) => (
          <div
            key={n._id}
            className="border rounded-lg p-3 flex justify-between items-start"
          >
            <p className="whitespace-pre-wrap">{n.text}</p>
            <button
              onClick={() => delNote(n._id)}
              className="text-xs text-red-600 ml-3"
            >
              Delete
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-sm text-gray-500">No notes yet.</div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import Avatar from "./Avatar";

const CreateGroupModal = ({ onClose, onCreate, friends = [] }) => {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState([]);

  const friendList = useMemo(() => friends || [], [friends]);

  const toggle = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const handleCreate = () => {
    if (!title.trim() || !selected.length) return;
    onCreate(title, selected);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1">New Group Chat</h2>
        <p className="text-sm text-gray-400 mb-4">
          Add friends and give it a name
        </p>

        <input
          type="text"
          placeholder="Group name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field mb-4"
        />

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Add Friends
        </p>
        <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
          {friendList.length === 0 && (
            <div className="text-sm text-gray-400 py-6 text-center">
              No friends found
            </div>
          )}

          {friendList.map((f) => (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                selected.includes(f.id) ? "bg-[#FCF1DD]" : "hover:bg-gray-50"
              }`}
            >
              <Avatar name={f.username} size="sm" />
              <span className="text-sm font-semibold text-gray-800 flex-1 text-left">
                {f.username}
              </span>
              {selected.includes(f.id) && (
                <Check size={16} className="text-[#F78660]" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={!title.trim() || !selected.length}
          className="btn-primary w-full py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Group
        </button>
      </div>
    </div>
  );
};

export default CreateGroupModal;

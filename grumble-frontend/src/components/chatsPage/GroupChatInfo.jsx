import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Avatar from "./Avatar";
import {
  addMembersToChatRoom,
  getChatRoom,
  leaveChatRoom,
  removeMemberFromChatRoom,
  updateChatMemberRole,
  updateChatRoom,
} from "../../services/chatService";

const GroupChatInfo = ({ roomId, onBack, onLeftGroup, onRoomUpdated }) => {
  const { user } = useAuth();
  const {
    showErrorToast,
    showGroupAvatarUpdatedToast,
    showMembersAddedToast,
    showMemberRemovedToast,
    showRoleUpdatedToast,
  } = useToast();

  const avatarFileInputRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [friends, setFriends] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  const myRole = useMemo(() => {
    const me = (members || []).find(
      (m) => Number(m.user_id) === Number(user?.id),
    );
    return me?.role || null;
  }, [members, user?.id]);

  const isAdmin = myRole === "admin";

  const memberIdSet = useMemo(() => {
    return new Set((members || []).map((m) => Number(m.user_id)));
  }, [members]);

  const addableFriends = useMemo(() => {
    return (friends || []).filter((f) => !memberIdSet.has(Number(f.id)));
  }, [friends, memberIdSet]);

  const load = async () => {
    if (!roomId) return;

    try {
      setLoading(true);

      const [roomData, friendsRes] = await Promise.all([
        getChatRoom(roomId),
        api.get("/friends"),
      ]);

      setRoom(roomData);
      setMembers(roomData?.members || []);

      setFriends(friendsRes.data?.data || []);
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load group info",
        "Group Info",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const onPickAvatarImage = () => {
    if (!isAdmin || saving) return;
    avatarFileInputRef.current?.click();
  };

  const onAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0];
    // allow selecting same file twice
    e.target.value = "";

    if (!roomId || !isAdmin || saving) return;
    if (!file) return;

    try {
      setSaving(true);

      const form = new FormData();
      form.append("avatar", file);

      const updated = await updateChatRoom(roomId, form);
      setRoom((prev) => ({ ...(prev || {}), ...(updated || {}) }));
      showGroupAvatarUpdatedToast();
      onRoomUpdated?.();
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update avatar",
        "Group Photo",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectedToAdd = (id) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const addMembers = async () => {
    if (!roomId || !isAdmin || saving) return;
    if (!selectedToAdd.length) return;

    try {
      setSaving(true);

      const updatedMembers = await addMembersToChatRoom(roomId, selectedToAdd);
      setMembers(updatedMembers || []);
      showMembersAddedToast(selectedToAdd.length);
      setSelectedToAdd([]);
      setShowAddMembers(false);
      onRoomUpdated?.();
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message || err?.message || "Failed to add members",
        "Add Members",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (memberUserId) => {
    if (!roomId || !isAdmin || saving) return;

    try {
      setSaving(true);

      const updatedMembers = await removeMemberFromChatRoom(
        roomId,
        memberUserId,
      );
      setMembers(updatedMembers || []);
      showMemberRemovedToast();
      onRoomUpdated?.();
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove member",
        "Remove Member",
      );
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (memberUserId, role) => {
    if (!roomId || !isAdmin || saving) return;

    try {
      setSaving(true);

      const updatedMembers = await updateChatMemberRole(
        roomId,
        memberUserId,
        role,
      );
      setMembers(updatedMembers || []);
      showRoleUpdatedToast();
      onRoomUpdated?.();
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message || err?.message || "Failed to update role",
        "Update Role",
      );
    } finally {
      setSaving(false);
    }
  };

  const leaveGroup = async () => {
    if (!roomId || saving) return;

    try {
      setSaving(true);

      await leaveChatRoom(roomId);
      onRoomUpdated?.();
      onLeftGroup?.();
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message || err?.message || "Failed to leave group",
        "Leave Group",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <div className="flex items-center gap-3 px-4 py-3 bg-[#FCF1DD] border-b border-orange-100 flex-shrink-0">
        <button onClick={onBack} className="btn-ghost p-1 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <p className="font-bold text-gray-900 text-base truncate">Group Info</p>
      </div>

      {/* Errors are shown via global toasts */}

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading…</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full border-4 border-[#F78660] p-1">
                  <Avatar
                    name={room?.name || "Group"}
                    src={room?.avatar_url || null}
                    size="xl"
                  />
                </div>

                <p className="mt-3 font-bold text-gray-900 text-2xl w-full truncate">
                  {room?.name || "Group chat"}
                </p>

                {isAdmin && (
                  <div className="mt-3">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onAvatarFileSelected}
                      className="hidden"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={onPickAvatarImage}
                      className="btn-primary px-4"
                      disabled={saving}
                    >
                      {room?.avatar_url ? "Change photo" : "Add photo"}
                    </button>
                  </div>
                )}

                <p className="mt-3 text-sm text-gray-400">
                  {members.length} member{members.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Members
                </p>
                {isAdmin && (
                  <button
                    className="btn-primary px-4 py-2 rounded-full text-sm flex items-center gap-2"
                    onClick={() => setShowAddMembers((s) => !s)}
                    disabled={saving}
                  >
                    <Plus size={16} /> Add
                  </button>
                )}
              </div>

              {showAddMembers && isAdmin && (
                <div className="mt-3 border border-gray-100 rounded-2xl p-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Add friends
                  </p>

                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {addableFriends.length === 0 && (
                      <div className="text-sm text-gray-400 py-4 text-center">
                        No friends available to add
                      </div>
                    )}

                    {addableFriends.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => toggleSelectedToAdd(f.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                          selectedToAdd.includes(f.id)
                            ? "bg-white"
                            : "hover:bg-white"
                        }`}
                        type="button"
                      >
                        <Avatar name={f.username} size="sm" />
                        <span className="text-sm font-semibold text-gray-800 flex-1 text-left">
                          {f.username}
                        </span>
                        {selectedToAdd.includes(f.id) && (
                          <span className="text-xs font-bold text-[#F78660]">
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={addMembers}
                    disabled={!selectedToAdd.length || saving}
                    className="btn-primary w-full py-3 rounded-xl mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add Selected
                  </button>
                </div>
              )}

              <div className="mt-3 space-y-2">
                {members.map((m) => {
                  const isMe = Number(m.user_id) === Number(user?.id);

                  return (
                    <div
                      key={m.user_id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
                    >
                      <Avatar name={m.username} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {m.username}
                          {isMe ? " (you)" : ""}
                        </p>
                        <p className="text-xs text-gray-400">{m.role}</p>
                      </div>

                      {isAdmin && !isMe && (
                        <div className="flex items-center gap-2">
                          <button
                            className="btn-secondary px-3 py-1.5 rounded-full text-xs"
                            disabled={saving}
                            onClick={() =>
                              changeRole(
                                m.user_id,
                                m.role === "admin" ? "member" : "admin",
                              )
                            }
                          >
                            {m.role === "admin" ? "Make member" : "Make admin"}
                          </button>
                          <button
                            className="btn-ghost p-2 rounded-full"
                            disabled={saving}
                            onClick={() => removeMember(m.user_id)}
                            title="Remove"
                          >
                            <Trash2 size={16} className="text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={leaveGroup}
              disabled={saving}
              className="btn-secondary w-full py-3 rounded-xl"
            >
              Leave Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatInfo;

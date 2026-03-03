import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import Avatar from './Avatar';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ chat, onBack, onViewRestaurant }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(chat.messages);
    const [showActions, setShowActions] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showWheelModal, setShowWheelModal] = useState(false);
    const [pollQ, setPollQ] = useState('');
    const [pollOpts, setPollOpts] = useState(['', '']);
    const [wheelOpts, setWheelOpts] = useState(['', '']);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages(m => [
            ...m,
            {
                id: Date.now(),
                sender: 'Me',
                text: input,
                type: 'text',
                time: 'Now',
            },
        ]);
        setInput('');
    };

    const sendPoll = () => {
        const validOpts = pollOpts.filter(o => o.trim());
        if (!pollQ.trim() || validOpts.length < 2) return;

        setMessages(m => [
            ...m,
            {
                id: Date.now(),
                sender: 'Me',
                type: 'poll',
                time: 'Now',
                question: pollQ,
                options: validOpts.map((o, i) => ({ id: i + 1, text: o, votes: 0 })),
            },
        ]);

        setPollQ('');
        setPollOpts(['', '']);
        setShowPollModal(false);
    };

    const sendWheel = () => {
        const validOpts = wheelOpts.filter(o => o.trim());
        if (validOpts.length < 2) return;

        setMessages(m => [
            ...m,
            {
                id: Date.now(),
                sender: 'Me',
                type: 'spin-wheel',
                time: 'Now',
                label: 'Me is inviting you to:',
                options: validOpts,
            },
        ]);

        setWheelOpts(['', '']);
        setShowWheelModal(false);
    };

    const sendFoodSuggestion = () => {
        const fallbackRestaurants = [
            { id: 101, name: 'Sushiro', cuisine: 'Japanese', rating: 4.5, image: null },
            { id: 102, name: 'Pizza Hut', cuisine: 'Pizza', rating: 4.0, image: null },
            { id: 103, name: 'KFC', cuisine: 'Fast Food', rating: 3.9, image: null },
        ];
        const restaurant = fallbackRestaurants[Math.floor(Math.random() * fallbackRestaurants.length)];

        setMessages(m => [
            ...m,
            {
                id: Date.now(),
                sender: 'Me',
                type: 'food-suggestion',
                time: 'Now',
                restaurant,
                likes: 0,
                dislikes: 0,
            },
        ]);

        setShowActions(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FCF1DD] border-b border-orange-100 flex-shrink-0">
                <button onClick={onBack} className="btn-ghost p-1 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <Avatar name={chat.name} size="sm" />

                <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{chat.name}</p>
                    {chat.members && <p className="text-xs text-gray-400">{chat.members.join(', ')}</p>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} msg={msg} onViewRestaurant={onViewRestaurant} />
                ))}
            </div>

            <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="w-9 h-9 rounded-full bg-[#F78660] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#2945A8] transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#F78660] bg-gray-50"
                    />
                    <button onClick={sendMessage} className="btn-primary px-4 py-2 rounded-full text-sm">
                        Send
                    </button>
                </div>
                {showActions && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => {
                                setShowPollModal(true);
                                setShowActions(false);
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#FCF1DD] text-[#F78660] text-xs font-bold hover:bg-orange-100 transition-colors"
                        >
                            Poll
                        </button>
                        <button
                            onClick={() => {
                                setShowWheelModal(true);
                                setShowActions(false);
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#FCF1DD] text-[#F78660] text-xs font-bold hover:bg-orange-100 transition-colors"
                        >
                            Spin Wheel
                        </button>

                        <button
                            onClick={sendFoodSuggestion}
                            className="flex-1 py-2 rounded-xl bg-[#FCF1DD] text-[#F78660] text-xs font-bold hover:bg-orange-100 transition-colors"
                        >
                            Suggest Food
                        </button>
                    </div>
                )}
            </div>

            {showPollModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-[3000] flex items-end justify-center"
                    onClick={() => setShowPollModal(false)}
                >
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
                        <div className="w-8 h-0.5 bg-gray-300 rounded-full mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Create a Poll</h2>
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            value={pollQ}
                            onChange={e => setPollQ(e.target.value)}
                            className="input-field mb-3"
                        />
                        <div className="space-y-2 mb-3">
                            {pollOpts.map((opt, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={e => {
                                        const n = [...pollOpts];
                                        n[i] = e.target.value;
                                        setPollOpts(n);
                                    }}
                                    className="input-field"
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setPollOpts([...pollOpts, ''])}
                            className="btn-secondary w-full py-2 rounded-xl text-sm mb-3"
                        >
                            + Add option
                        </button>
                        <button onClick={sendPoll} className="btn-primary w-full py-3 rounded-xl">
                            Send Poll
                        </button>
                    </div>
                </div>
            )}

            {showWheelModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-[3000] flex items-end justify-center"
                    onClick={() => setShowWheelModal(false)}
                >
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
                        <div className="w-8 h-0.5 bg-gray-300 rounded-full mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Spin the Wheel</h2>
                        <div className="space-y-2 mb-3">
                            {wheelOpts.map((opt, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    placeholder={`Place ${i + 1}`}
                                    value={opt}
                                    onChange={e => {
                                        const n = [...wheelOpts];
                                        n[i] = e.target.value;
                                        setWheelOpts(n);
                                    }}
                                    className="input-field"
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setWheelOpts([...wheelOpts, ''])}
                            className="btn-secondary w-full py-2 rounded-xl text-sm mb-3"
                        >
                            + Add place
                        </button>
                        <button onClick={sendWheel} className="btn-primary w-full py-3 rounded-xl">
                            Send Wheel
                        </button>
                    </div>
                </div>
            )}
    </div>
  );
};

export default ChatWindow;
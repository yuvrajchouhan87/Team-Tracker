import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { X, Send } from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TaskChat = ({ task, currentUser, otherUser, onClose, inline = false }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const messagesEndRef = useRef(null);

  const taskId = task?._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom();
  }, [messages.length, loading]);

  const isOwnMessage = (msg) =>
    msg.sender && currentUser?._id && String(msg.sender._id) === String(currentUser._id);
  const canSend = Boolean(
    socket?.connected && taskId && otherUser?._id && input.trim() && !sending
  );

  useEffect(() => {
    if (!taskId || !socket) return;
    socket.emit('joinTask', taskId);
    return () => {
      socket.emit('leaveTask', taskId);
    };
  }, [socket, taskId]);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    setLoadError(null);
    const loadMessages = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/api/messages/${taskId}`);
        if (!cancelled) setMessages(data);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.response?.data?.message || 'Could not load messages.');
          setMessages([]);
        }
        console.error('Error loading messages', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  useEffect(() => {
    if (!socket) return;
    if (taskId) {
      axios.put(`${API_BASE}/api/messages/${taskId}/read`).catch(() => {});
    }

    const handler = (msg) => {
      const msgTaskId = msg.task?._id ?? msg.task;
      if (String(msgTaskId) !== String(taskId)) return;

      if (msg.sender?._id !== currentUser?._id) {
        axios.put(`${API_BASE}/api/messages/${taskId}/read`).catch(() => {});
      }

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => !m.__temp);
        if (withoutTemp.some((m) => m._id === msg._id)) return prev;
        return [...withoutTemp, msg];
      });
    };

    socket.on('newMessage', handler);
    return () => {
      socket.off('newMessage', handler);
    };
  }, [socket, taskId, currentUser?._id]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!canSend) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text,
      sender: { _id: currentUser._id, name: currentUser.name },
      createdAt: new Date().toISOString(),
      __temp: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');
    setSending(true);
    setTimeout(scrollToBottom, 40);

    socket.emit(
      'sendMessage',
      {
        taskId,
        text,
        receiverId: String(otherUser._id),
      },
      (res) => {
        setSending(false);
        if (res?.error) {
          console.error('Send error:', res.error);
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...m, __failed: true } : m
            )
          );
          return;
        }
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m._id !== tempId);
          const real = res?.message;
          if (real && !withoutTemp.some((m) => m._id === real._id)) {
            return [...withoutTemp, real];
          }
          return withoutTemp;
        });
      }
    );
  };

  const title = useMemo(() => {
    if (!otherUser) return 'Task chat';
    if ((currentUser.role === 'Developer' || currentUser.role === 'Intern') && (otherUser.role === 'Manager' || otherUser.role === 'SuperAdmin')) {
      return `Chat with ${otherUser.role}`;
    }
    return `Chat with ${otherUser.name || 'User'}`;
  }, [otherUser, currentUser.role]);

  const chatContent = (
    <div className={inline ? 'flex flex-col h-full w-full' : 'card w-full sm:max-w-md animate-scale-in flex flex-col max-h-[85vh]'}>
      {!inline && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {task?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs custom-scrollbar">
        {!isConnected && socket && (
          <p className="text-center py-1 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
            Connecting socket...
          </p>
        )}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        )}
        {!loading && loadError && (
          <p className="text-center py-4 text-rose-500 text-xs">{loadError}</p>
        )}
        {!loading && !loadError && messages.length === 0 && (
          <p className="text-center py-8 text-slate-400 text-xs">
            No messages yet. Send an update to get started.
          </p>
        )}

        {messages.map((msg) => {
          const mine = isOwnMessage(msg);
          return (
            <div
              key={msg._id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                  mine
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {!mine && (
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                    {(currentUser.role === 'Developer' || currentUser.role === 'Intern') && (msg.sender?.role === 'Manager' || msg.sender?.role === 'SuperAdmin') 
                      ? msg.sender?.role 
                      : msg.sender?.name}
                  </p>
                )}
                <p className="leading-relaxed break-words">{msg.text}</p>
                {msg.__failed && (
                  <p className="text-[10px] mt-0.5 text-rose-300 font-medium">
                    Send failed
                  </p>
                )}
                <p className={`text-[9px] mt-1 text-right ${mine ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-base text-xs py-2"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="btn-primary p-2 rounded-lg disabled:opacity-50 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) return chatContent;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[100] p-4">
      {chatContent}
    </div>
  );
};

export default TaskChat;

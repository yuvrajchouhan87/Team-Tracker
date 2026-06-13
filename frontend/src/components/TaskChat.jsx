import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { X, Send } from 'lucide-react';

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
        const { data } = await axios.get(`https://team-tracker-dbzf.onrender.com/api/messages/${taskId}`);
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
    
    // Mark as read when first joining/switching to this task
    if (taskId) {
      axios.put(`https://team-tracker-dbzf.onrender.com/api/messages/${taskId}/read`).catch(() => {});
    }

    const handler = (msg) => {
      const msgTaskId = msg.task?._id ?? msg.task;
      if (String(msgTaskId) !== String(taskId)) return;

      // If we are getting a message for the CURRENT active task, mark it as read immediately
      if (msg.sender?._id !== currentUser?._id) {
        axios.put(`https://team-tracker-dbzf.onrender.com/api/messages/${taskId}/read`).catch(() => {});
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
    setTimeout(scrollToBottom, 50);

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
      <div
        className={inline ? "flex flex-col h-full w-full" : "card w-full sm:max-w-md animate-scale-in flex flex-col"}
        style={!inline ? { maxHeight: '90vh' } : {}}
      >
        {!inline && (
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Task chat
              </p>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h2>
              <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                {task?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col px-3 py-2 overflow-y-auto space-y-2 text-xs min-h-[120px]">
          {!isConnected && socket && (
            <p className="text-center py-2 text-orange-600 text-[11px]">
              Connecting…
            </p>
          )}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && loadError && (
            <p className="text-center py-4 text-red-500 text-[11px]">{loadError}</p>
          )}

          {!loading && !loadError && messages.length === 0 && (
            <p className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
              No messages yet. Say hi 👋
            </p>
          )}

          {messages.map((msg) => {
            const mine = isOwnMessage(msg);
            return (
              <div
                key={msg._id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-3 py-2"
                  style={{
                    background: mine ? '#f97316' : 'var(--bg-primary)',
                    color: mine ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  {!mine && (
                    <p className="text-[10px] font-semibold mb-0.5 opacity-80">
                      {(currentUser.role === 'Developer' || currentUser.role === 'Intern') && (msg.sender?.role === 'Manager' || msg.sender?.role === 'SuperAdmin') 
                        ? msg.sender?.role 
                        : msg.sender?.name}
                    </p>
                  )}
                  <p className="text-[11px] leading-snug break-words">{msg.text}</p>
                  {msg.__failed && (
                    <p className="text-[9px] mt-1 text-red-300 font-medium">
                      Send failed
                    </p>
                  )}
                  <p
                    className="text-[9px] mt-1 text-right opacity-70"
                    style={{ color: mine ? '#e5e7eb' : 'var(--text-muted)' }}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="px-3 pb-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 input-base resize-none text-xs max-h-24"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="btn-primary px-3 py-2 flex items-center justify-center disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
  );

  if (inline) return chatContent;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-end sm:items-center justify-center z-[100] p-3">
      {chatContent}
    </div>
  );
};

export default TaskChat;


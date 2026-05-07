import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Send, Bot, User, Sparkles, PieChart, Lightbulb, Trash2,
    TrendingUp, AlertTriangle, CheckCircle2, XCircle, Plus,
    UserCheck, UserX, RefreshCw, Zap, PlayCircle
} from 'lucide-react';

const API = 'http://localhost:5000';

// ── Markdown Renderer ────────────────────────────────────────────────────────
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    const parseInline = (str) => {
        const parts = str.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            const italicParts = part.split(/(\*[^*]+\*)/g);
            return italicParts.map((ip, iidx) => {
                if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
                    return <em key={`${idx}-${iidx}`}>{ip.slice(1, -1)}</em>;
                }
                return ip;
            });
        });
    };

    while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === '') { elements.push(<div key={`sp-${i}`} className="h-1" />); i++; continue; }
        if (line.startsWith('## ')) { elements.push(<p key={i} className="font-bold text-orange-600 dark:text-orange-400 text-sm mt-2 mb-1">{parseInline(line.slice(3))}</p>); i++; continue; }
        if (line.startsWith('# ')) { elements.push(<p key={i} className="font-extrabold text-orange-600 dark:text-orange-400 text-base mt-2 mb-1">{parseInline(line.slice(2))}</p>); i++; continue; }
        if (/^\d+\.\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                const m = lines[i].match(/^(\d+)\.\s(.*)/);
                items.push(<li key={i} className="flex gap-2 items-start"><span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold flex items-center justify-center">{m[1]}</span><span>{parseInline(m[2])}</span></li>);
                i++;
            }
            elements.push(<ul key={`ol-${i}`} className="space-y-2 my-2">{items}</ul>); continue;
        }
        if (/^[-*]\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*]\s/.test(lines[i])) {
                items.push(<li key={i} className="flex gap-2 items-start"><span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-orange-500" /><span>{parseInline(lines[i].slice(2))}</span></li>);
                i++;
            }
            elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-1">{items}</ul>); continue;
        }
        elements.push(<p key={i} className="leading-relaxed">{parseInline(line)}</p>);
        i++;
    }
    return <div className="space-y-0.5 text-sm">{elements}</div>;
};

// ── Action Card ──────────────────────────────────────────────────────────────
const ActionCard = ({ action, dashboardData, onComplete }) => {
    const [status, setStatus] = useState('pending'); // pending | loading | success | error
    const [resultMsg, setResultMsg] = useState('');

    const actionMeta = {
        create_task: { icon: Plus, color: 'blue', label: 'Create Task' },
        update_task_status: { icon: RefreshCw, color: 'purple', label: 'Update Task' },
        approve_user: { icon: UserCheck, color: 'green', label: 'Approve User' },
        reject_user: { icon: UserX, color: 'red', label: 'Reject User' },
        delete_task: { icon: Trash2, color: 'red', label: 'Delete Task' },
    };

    const meta = actionMeta[action.type] || { icon: Zap, color: 'orange', label: 'Action' };

    const colorMap = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
        red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    };

    const resolveUserId = (name) => {
        if (!dashboardData?.users) return null;
        const found = dashboardData.users.find(u =>
            u.name?.toLowerCase() === name?.toLowerCase() ||
            u.name?.toLowerCase().includes(name?.toLowerCase())
        );
        return found?._id || null;
    };

    const resolveTaskId = (titleHint) => {
        if (!dashboardData?.tasks) return null;
        const found = dashboardData.tasks.find(t =>
            t.title?.toLowerCase().includes(titleHint?.toLowerCase())
        );
        return found?._id || null;
    };

    const execute = async () => {
        setStatus('loading');
        try {
            if (action.type === 'create_task') {
                const assignedTo = resolveUserId(action.assignedToName);
                if (!assignedTo) throw new Error(`User "${action.assignedToName}" not found in team.`);
                await axios.post(`${API}/api/tasks`, {
                    title: action.title,
                    description: action.description || '',
                    priority: action.priority || 'Medium',
                    deadline: action.deadline,
                    assignedTo
                });
                setResultMsg(`✅ Task "${action.title}" created and assigned to ${action.assignedToName}.`);
            } else if (action.type === 'update_task_status') {
                const taskId = resolveTaskId(action.taskTitle);
                if (!taskId) throw new Error(`Task "${action.taskTitle}" not found.`);
                await axios.put(`${API}/api/tasks/${taskId}`, { status: action.status });
                setResultMsg(`✅ Task "${action.taskTitle}" updated to "${action.status}".`);
            } else if (action.type === 'approve_user') {
                const userId = resolveUserId(action.userName);
                if (!userId) throw new Error(`User "${action.userName}" not found.`);
                await axios.put(`${API}/api/auth/users/${userId}/approve`, { role: action.role || 'Developer' });
                setResultMsg(`✅ "${action.userName}" approved as ${action.role || 'Developer'}.`);
            } else if (action.type === 'reject_user') {
                const userId = resolveUserId(action.userName);
                if (!userId) throw new Error(`User "${action.userName}" not found.`);
                await axios.put(`${API}/api/auth/users/${userId}/reject`);
                setResultMsg(`✅ "${action.userName}" has been rejected.`);
            } else if (action.type === 'delete_task') {
                const taskId = resolveTaskId(action.taskTitle);
                if (!taskId) throw new Error(`Task "${action.taskTitle}" not found.`);
                await axios.delete(`${API}/api/tasks/${taskId}`);
                setResultMsg(`✅ Task "${action.taskTitle}" has been deleted.`);
            }
            setStatus('success');
            setTimeout(() => onComplete && onComplete(), 500); // refresh parent data after short delay
        } catch (err) {
            setStatus('error');
            setResultMsg(`❌ Failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const details = {
        create_task: `"${action.title}" → ${action.assignedToName} | ${action.priority} | Due: ${action.deadline || 'N/A'}`,
        update_task_status: `"${action.taskTitle}" → Status: ${action.status}`,
        approve_user: `Approve "${action.userName}" as ${action.role}`,
        reject_user: `Reject "${action.userName}"`,
        delete_task: `Delete task "${action.taskTitle}"`,
    }[action.type] || 'Perform action';

    return (
        <div className={`mt-3 rounded-xl border p-3 ${colorMap[meta.color]}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-${meta.color}-100 dark:bg-${meta.color}-900/40`}>
                    <meta.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">🤖 AI Action: {meta.label}</span>
            </div>

            <p className="text-xs mb-3 opacity-80 font-medium">{details}</p>

            {status === 'pending' && (
                <div className="flex gap-2">
                    <button
                        onClick={execute}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all shadow-sm"
                    >
                        <PlayCircle className="w-3.5 h-3.5" /> Confirm & Execute
                    </button>
                    <button
                        onClick={() => { setStatus('error'); setResultMsg('Action cancelled.'); }}
                        className="px-3 py-1.5 bg-white/50 dark:bg-black/20 text-xs font-bold rounded-lg hover:bg-white/80 transition-all border border-current/20"
                    >
                        Cancel
                    </button>
                </div>
            )}
            {status === 'loading' && (
                <div className="flex items-center gap-2 text-xs font-medium opacity-70">
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Executing...
                </div>
            )}
            {(status === 'success' || status === 'error') && (
                <p className="text-xs font-semibold">{resultMsg}</p>
            )}
        </div>
    );
};

// ── Action Parser ────────────────────────────────────────────────────────────
const ACTION_REGEX = /<<ACTION>>([\s\S]*?)<<END_ACTION>>/g;

const parseActions = (content) => {
    const actions = [];
    const cleanContent = content.replace(ACTION_REGEX, (match, json) => {
        try { actions.push(JSON.parse(json.trim())); } catch (e) { console.warn('Action parse error', e); }
        return '';
    }).trim();
    return { cleanContent, actions };
};

// ── RAG Context Builder ──────────────────────────────────────────────────────
const buildRAGSystemPrompt = (dashboardData) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let prompt = `You are "Team Tracker AI", an intelligent AI Agent embedded in the "Team Tracker CRM". You have two capabilities:
1. ANALYSIS: Answer questions and provide insights about the team and tasks.
2. AUTOMATION: Perform real CRM actions on behalf of the user.

TODAY'S DATE: ${dateStr}

PERSONALITY: Professional, friendly, concise. For greetings ("hi", "hello", "hey"), respond warmly and briefly, then invite the user to ask about their team, tasks, or request an action.

RESPONSE FORMAT RULES:
- Always use clean markdown for responses.
- Use **bold** for key terms.
- Use numbered lists (1. 2. 3.) for suggestions.
- Use bullet points (-) for data summaries.
- Keep responses focused and actionable.

## AUTOMATION SYSTEM
You can trigger real CRM actions. When the user requests an action AND has confirmed (said "yes", "do it", "confirm", "go ahead", "please"), embed the action JSON at the END of your text response using this exact format:

<<ACTION>>{"type":"action_type",...params}<<END_ACTION>>

### AVAILABLE ACTIONS:

**1. Create a Task:**
<<ACTION>>{"type":"create_task","title":"Task Title Here","description":"Short description","priority":"High","deadline":"YYYY-MM-DD","assignedToName":"Exact Name From Team List"}<<END_ACTIO
**2. Update Task Status:**
<<ACTION>>{"type":"update_task_status","taskTitle":"Part of exact task title","status":"In Progress"}<<END_ACTION>>
(Valid statuses: "Pending", "In Progress", "Completed")

**3. Approve a User:**
<<ACTION>>{"type":"approve_user","userName":"Exact Name","role":"Manager"}<<END_ACTION>>
(Valid roles: "Manager", "Developer", "Intern")

**4. Reject a User:**
<<ACTION>>{"type":"reject_user","userName":"Exact Name"}<<END_ACTION>>

**5. Delete a Task:**
<<ACTION>>{"type":"delete_task","taskTitle":"Part of exact task title"}<<END_ACTION>>

### AUTOMATION RULES:
- If user asks to create/update/delete but hasn't confirmed, describe what you'll do and ask: "Shall I proceed?"
- If user confirms, embed the ACTION block at the END of your response.
- Always confirm the details you understood before embedding the action.
- For task creation: Use EXACT names from the team list below.
- NEVER embed multiple ACTION blocks in one response.
`;

    if (dashboardData) {
        const { tasks = [], users = [] } = dashboardData;
        const approvedUsers = users.filter(u => u.status === 'Approved' && u.role !== 'SuperAdmin');
        const pendingUsers = users.filter(u => u.status === 'Pending');
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const pending = tasks.filter(t => t.status !== 'Completed' && t.status !== 'In Progress').length;
        const high = tasks.filter(t => t.priority === 'High').length;
        const overdue = tasks.filter(t => t.deadline && t.status !== 'Completed' && new Date(t.deadline) < now).length;
        const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

        const workloadMap = {};
        tasks.forEach(t => {
            const name = t.assignedTo?.name || (typeof t.assignedTo === 'string' ? t.assignedTo : null);
            if (name) workloadMap[name] = (workloadMap[name] || 0) + 1;
        });

        prompt += `
\n== LIVE CRM SNAPSHOT ==

TEAM MEMBERS (use exact names for actions):
${approvedUsers.map(u => `- ${u.name} [${u.role}]`).join('\n') || '- No active team members'}

PENDING APPROVALS (users waiting for role assignment):
${pendingUsers.map(u => `- ${u.name} [registered as: ${u.email}]`).join('\n') || '- None'}

TASK METRICS:
- Total: ${tasks.length} | Completed: ${completed} (${completionRate}%) | In Progress: ${inProgress} | Pending: ${pending} | ⚠️ Overdue: ${overdue}
- Priority: 🔴 High: ${high} | 🟡 Medium: ${tasks.filter(t => t.priority === 'Medium').length} | 🟢 Low: ${tasks.filter(t => t.priority === 'Low').length}

WORKLOAD (tasks per person):
${Object.entries(workloadMap).map(([n, c]) => `- ${n}: ${c} task(s)`).join('\n') || '- No data'}

ALL TASKS (for reference when user asks to update/delete):
${tasks.slice(0, 15).map(t => `- "${t.title}" [${t.priority}, ${t.status}${t.deadline ? `, due ${new Date(t.deadline).toLocaleDateString('en-IN')}` : ''}]`).join('\n') || '- No tasks'}
`;
    }

    return prompt;
};

// ── Initial Message ──────────────────────────────────────────────────────────
const INITIAL_MESSAGE = {
    id: 1,
    role: 'bot',
    content: `👋 Hey! I'm **Team Tracker AI** — your CRM assistant and automation agent.

I can help you:
- 📊 **Analyze** your team's performance and tasks
- ⚡ **Automate** CRM actions (create tasks, approve users, update statuses, and more)
- 💡 **Suggest** improvements and flag risks

Try saying: *"Create a task for Sarah to fix the login bug by Friday, high priority"* or *"Analyze my dashboard"* — what would you like to do today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions: []
};

// ── Main Component ───────────────────────────────────────────────────────────
const AIChatbot = ({ dashboardData, isFullPage = false, onActionComplete }) => {
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const buildHistory = (msgs) =>
        msgs.filter(m => m.id !== 1).map(m => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.content
        }));

    const sendToAI = async (query, currentMessages) => {
        setIsTyping(true);
        try {
            const systemPrompt = buildRAGSystemPrompt(dashboardData);
            const history = buildHistory(currentMessages);

            const res = await fetch('https://api.skilledu.in/api/ai_gateway.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history,
                        { role: 'user', content: query }
                    ],
                    model: 'llama-3.1-8b-instant',
                    temperature: 0.55,
                    max_tokens: 700
                })
            });

            const data = await res.json();
            const rawContent = data.response || data.message || data.choices?.[0]?.message?.content
                || "I couldn't process that request. Please try again.";

            const { cleanContent, actions } = parseActions(rawContent);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: cleanContent,
                actions,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (err) {
            console.error('AI Error:', err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: "⚠️ I'm having trouble reaching the AI server. Please try again.",
                actions: [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsTyping(false);
            inputRef.current?.focus();
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const q = input.trim();
        if (!q || isTyping) return;

        const userMsg = { id: Date.now(), role: 'user', content: q, actions: [], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        await sendToAI(q, updated);
    };

    const handleQuickAction = async (prompt) => {
        if (isTyping) return;
        const userMsg = { id: Date.now(), role: 'user', content: prompt, actions: [], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = [...messages, userMsg];
        setMessages(updated);
        await sendToAI(prompt, updated);
    };

    const quickActions = [
        { icon: PieChart, label: 'Analyze Stats', color: 'text-orange-500', prompt: 'Give me a full analysis of the current CRM data including risks, overdue tasks, and completion rate.' },
        { icon: Lightbulb, label: 'Suggestions', color: 'text-amber-500', prompt: 'Based on the current team data, give me your top 5 productivity improvement suggestions.' },
        { icon: AlertTriangle, label: 'Risks', color: 'text-red-500', prompt: 'What are the critical risks, overdue tasks, and workload imbalances I should address right now?' },
        { icon: TrendingUp, label: 'Team Health', color: 'text-green-500', prompt: 'Analyze team workload balance and flag anyone who might be overwhelmed.' },
        { icon: UserCheck, label: 'Approve Users', color: 'text-blue-500', prompt: 'Show me the list of users pending approval and help me approve them.' },
        { icon: Plus, label: 'Create Task', color: 'text-purple-500', prompt: 'Help me create a new task. Ask me for the details.' },
    ];

    return (
        <div className={`flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ${isFullPage ? 'h-[82vh]' : 'h-[560px]'}`}
            style={{ background: 'var(--bg-card, white)' }}>

            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-200 dark:shadow-none">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Team Tracker AI</h3>
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-orange-400" />
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">AGENT · RAG · AUTOMATION</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setMessages([INITIAL_MESSAGE])}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-red-500" title="Clear Chat">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                style={{ background: 'var(--bg-primary, #f8fafc)' }}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2.5 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-orange-500'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none shadow-lg shadow-orange-100 dark:shadow-none' : 'bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-tl-none shadow-sm'}`}
                                    style={msg.role === 'bot' ? { color: 'var(--text-primary)' } : {}}>
                                    {msg.role === 'bot' ? renderMarkdown(msg.content) : <p className="text-sm leading-relaxed">{msg.content}</p>}
                                    <span className={`text-[10px] mt-2 block opacity-50 ${msg.role === 'user' ? 'text-right text-orange-100' : ''}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                                {/* Action Cards */}
                                {msg.actions?.map((action, idx) => (
                                    <ActionCard key={idx} action={action} dashboardData={dashboardData} onComplete={onActionComplete} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-2.5">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-orange-500 shadow-sm">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar"
                style={{ background: 'var(--bg-card, white)' }}>
                {quickActions.map((a) => (
                    <button key={a.label} onClick={() => handleQuickAction(a.prompt)} disabled={isTyping}
                        className="flex-shrink-0 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <a.icon className={`w-3.5 h-3.5 ${a.color}`} />
                        <span style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                    </button>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800"
                style={{ background: 'var(--bg-card, white)' }}>
                <div className="flex gap-2">
                    <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                        placeholder='Try: "Create a task for [Name] to fix [Bug]..."'
                        disabled={isTyping}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all disabled:opacity-50"
                        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit" disabled={!input.trim() || isTyping}
                        className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-100 dark:shadow-none flex-shrink-0">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-center mt-1.5 opacity-40" style={{ color: 'var(--text-muted)' }}>
                    AI Agent · RAG · Live CRM Automation · Powered by Skilled.U AI
                </p>
            </form>
        </div>
    );
};

export default AIChatbot;

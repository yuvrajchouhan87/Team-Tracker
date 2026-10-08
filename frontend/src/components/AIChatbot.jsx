import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Send, Bot, User, Sparkles, PieChart, Lightbulb, Trash2,
    TrendingUp, AlertTriangle, Plus, UserCheck, RefreshCw, Zap, PlayCircle
} from 'lucide-react';

const API = 'https://team-tracker-dbzf.onrender.com';

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
                return <strong key={idx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
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
        if (line.startsWith('## ')) { elements.push(<p key={i} className="font-bold text-indigo-600 dark:text-indigo-400 text-xs mt-2 mb-1">{parseInline(line.slice(3))}</p>); i++; continue; }
        if (line.startsWith('# ')) { elements.push(<p key={i} className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm mt-2 mb-1">{parseInline(line.slice(2))}</p>); i++; continue; }
        if (/^\d+\.\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                const m = lines[i].match(/^(\d+)\.\s(.*)/);
                items.push(
                    <li key={i} className="flex gap-2 items-start text-xs">
                        <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                            {m[1]}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{parseInline(m[2])}</span>
                    </li>
                );
                i++;
            }
            elements.push(<ul key={`ol-${i}`} className="space-y-1.5 my-1.5">{items}</ul>); continue;
        }
        if (/^[-*]\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*]\s/.test(lines[i])) {
                items.push(
                    <li key={i} className="flex gap-2 items-start text-xs">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300">{parseInline(lines[i].slice(2))}</span>
                    </li>
                );
                i++;
            }
            elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-1.5 pl-1">{items}</ul>); continue;
        }
        elements.push(<p key={i} className="leading-relaxed text-xs text-slate-700 dark:text-slate-300">{parseInline(line)}</p>);
        i++;
    }
    return <div className="space-y-0.5">{elements}</div>;
};

// ── Action Card ──────────────────────────────────────────────────────────────
const ActionCard = ({ action, dashboardData, onComplete }) => {
    const [status, setStatus] = useState('pending');
    const [resultMsg, setResultMsg] = useState('');

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
                setResultMsg(`Task "${action.title}" created for ${action.assignedToName}.`);
            } else if (action.type === 'update_task_status') {
                const taskId = resolveTaskId(action.taskTitle);
                if (!taskId) throw new Error(`Task "${action.taskTitle}" not found.`);
                await axios.put(`${API}/api/tasks/${taskId}`, { status: action.status });
                setResultMsg(`Task "${action.taskTitle}" updated to "${action.status}".`);
            } else if (action.type === 'approve_user') {
                const userId = resolveUserId(action.userName);
                if (!userId) throw new Error(`User "${action.userName}" not found.`);
                await axios.put(`${API}/api/auth/users/${userId}/approve`, { role: action.role || 'Developer' });
                setResultMsg(`"${action.userName}" approved as ${action.role || 'Developer'}.`);
            } else if (action.type === 'reject_user') {
                const userId = resolveUserId(action.userName);
                if (!userId) throw new Error(`User "${action.userName}" not found.`);
                await axios.put(`${API}/api/auth/users/${userId}/reject`);
                setResultMsg(`"${action.userName}" rejected.`);
            } else if (action.type === 'delete_task') {
                const taskId = resolveTaskId(action.taskTitle);
                if (!taskId) throw new Error(`Task "${action.taskTitle}" not found.`);
                await axios.delete(`${API}/api/tasks/${taskId}`);
                setResultMsg(`Task "${action.taskTitle}" deleted.`);
            }
            setStatus('success');
            setTimeout(() => onComplete && onComplete(), 500);
        } catch (err) {
            setStatus('error');
            setResultMsg(`Failed: ${err.response?.data?.message || err.message}`);
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
        <div className="mt-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
            <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    AI Proposed Action
                </span>
            </div>

            <p className="text-xs mb-2.5 text-slate-700 dark:text-slate-300 font-medium">{details}</p>

            {status === 'pending' && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={execute}
                        className="btn-primary py-1 px-3 text-[11px] font-semibold"
                    >
                        <PlayCircle className="w-3 h-3 mr-1" /> Confirm
                    </button>
                    <button
                        onClick={() => { setStatus('error'); setResultMsg('Action cancelled.'); }}
                        className="btn-secondary py-1 px-3 text-[11px]"
                    >
                        Dismiss
                    </button>
                </div>
            )}
            {status === 'loading' && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Executing request...
                </div>
            )}
            {(status === 'success' || status === 'error') && (
                <p className={`text-xs font-semibold ${status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {resultMsg}
                </p>
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

// ── RAG System Prompt Builder ────────────────────────────────────────────────
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
<<ACTION>>{"type":"create_task","title":"Task Title Here","description":"Short description","priority":"High","deadline":"YYYY-MM-DD","assignedToName":"Exact Name From Team List"}<<END_ACTION>>

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

const INITIAL_MESSAGE = {
    id: 1,
    role: 'bot',
    content: `👋 Hello! I'm **Team Tracker AI** — your workspace intelligence and automation assistant.

I can help you:
- 📊 **Analyze** team metrics, velocity, and task bottlenecks
- ⚡ **Automate** actions like task dispatch, member approvals, and status transitions
- 💡 **Surface** priority risks and workload distributions

Try: *"Give me a high-level summary of active tasks"* or *"Create a task for [Name]"* — how can I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions: []
};

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
                signal: AbortSignal.timeout(15000),
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history
                    ],
                    model: 'openai/gpt-oss-20b',
                    temperature: 0.55,
                    max_tokens: 700
                })
            });

            const data = await res.json();
            if (data && data.success === false && data.error) {
                throw new Error(data.error);
            }

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
            const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted');
            const errorMsg = isTimeout
                ? "⏱️ Request timed out after 15 seconds. Please try again."
                : (err.message ? `⚠️ ${err.message}` : "⚠️ Unable to reach the AI engine. Please verify network connectivity.");
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: errorMsg,
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
        { icon: PieChart, label: 'Analyze Stats', prompt: 'Give me a full analysis of the current CRM data including risks, overdue tasks, and completion rate.' },
        { icon: Lightbulb, label: 'Recommendations', prompt: 'Based on current team metrics, provide 4 actionable productivity suggestions.' },
        { icon: AlertTriangle, label: 'Risk Audit', prompt: 'What are the critical risks, overdue tasks, or workload imbalances to address right now?' },
        { icon: TrendingUp, label: 'Workload Balance', prompt: 'Analyze team workload distribution and identify any overloaded members.' },
        { icon: UserCheck, label: 'Pending Approvals', prompt: 'Show me the list of users pending approval and help me approve them.' },
        { icon: Plus, label: 'Create Task', prompt: 'Help me draft and assign a new task. Guide me through the fields.' },
    ];

    return (
        <div className={`card overflow-hidden flex flex-col ${isFullPage ? 'h-[75vh]' : 'h-[520px]'}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Team Tracker Intelligence</h2>
                        <span className="text-[10px] text-slate-400 font-medium">RAG Assistant</span>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([INITIAL_MESSAGE])}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                    title="Clear history"
                    aria-label="Clear chat history"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/40">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                                msg.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400'
                            }`}>
                                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                                <div className={`rounded-2xl px-3.5 py-2.5 ${
                                    msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-tl-xs shadow-sm'
                                }`}>
                                    {msg.role === 'bot' ? renderMarkdown(msg.content) : <p className="text-xs leading-relaxed">{msg.content}</p>}
                                    <span className={`text-[9px] mt-1.5 block opacity-50 ${msg.role === 'user' ? 'text-right text-indigo-100' : 'text-slate-400'}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                                {msg.actions?.map((action, idx) => (
                                    <ActionCard key={idx} action={action} dashboardData={dashboardData} onComplete={onActionComplete} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 items-center">
                            <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-2xl rounded-tl-xs shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickActions.map((a) => (
                    <button
                        key={a.label}
                        onClick={() => handleQuickAction(a.prompt)}
                        disabled={isTyping}
                        className="flex-shrink-0 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 rounded-full text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40"
                    >
                        {a.label}
                    </button>
                ))}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about velocity or say 'Create a task for...'"
                        disabled={isTyping}
                        className="flex-1 input-base text-xs py-2"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="btn-primary p-2 rounded-lg disabled:opacity-50 flex-shrink-0"
                        aria-label="Send query"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatbot;

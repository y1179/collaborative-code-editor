import "./App.css";
import { Editor } from "@monaco-editor/react";
import { useRef, useMemo, useState, useEffect } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import Login from "../component/Login";

function App() {
  const [language, setLanguage] = useState("javascript");
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [users, setUsers] = useState([]);

  // ── Code execution state ──────────────────────────────
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  // ─────────────────────────────────────────────────────

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const userId = useRef(crypto.randomUUID());
  const userColor = useRef(
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
  );

  const handleMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const enteredUsername = e.target.username.value.trim();
    if (!enteredUsername) return;
    setUsername(enteredUsername);
    window.history.pushState(
      {},
      "",
      `?username=${encodeURIComponent(enteredUsername)}`
    );
  };

  const handleLogout = () => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField("user", null);
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    window.history.replaceState({}, "", "/");
    setUsers([]);
    setEditorReady(false);
    setOutput("");
    setUsername("");
  };

  // ── Run code ─────────────────────────────────────────
  const handleRun = async () => {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();
    if (!code.trim()) {
      setOutput("// Nothing to run. Write some code first!");
      return;
    }

    setIsRunning(true);
    setOutput("Running...");

    try {
      const res = await fetch("http://localhost:3000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(data.output || "(no output)");
      }
    } catch (err) {
      setOutput("Could not connect to server. Is it running?");
    } finally {
      setIsRunning(false);
    }
  };
  // ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!username || !editorReady) return;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true }
    );

    providerRef.current = provider;

    const userData = {
      id: userId.current,
      username,
      color: userColor.current,
    };

    provider.awareness.setLocalStateField("user", userData);

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const activeUsers = states.map((state) => state?.user).filter(Boolean);
      const uniqueUsers = [
        ...new Map(activeUsers.map((user) => [user.id, user])).values(),
      ];
      setUsers(uniqueUsers);
    };

    provider.awareness.on("change", updateUsers);
    updateUsers();

    let monacoBinding = null;
    if (editorRef.current && editorRef.current.getModel()) {
      monacoBinding = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      );
    }

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      provider.awareness.setLocalStateField("user", null);
      if (monacoBinding) monacoBinding.destroy();
      provider.awareness.off("change", updateUsers);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      provider.disconnect();
    };
  }, [username, editorReady, ydoc, yText]);

  // ── Login screen ──────────────────────────────────────
      if (!username) {
  return <Login handleJoin={handleJoin} />;
}
    
  

  // ── Main editor screen ────────────────────────────────
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        backgroundColor: "#0D1117",
        overflow: "hidden",
        flexDirection: "column",
      }}
      className="lg:flex-row!"
    >
      {/* Sidebar */}
      <aside
        style={{ flexShrink: 0, backgroundColor: "#161B22", color: "white" }}
        className="
          w-full lg:w-64
          border-b border-[#30363D] lg:border-b-0 lg:border-r
          p-3 lg:p-4
          flex flex-row lg:flex-col
          items-center lg:items-stretch
          gap-3 lg:gap-0
          overflow-hidden
        "
      >
        {/* Language selector */}
        <div className="shrink-0 w-36 lg:w-full">
          <label className="hidden lg:block text-xs text-gray-400 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-2 text-white text-sm outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        {/* Active users */}
        <div className="flex-1 min-w-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:mt-4">
          <p className="hidden lg:block text-xs text-gray-400 mb-1 shrink-0">
            Active Users ({users.length})
          </p>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center shrink-0 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-1.5"
            >
              <span
                className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm truncate max-w-18 lg:max-w-none">
                {user.username}
              </span>
            </div>
          ))}
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="shrink-0 text-white text-sm py-1.5 px-4 rounded-lg transition-all whitespace-nowrap"
          style={{
            backgroundColor: isRunning ? "#15803d" : "#16a34a",
            cursor: isRunning ? "not-allowed" : "pointer",
            opacity: isRunning ? 0.8 : 1,
          }}
        >
          {isRunning ? "⏳ Running..." : "▶ Run"}
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 px-4 rounded-lg transition-all lg:mt-2 whitespace-nowrap"
        >
          Logout
        </button>
      </aside>

      {/* Right side: editor + output panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Editor */}
        <section style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme="vs-dark"
            onMount={handleMount}
            defaultValue="// Start coding here..."
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </section>

        {/* Output panel */}
        <section
          style={{
            height: "200px",
            flexShrink: 0,
            backgroundColor: "#0D1117",
            borderTop: "1px solid #30363D",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Output header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.4rem 1rem",
              borderBottom: "1px solid #30363D",
              backgroundColor: "#161B22",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>Output</span>
            <button
              onClick={() => setOutput("")}
              style={{
                color: "#6b7280",
                fontSize: "11px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {/* Output content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0.75rem 1rem",
              fontFamily: "monospace",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              color: !output
                ? "#4b5563"
                : output.toLowerCase().includes("error") ||
                  output.toLowerCase().includes("traceback") ||
                  output.toLowerCase().includes("exception")
                ? "#f87171"
                : "#4ade80",
            }}
          >
            {output || "// Click ▶ Run to see output here"}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;

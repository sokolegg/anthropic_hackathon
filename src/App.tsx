import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Enable HMR in development
if (import.meta.hot) {
  import.meta.hot.accept();
}

interface TimelineEntry {
  start_time: number;
  end_time: number;
  activity: string;
  file_path?: string;
}

function Timeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const files = ['1.json', '2.json', '3.json'];
        const responses = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(`/data/${file}`);
            if (!response.ok) {
              throw new Error(`Failed to load ${file}: ${response.statusText}`);
            }
            const data = await response.json();
            return data as TimelineEntry;
          })
        );

        // Sort entries by start_time
        const sortedEntries = responses.sort((a, b) => a.start_time - b.start_time);
        setEntries(sortedEntries);
      } catch (error) {
        console.error('Error loading timeline data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 bg-red-100/10 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-blue-500">Timeline</h2>
      {entries.length === 0 ? (
        <div className="text-center text-gray-400">No timeline entries found</div>
      ) : (
        <div className="timeline-container">
          <div className="timeline-line"></div>
          {entries.map((entry, index) => (
            <div key={index} className="timeline-entry">
              <div className="timeline-content">
                <div className="timeline-time">
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                </div>
                <div className="timeline-activity">
                  {entry.activity}
                </div>
                {entry.file_path && (
                  <div className="timeline-file">
                    File: {entry.file_path}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-blue-700">{title}</h2>
      <div className="bg-gray-50 rounded-xl p-8 text-center backdrop-blur-sm border border-gray-200">
        <div className="text-gray-600 text-lg mb-4">
          This feature is coming soon...
        </div>
        <div className="text-sm text-gray-500">
          We're working hard to bring you the best experience possible.
        </div>
      </div>
    </div>
  );
}

function Chat() {
  return <EmptyState title="Chat" />;
}

function Insights() {
  return <EmptyState title="Insights" />;
}

function Invoices() {
  return <EmptyState title="Invoices" />;
}

function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(true);
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

// Add error boundary for better error handling during development
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="text-red-500 bg-red-100/10 rounded-lg p-4">
            Something went wrong. Please refresh the page.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-white text-dark">
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl font-bold text-blue-700 tracking-tight">Reflexia</h1>
                <div className="flex items-center justify-center flex-1 px-8">
                  <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-8">
                    {[
                      { to: "/", text: "Timeline", emoji: "⏱️" },
                      { to: "/chat", text: "Chat", emoji: "💬" },
                      { to: "/insights", text: "Insights", emoji: "📊" },
                      { to: "/invoices", text: "Invoices", emoji: "📑" },
                    ].map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-[130px] text-center flex items-center justify-center gap-4 ${
                            isActive
                              ? "bg-white text-blue-700 shadow-md"
                              : "text-gray-600 hover:text-blue-700 hover:bg-white/50"
                          }`
                        }
                      >
                        <span className="text-lg">{link.emoji}</span>
                        <span>{link.text}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="container mx-auto py-6 px-4">
            <Routes>
              <Route path="/" element={<Timeline />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/invoices" element={<Invoices />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

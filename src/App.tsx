import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSummary } from "@/components/chat/ChatSummary";
import { generateSummary, chatResponse } from "@/lib/claude";
import './App.css';

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

// Add type guard for TimelineEntry
const isTimelineEntry = (data: any): data is TimelineEntry => {
  console.log('Validating data:', data);
  const hasRequiredFields = 
    typeof data === 'object' &&
    data !== null &&
    'start_time' in data &&
    'end_time' in data &&
    'activity' in data;
  
  console.log('Has required fields:', hasRequiredFields);
  
  if (!hasRequiredFields) return false;
  
  const validTypes = 
    typeof data.start_time === 'number' &&
    typeof data.end_time === 'number' &&
    typeof data.activity === 'string' &&
    (data.file_path === undefined || typeof data.file_path === 'string');
  
  console.log('Valid types:', validTypes);
  
  return validTypes;
};

function Timeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedEntries: TimelineEntry[] = [];
        
        // Load all JSON files we know exist
        const jsonFiles = [
          '1.json', '2.json', '3.json', '4.json', '5.json', 
          '6.json', '7.json', '8.json', '9.json', '10.json',
          '11.json', '12.json', '13.json', '14.json', '15.json',
          '16.json', '17.json', '18.json', '19.json', '20.json',
          '21.json', '22.json', '23.json'
        ];
        
        console.log('Attempting to load these files:', jsonFiles);
        
        await Promise.all(jsonFiles.map(async (filename: string) => {
          try {
            const url = `/data/${filename}`;
            console.log(`Fetching ${url}...`);
            const response = await fetch(url);
            console.log(`Status for ${filename}:`, response.status);
            
            if (!response.ok) {
              console.log(`❌ Failed to load ${filename} - Status: ${response.status}`);
              return;
            }
            
            const text = await response.text();
            console.log(`Raw content for ${filename}:`, text);
            
            try {
              const data = JSON.parse(text);
              console.log(`Parsed data for ${filename}:`, data);
              
              if (isTimelineEntry(data)) {
                console.log(`✅ Successfully loaded: ${filename}`);
                loadedEntries.push(data);
              } else {
                console.log(`⚠️ Invalid format in: ${filename}`);
              }
            } catch (parseError) {
              console.log(`❌ JSON parse error in ${filename}:`, parseError);
            }
          } catch (e) {
            console.log(`❌ Network error for ${filename}:`, e);
          }
        }));

        console.log('Total entries found:', loadedEntries.length);
        console.log('Successfully loaded activities:', loadedEntries.map(entry => entry.activity));

        if (loadedEntries.length === 0) {
          setError('No timeline entries found. Please check server logs for detailed error information.');
          return;
        }

        const sortedEntries = loadedEntries.sort((a, b) => b.start_time - a.start_time);
        setEntries(sortedEntries);
      } catch (error) {
        console.error('Error in timeline data loading:', error);
        setError('Failed to load timeline entries. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive bg-destructive/10 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  // Group entries by date and sort dates in descending order
  const entriesByDate = entries.reduce((acc, entry) => {
    const { date } = formatTime(entry.start_time);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimelineEntry[]>);

  // Sort dates in descending order
  const sortedDates = Object.entries(entriesByDate).sort((a, b) => {
    const dateA = new Date(a[0]).getTime();
    const dateB = new Date(b[0]).getTime();
    return dateB - dateA;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-primary">Timeline</h2>
      {entries.length === 0 ? (
        <div className="text-center text-muted-foreground">No timeline entries found</div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(([date, dateEntries]) => {
            // Sort entries within each date in descending order
            const sortedEntries = dateEntries.sort((a, b) => b.start_time - a.start_time);
            return (
              <div key={date} className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-primary mb-4">{date}</h3>
                <div className="timeline-container space-y-4">
                  <div className="timeline-line"></div>
                  {sortedEntries.map((entry, index) => {
                    const startTime = formatTime(entry.start_time);
                    const endTime = formatTime(entry.end_time);
                    return (
                      <div key={index} className="timeline-entry">
                        <div className="timeline-content">
                          <div className="timeline-time font-medium">
                            {startTime.time} - {endTime.time}
                          </div>
                          <div className="timeline-activity mt-2">
                            {entry.activity}
                          </div>
                          {entry.file_path && (
                            <div className="timeline-file text-sm text-muted-foreground mt-1">
                              File: {entry.file_path}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const formatTimeForDisplay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        setTimelineLoading(true);
        setTimelineError(null);
        
        const loadedEntries: TimelineEntry[] = [];
        
        // Load all JSON files we know exist
        const jsonFiles = [
          '1.json', '2.json', '3.json', '4.json', '5.json', 
          '6.json', '7.json', '8.json', '9.json', '10.json',
          '11.json', '12.json', '13.json', '14.json', '15.json',
          '16.json', '17.json', '18.json', '19.json', '20.json',
          '21.json', '22.json', '23.json'
        ];
        
        console.log('Attempting to load these files:', jsonFiles);
        
        await Promise.all(jsonFiles.map(async (filename: string) => {
          try {
            const url = `/data/${filename}`;
            console.log(`Fetching ${url}...`);
            const response = await fetch(url);
            console.log(`Status for ${filename}:`, response.status);
            
            if (!response.ok) {
              console.log(`❌ Failed to load ${filename} - Status: ${response.status}`);
              return;
            }
            
            const text = await response.text();
            console.log(`Raw content for ${filename}:`, text);
            
            try {
              const data = JSON.parse(text);
              console.log(`Parsed data for ${filename}:`, data);
              
              if (isTimelineEntry(data)) {
                console.log(`✅ Successfully loaded: ${filename}`);
                loadedEntries.push(data);
              } else {
                console.log(`⚠️ Invalid format in: ${filename}`);
              }
            } catch (parseError) {
              console.log(`❌ JSON parse error in ${filename}:`, parseError);
            }
          } catch (e) {
            console.log(`❌ Network error for ${filename}:`, e);
          }
        }));

        console.log('Total entries found:', loadedEntries.length);
        console.log('Successfully loaded activities:', loadedEntries.map(entry => entry.activity));

        if (loadedEntries.length === 0) {
          setTimelineError('No timeline entries found. Please check server logs for detailed error information.');
          return;
        }

        const sortedEntries = loadedEntries.sort((a, b) => b.start_time - a.start_time);
        setTimelineData(sortedEntries);

        // Initialize chat with timeline context
        const mostRecent = sortedEntries[0];
        const formattedTime = formatTimeForDisplay(mostRecent.start_time);
        const initialContext = `On ${formattedTime.date} at ${formattedTime.time}, you ${mostRecent.activity.toLowerCase()}`;
        
        const initialMessages: Message[] = [
          {
            role: "assistant",
            content: `I have access to your complete timeline. Here's your most recent activity:\n\n${initialContext}\n\nAsk me about your activities or what you did at any specific time.`
          }
        ];
        setMessages(initialMessages);
      } catch (error) {
        console.error('DEBUG: Top level error:', error);
        setTimelineError('Failed to load timeline entries');
      } finally {
        setTimelineLoading(false);
      }
    };

    loadTimelineData();
  }, []);

  const getTimelineContext = () => {
    if (timelineData.length === 0) return "No timeline data available.";

    return timelineData.map(entry => {
      const time = formatTimeForDisplay(entry.start_time);
      return `Time: ${time.date} at ${time.time}
Activity: ${entry.activity}
${entry.file_path ? `File: ${entry.file_path}` : ''}`;
    }).join('\n\n');
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const contextEnhancedMessage: Message = {
        role: "user",
        content: `Here is my timeline of activities:

${getTimelineContext()}

Question: ${content}`
      };

      const response = await chatResponse([contextEnhancedMessage]);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't retrieve that information. Please try asking again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (timelineLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (timelineError) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive bg-destructive/10 rounded-lg p-4">
          {timelineError}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1">
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
        </ScrollArea>
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}

interface Advice {
  advice: string;
  link: string;
}

function Insights() {
  const [insights, setInsights] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);

  const formatTimeForDisplay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getTimelineContext = () => {
    return timelineData.map(entry => {
      const time = formatTimeForDisplay(entry.start_time);
      return `Time: ${time.date} at ${time.time}
Activity: ${entry.activity}
${entry.file_path ? `File: ${entry.file_path}` : ''}`;
    }).join('\n\n');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedEntries: TimelineEntry[] = [];
        
        // Load all JSON files we know exist
        const jsonFiles = [
          '1.json', '2.json', '3.json', '4.json', '5.json', 
          '6.json', '7.json', '8.json', '9.json', '10.json',
          '11.json', '12.json', '13.json', '14.json', '15.json',
          '16.json', '17.json', '18.json', '19.json', '20.json',
          '21.json', '22.json', '23.json'
        ];
        
        await Promise.all(jsonFiles.map(async (filename: string) => {
          try {
            const response = await fetch(`/data/${filename}`);
            if (!response.ok) return;
            
            const data = await response.json();
            if (isTimelineEntry(data)) {
              loadedEntries.push(data);
            }
          } catch (e) {
            // Skip failed files
          }
        }));

        if (loadedEntries.length === 0) {
          setError('No timeline entries found.');
          return;
        }

        const sortedEntries = loadedEntries.sort((a, b) => b.start_time - a.start_time);
        setTimelineData(sortedEntries);

        // Get insights from Claude
        try {
          const prompt = `generate 5 useful advice with links based on my timeline ${getTimelineContext()}
return only next json without '''json or any stuff

{"result": [{"advice": "search in google ...",
"link": "google.com/..."}, {"advice": ...`;

          const response = await chatResponse([{ role: "user", content: prompt }]);
          
          try {
            const parsedResponse = JSON.parse(response);
            if (Array.isArray(parsedResponse.result)) {
              setInsights(parsedResponse.result);
            } else {
              throw new Error('Invalid response format');
            }
          } catch (parseError) {
            console.error('Failed to parse Claude response:', parseError);
            setError('Failed to parse insights. Please try again.');
          }
        } catch (claudeError) {
          console.error('Failed to get insights:', claudeError);
          setError('Failed to generate insights. Please try again.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive bg-destructive/10 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-primary">Insights</h2>
      <div className="space-y-6">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="bg-muted/50 rounded-xl p-6 backdrop-blur-sm border border-border hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-lg">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-lg text-foreground mb-3">{insight.advice}</p>
                <a 
                  href={insight.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm inline-flex items-center"
                >
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Invoices() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-primary">Invoices</h2>
      <div className="bg-muted/50 rounded-xl p-8 text-center backdrop-blur-sm border border-border">
        <div className="text-primary text-lg mb-4">
          This feature is coming soon...
        </div>
        <div className="text-sm text-muted-foreground">
          We're working hard to bring you the best experience possible.
        </div>
      </div>
    </div>
  );
}

function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

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
          <div className="text-destructive bg-destructive/10 rounded-lg p-4">
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
        <div className="min-h-screen bg-background text-foreground">
          <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-md">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl font-bold text-primary tracking-tight">Reflexia</h1>
                <div className="flex items-center justify-center flex-1 px-8">
                  <div className="bg-muted rounded-lg p-2 flex items-center space-x-8">
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
                              ? "bg-background text-primary shadow-md"
                              : "text-muted-foreground hover:text-primary hover:bg-background/50"
                          }`
                        }
                      >
                        <span className="text-lg">{link.emoji}</span>
                        <span>{link.text}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
                <ThemeSwitcher />
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
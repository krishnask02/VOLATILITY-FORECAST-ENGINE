import { createContext, useState, useContext } from 'react';

const EngineContext = createContext();

export const useEngine = () => useContext(EngineContext);

export const EngineProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);

  const fetchData = async () => {
    setHasStarted(true);
    setLoading(true);
    setLogs([]);
    setData(null);
    try {
      const response = await fetch('http://localhost:8000/api/analyze?ticker=AAPL');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim() !== '');
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.status === "error") {
               setLogs(prev => [...prev, { ...parsed, error: true }]);
            } else if (parsed.status === "running") {
               setLogs(prev => [...prev, parsed]);
            } else if (parsed.status === "complete") {
               setLogs(prev => [...prev, { message: "Pipeline Execution Complete.", success: true }]);
               setData(parsed);
            }
          } catch(e) {}
        }
      }
    } catch (err) {
      setLogs(prev => [...prev, { message: `Connection Error: ${err.message}`, error: true }]);
    }
    setLoading(false);
  };

  return (
    <EngineContext.Provider value={{ data, loading, logs, hasStarted, fetchData }}>
      {children}
    </EngineContext.Provider>
  );
};

import { useEffect, useRef } from 'react';
import io from 'socket.io-client';


export function useSocket(url) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url);
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return socketRef.current;
}
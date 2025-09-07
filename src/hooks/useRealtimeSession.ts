import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';
import { LiveMessage } from '@/components/live/viewer/LiveChatMessage';

interface RealtimeSessionState {
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  messages: LiveMessage[];
  error: string | null;
}

export const useRealtimeSession = () => {
  const [state, setState] = useState<RealtimeSessionState>({
    isConnected: false,
    isRecording: false,
    isSpeaking: false,
    messages: [],
    error: null
  });
  
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const transcriptRef = useRef<string>('');

  const connect = useCallback(async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Connect to WebSocket
      const wsUrl = `wss://mcsltszqicdcvrhfnmtp.supabase.co/functions/v1/realtime-session`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to realtime session');
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        toast({
          title: "Connected",
          description: "Live session is ready",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        switch (data.type) {
          case 'response.audio.delta':
            if (audioContextRef.current) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current, bytes);
              setState(prev => ({ ...prev, isSpeaking: true }));
            }
            break;

          case 'response.audio.done':
            setState(prev => ({ ...prev, isSpeaking: false }));
            break;

          case 'response.audio_transcript.delta':
            transcriptRef.current += data.delta;
            break;

          case 'response.audio_transcript.done':
            if (transcriptRef.current.trim()) {
              const newMessage: LiveMessage = {
                id: `ai-${Date.now()}`,
                sender: {
                  id: 'ai',
                  name: 'AI Host',
                  isStaff: true
                },
                content: transcriptRef.current.trim(),
                timestamp: new Date()
              };
              
              setState(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage]
              }));
              
              transcriptRef.current = '';
            }
            break;

          case 'input_audio_buffer.speech_started':
            setState(prev => ({ ...prev, isRecording: true }));
            break;

          case 'input_audio_buffer.speech_stopped':
            setState(prev => ({ ...prev, isRecording: false }));
            break;

          case 'error':
            setState(prev => ({ ...prev, error: data.message }));
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive",
            });
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          isRecording: false,
          isSpeaking: false 
        }));
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }));
      toast({
        title: "Connection Failed",
        description: "Could not connect to live session",
        variant: "destructive",
      });
    }
  }, [toast]);

  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await recorderRef.current.start();
      console.log('Started recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      console.log('Stopped recording');
    }
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Add user message to chat
    const userMessage: LiveMessage = {
      id: `user-${Date.now()}`,
      sender: {
        id: 'user',
        name: 'You'
      },
      content: text,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    // Send to AI
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    wsRef.current.send(JSON.stringify(event));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));
  }, []);

  const disconnect = useCallback(() => {
    stopRecording();
    clearAudioQueue();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setState({
      isConnected: false,
      isRecording: false,
      isSpeaking: false,
      messages: [],
      error: null
    });
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  };
};
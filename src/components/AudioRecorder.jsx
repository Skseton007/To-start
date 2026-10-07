import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Save, Smartphone, Settings } from 'lucide-react';
import { useToast } from './Toast';

export default function AudioRecorder({ onSaveIdea }) {
  const [isMobile, setIsMobile] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    return () => stopStream();
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const getMicrophones = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioDevs = devs.filter(d => d.kind === 'audioinput');
      setDevices(audioDevs);
      if (audioDevs.length > 0) setSelectedDevice(audioDevs[0].deviceId);
    } catch (e) {
      console.error(e);
      toast.error("Microphone access denied.");
    }
  };

  const startRecording = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title first!");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true
      });
      streamRef.current = s;
      chunksRef.current = [];
      const mr = new MediaRecorder(s);
      
      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
              suggestedName: `${title.trim() || 'QuickIdea'}_${Date.now()}.webm`,
              types: [{ description: 'Audio File', accept: { 'audio/webm': ['.webm'] } }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            toast.success("Voice idea saved to device!");
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.trim() || 'QuickIdea'}_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Voice idea downloaded!");
          }
          // Also save text idea to app
          onSaveIdea({ title: title.trim(), description: "Voice Idea recorded and saved to device." });
        } catch (err) {
          console.error(err);
        }
        stopStream();
      };
      
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (e) {
      console.error(e);
      toast.error("Could not start microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Idea Title *</label>
          <input 
            type="text" 
            placeholder="e.g. Next Big Video Idea"
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-xl"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="relative overflow-hidden inline-block w-full">
          <button className="w-full flex flex-col items-center justify-center gap-3 bg-purple-600 text-white p-6 rounded-3xl font-bold hover:bg-purple-700 transition-colors shadow-lg">
            <Smartphone size={32} /> 
            <span>Open Mobile Voice Recorder</span>
          </button>
          <input 
            type="file" 
            accept="audio/*" 
            capture="microphone" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                 if (title.trim()) {
                   onSaveIdea({ title: title.trim(), description: "Voice Idea saved to mobile device." });
                 } else {
                   toast.info("Audio saved to your device. Next time, add a title first to save it to your Ideas list too!");
                 }
              }
            }}
          />
        </div>
        <p className="text-gray-500 text-center text-sm font-medium">Your recording will be saved directly to your phone's media storage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Idea Title *</label>
        <input 
          type="text" 
          placeholder="e.g. Next Big Video Idea"
          className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-xl"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isRecording}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Audio Input Source</label>
        <div className="flex gap-2">
          <select 
            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-purple-500 outline-none font-bold text-sm"
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
            disabled={isRecording}
          >
            {devices.length === 0 && <option value="">No microphones found...</option>}
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.substring(0,5)}`}</option>
            ))}
          </select>
          <button onClick={getMicrophones} disabled={isRecording} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200" title="Refresh Mics">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border-2 border-dashed border-purple-200 dark:border-purple-800/30 gap-6">
        {isRecording ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl font-black text-red-500 animate-pulse">{formatTime(recordingTime)}</div>
            <button onClick={stopRecording} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-colors hover:scale-105 shadow-xl">
              <Square size={20} className="fill-white" /> Stop & Save
            </button>
          </div>
        ) : (
          <button onClick={startRecording} className="flex flex-col items-center gap-3 bg-purple-600 text-white p-6 rounded-full font-bold hover:bg-purple-700 transition-all hover:scale-110 shadow-[0_10px_20px_rgba(147,51,234,0.3)]">
            <Mic size={32} />
          </button>
        )}
      </div>
    </div>
  );
}

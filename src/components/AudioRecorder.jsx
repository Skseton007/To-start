import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Settings } from 'lucide-react';
import { useToast } from './Toast';

// Browsers can't record MP3. Use what the browser actually produces and name the file to match.
const pickAudioFormat = () => {
  const options = [
    { mimeType: 'audio/webm;codecs=opus', ext: 'webm' },
    { mimeType: 'audio/mp4', ext: 'm4a' },
    { mimeType: 'audio/ogg;codecs=opus', ext: 'ogg' },
  ];
  if (typeof MediaRecorder === 'undefined') return null;
  return options.find(o => MediaRecorder.isTypeSupported?.(o.mimeType)) || { mimeType: '', ext: 'webm' };
};

const safeFileName = (name) => name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'QuickIdea';

export default function AudioRecorder({ onSaveIdea }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const discardRef = useRef(false);
  const toast = useToast();

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // Closing the popup mid-recording: stop the mic and timer, don't save a half file
  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      discardRef.current = true;
      mediaRecorderRef.current.stop();
    }
    stopStream();
  }, []);

  const getMicrophones = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach(t => t.stop());
      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioDevs = devs.filter(d => d.kind === 'audioinput');
      setDevices(audioDevs);
      if (audioDevs.length > 0 && !selectedDevice) setSelectedDevice(audioDevs[0].deviceId);
    } catch (e) {
      console.error(e);
      toast.error('Microphone access denied.');
    }
  };

  const saveRecording = async (blob, ext, name) => {
    const fileName = `${safeFileName(name)}_${Date.now()}.${ext}`;
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'Audio File', accept: { [blob.type.split(';')[0] || 'audio/webm']: [`.${ext}`] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return 'saved';
      } catch (err) {
        if (err?.name === 'AbortError') return 'cancelled';
        console.error(err);
        // fall through to a normal download
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  };

  const startRecording = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first!');
      return;
    }
    const format = pickAudioFormat();
    if (!format || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Audio recording is not supported in this browser.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true
      });
      streamRef.current = s;
      chunksRef.current = [];
      discardRef.current = false;
      const mr = format.mimeType ? new MediaRecorder(s, { mimeType: format.mimeType }) : new MediaRecorder(s);
      const ideaTitle = title.trim();

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stopStream();
        if (discardRef.current) return;
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || format.mimeType || 'audio/webm' });
        const result = await saveRecording(blob, format.ext, ideaTitle);
        // The idea is saved in the app even if the file dialog was cancelled
        onSaveIdea({
          title: ideaTitle,
          description: result === 'cancelled' ? 'Voice idea (audio file not saved).' : 'Voice idea recorded and saved to device.',
        });
        toast.success(result === 'cancelled' ? 'Idea saved (audio file skipped)' : 'Voice idea saved!');
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
      stopStream();
      toast.error('Could not start microphone.');
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
            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-purple-500 outline-none font-bold text-sm"
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
            disabled={isRecording}
          >
            {devices.length === 0 && <option value="">Default microphone (tap ⚙ to choose)</option>}
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </select>
          <button onClick={getMicrophones} disabled={isRecording} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition" title="Load microphones">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border-2 border-dashed border-purple-200 dark:border-purple-800/30 gap-6">
        {isRecording ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl font-black text-red-500 tabular-nums animate-pulse">{formatTime(recordingTime)}</div>
            <button onClick={stopRecording} className="flex items-center gap-2 bg-gray-900 text-white dark:bg-white dark:text-black px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl">
              <Square size={20} className="fill-current" /> Stop & Save
            </button>
          </div>
        ) : (
          <button onClick={startRecording} aria-label="Start recording" className="flex flex-col items-center gap-3 bg-purple-600 text-white p-6 rounded-full font-bold hover:bg-purple-700 transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_10px_20px_rgba(147,51,234,0.3)]">
            <Mic size={32} />
          </button>
        )}
      </div>
    </div>
  );
}

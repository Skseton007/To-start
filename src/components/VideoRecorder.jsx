import React, { useState, useEffect, useRef } from 'react';
import { Video, StopCircle, Camera, CameraOff, Play } from 'lucide-react';

export default function VideoRecorder({ workspace, updateWorkspace }) {
  const [isMobile, setIsMobile] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    if (isRecording) stopRecording();
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
        audio: true
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsCameraOn(true);

      // Populate devices dropdown if empty
      if (devices.length === 0) {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevs[0].deviceId);
        }
      }
    } catch (e) {
      console.error('Camera access denied or failed', e);
      alert('Could not start camera. Please check permissions.');
    }
  };

  // When device changes while camera is on, restart it
  useEffect(() => {
    if (isCameraOn && selectedDevice) {
      stopCamera();
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice]);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    
    mr.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      try {
        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({
            suggestedName: `Recording_${Date.now()}.webm`,
            types: [{ description: 'WebM Video', accept: { 'video/webm': ['.webm'] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Recording_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    mr.start();
    mediaRecorderRef.current = mr;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <label className="block font-bold text-gray-700 dark:text-gray-300">Mobile Native Camera</label>
        <p className="text-gray-500 text-sm">Use your device's native camera app to record directly to your camera roll.</p>
        <div className="relative overflow-hidden inline-block w-full">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
            <Camera size={24} /> Open Camera & Record
          </button>
          <input 
            type="file" 
            accept="video/*" 
            capture="environment" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) => {
              if (e.target.files.length > 0) updateWorkspace({ saveFolder: 'Saved to Mobile Camera Roll' });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block font-bold text-gray-700 dark:text-gray-300">Camera Source</label>
          <select 
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg disabled:opacity-50"
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
            disabled={!isCameraOn && devices.length === 0}
          >
            {devices.length === 0 && <option value="">Turn on camera to load devices...</option>}
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.substring(0,5)}`}</option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          <label className="block font-bold text-gray-700 dark:text-gray-300">Action</label>
          <div className="flex gap-2">
            {!isCameraOn ? (
              <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                <Play size={20} /> Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white p-4 rounded-2xl font-bold hover:bg-gray-700 transition-colors">
                <CameraOff size={20} /> Stop Camera
              </button>
            )}
            
            {isCameraOn && !isRecording && (
              <button onClick={startRecording} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white p-4 rounded-2xl font-bold hover:bg-red-700 transition-colors">
                <Video size={20} /> Record
              </button>
            )}
            
            {isRecording && (
              <button onClick={stopRecording} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black transition-colors animate-pulse">
                <StopCircle size={20} /> Stop & Save
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative shadow-inner">
        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
            <CameraOff size={48} className="opacity-20" />
            <span className="font-bold">Camera is Off</span>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}></video>
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div> REC
          </div>
        )}
      </div>
    </div>
  );
}

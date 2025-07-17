import { useState, useEffect, useRef } from 'react';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  VideoTileState,
} from 'amazon-chime-sdk-js';

export interface VideoCallState {
  isConnected: boolean;
  isAudioMuted: boolean;
  hasRemoteParticipant: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  agentThumbnailRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  meetingSession: DefaultMeetingSession | null;
}

export interface VideoCallControls {
  startMeeting: (role: 'agent' | 'customer', meetingId: string) => Promise<void>;
  endMeeting: () => void;
  toggleAudioMute: () => void;
  switchToThumbnail: () => void;
}

export function useVideoCall(): [VideoCallState, VideoCallControls] {
  const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const agentThumbnailRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startMeeting = async (role: 'agent' | 'customer', meetingId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/meeting?role=${role}&meetingId=${encodeURIComponent(meetingId)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to join meeting');
      
      const { Meeting, Attendee } = data;

      const logger = new ConsoleLogger('ChimeLogs', 1);
      const deviceController = new DefaultDeviceController(logger);
      const configuration = new MeetingSessionConfiguration(Meeting, Attendee);
      const session = new DefaultMeetingSession(configuration, logger, deviceController);
      
      setMeetingSession(session);

      // Setup video devices
      const videoInputs = await session.audioVideo.listVideoInputDevices();
      if (videoInputs.length > 0) {
        await session.audioVideo.chooseVideoInputDevice(videoInputs[0].deviceId);
      }

      // Setup audio devices with headset preference
      const audioInputs = await session.audioVideo.listAudioInputDevices();
      if (audioInputs.length > 0) {
        const headsetDevice = audioInputs.find(device => 
          device.label.toLowerCase().includes('headset') || 
          device.label.toLowerCase().includes('headphone') ||
          device.label.toLowerCase().includes('bluetooth')
        );
        const selectedDevice = headsetDevice || audioInputs[0];
        await session.audioVideo.chooseAudioInputDevice(selectedDevice.deviceId);
      }

      // Setup audio output with headset preference
      const audioOutputs = await session.audioVideo.listAudioOutputDevices();
      if (audioOutputs.length > 0) {
        const headsetOutput = audioOutputs.find(device => 
          device.label.toLowerCase().includes('headset') || 
          device.label.toLowerCase().includes('headphone') ||
          device.label.toLowerCase().includes('bluetooth')
        );
        const selectedOutput = headsetOutput || audioOutputs[0];
        await session.audioVideo.chooseAudioOutputDevice(selectedOutput.deviceId);
      }

      // Start the meeting
      session.audioVideo.start();

      // Bind audio element
      if (audioRef.current) {
        await session.audioVideo.bindAudioElement(audioRef.current);
      }

      // Mute initially to prevent feedback
      session.audioVideo.realtimeMuteLocalAudio();

      // Setup video tile observer
      session.audioVideo.addObserver({
        videoTileDidUpdate: (tile: VideoTileState) => {
          if (!tile.boundAttendeeId || tile.tileId == null) return;
          
          if (tile.localTile) {
            // For agent role, bind to thumbnail; for customer, bind to main video
            if (role === 'agent' && agentThumbnailRef.current) {
              session.audioVideo.bindVideoElement(tile.tileId, agentThumbnailRef.current);
            } else if (role === 'customer' && localVideoRef.current) {
              session.audioVideo.bindVideoElement(tile.tileId, localVideoRef.current);
            }
          } else {
            // Remote video always goes to main video area
            if (remoteVideoRef.current) {
              session.audioVideo.bindVideoElement(tile.tileId, remoteVideoRef.current);
              setHasRemoteParticipant(true);
            }
          }
        },
        videoTileWasRemoved: (tileId: number) => {
          const remoteTiles = session.audioVideo.getAllRemoteVideoTiles();
          if (remoteTiles.length === 0) {
            setHasRemoteParticipant(false);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          }
        }
      });

      // Subscribe to mute/unmute events
      session.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio((muted: boolean) => {
        setIsAudioMuted(muted);
      });

      // Start local video after a delay
      setTimeout(() => {
        session.audioVideo.startLocalVideoTile();
        setIsConnected(true);
      }, 1000);

    } catch (error) {
      console.error('Error starting meeting:', error);
      throw error;
    }
  };

  const endMeeting = () => {
    if (meetingSession) {
      meetingSession.audioVideo.stopLocalVideoTile();
      meetingSession.audioVideo.stop();
      setMeetingSession(null);
    }
    setIsConnected(false);
    setHasRemoteParticipant(false);
    setIsAudioMuted(true);
  };

  const toggleAudioMute = () => {
    if (!meetingSession) return;
    
    if (isAudioMuted) {
      const success = meetingSession.audioVideo.realtimeUnmuteLocalAudio();
      if (success) {
        setIsAudioMuted(false);
      }
    } else {
      meetingSession.audioVideo.realtimeMuteLocalAudio();
      setIsAudioMuted(true);
    }
  };

  const switchToThumbnail = () => {
    // This can be used to switch video rendering mode if needed
    console.log('Switching to thumbnail mode');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (meetingSession) {
        meetingSession.audioVideo.stopLocalVideoTile();
        meetingSession.audioVideo.stop();
      }
    };
  }, [meetingSession]);

  const state: VideoCallState = {
    isConnected,
    isAudioMuted,
    hasRemoteParticipant,
    localVideoRef,
    remoteVideoRef,
    agentThumbnailRef,
    audioRef,
    meetingSession
  };

  const controls: VideoCallControls = {
    startMeeting,
    endMeeting,
    toggleAudioMute,
    switchToThumbnail
  };

  return [state, controls];
}
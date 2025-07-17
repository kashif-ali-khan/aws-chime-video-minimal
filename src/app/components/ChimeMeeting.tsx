'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  VideoTileState,
} from 'amazon-chime-sdk-js';

export default function ChimeMeeting({ role, meetingId }: { role: 'customer' | 'agent'; meetingId?: string }) {
  const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const toggleAudioMute = () => {
    if (!meetingSession) {
      console.log('Meeting session not ready');
      return;
    }
    
    console.log('Toggle audio mute clicked. Current state:', isAudioMuted);
    console.log('Can unmute:', meetingSession.audioVideo.realtimeCanUnmuteLocalAudio());
    console.log('Is muted:', meetingSession.audioVideo.realtimeIsLocalAudioMuted());
    
    try {
      if (isAudioMuted) {
        const success = meetingSession.audioVideo.realtimeUnmuteLocalAudio();
        console.log('Unmute result:', success);
        if (success) {
          setIsAudioMuted(false);
          console.log('Audio unmuted successfully');
        } else {
          console.log('Failed to unmute audio');
        }
      } else {
        meetingSession.audioVideo.realtimeMuteLocalAudio();
        setIsAudioMuted(true);
        console.log('Audio muted successfully');
      }
    } catch (error) {
      console.error('Error toggling audio mute:', error);
    }
  };

  useEffect(() => {
    let session: DefaultMeetingSession | null = null;
    async function startMeeting() {
      setLoading(true);
      setError(null);
      setHasRemoteParticipant(false);
      setIsAudioMuted(true); // Start muted to prevent feedback
      try {
        const res = await fetch(`/api/meeting?role=${role}&meetingId=${encodeURIComponent(meetingId || 'demo-meeting')}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to join meeting');
        const { Meeting, Attendee } = data;

        const logger = new ConsoleLogger('ChimeLogs', 1);
        const deviceController = new DefaultDeviceController(logger);
        const configuration = new MeetingSessionConfiguration(Meeting, Attendee);
        session = new DefaultMeetingSession(configuration, logger, deviceController);
        setMeetingSession(session);

        // Choose video device
        const videoInputs = await session.audioVideo.listVideoInputDevices();
        if (videoInputs.length > 0) {
          await session.audioVideo.chooseVideoInputDevice(videoInputs[0].deviceId);
        }

        // Choose and start audio device with echo cancellation
        const audioInputs = await session.audioVideo.listAudioInputDevices();
        console.log('Available audio inputs:', audioInputs);
        if (audioInputs.length > 0) {
          // Find headset/headphone device first, fallback to default
          const headsetDevice = audioInputs.find(device => 
            device.label.toLowerCase().includes('headset') || 
            device.label.toLowerCase().includes('headphone') ||
            device.label.toLowerCase().includes('bluetooth')
          );
          const selectedDevice = headsetDevice || audioInputs[0];
          
          // Use device ID directly - Chime SDK will handle constraints internally
          await session.audioVideo.chooseAudioInputDevice(selectedDevice.deviceId);
          console.log('Selected audio input with echo cancellation:', selectedDevice.deviceId);
        } else {
          console.warn('No audio input devices found');
        }

        // Choose audio output device (prefer headphones over speakers)
        const audioOutputs = await session.audioVideo.listAudioOutputDevices();
        console.log('Available audio outputs:', audioOutputs);
        if (audioOutputs.length > 0) {
          // Find headset/headphone device first to prevent feedback
          const headsetOutput = audioOutputs.find(device => 
            device.label.toLowerCase().includes('headset') || 
            device.label.toLowerCase().includes('headphone') ||
            device.label.toLowerCase().includes('bluetooth')
          );
          const selectedOutput = headsetOutput || audioOutputs[0];
          
          await session.audioVideo.chooseAudioOutputDevice(selectedOutput.deviceId);
          console.log('Selected audio output:', selectedOutput.deviceId);
        }

        // Start the meeting session
        session.audioVideo.start();

        // Bind audio element for meeting audio
        if (audioRef.current) {
          await session.audioVideo.bindAudioElement(audioRef.current);
          console.log('Audio element bound');
        }

        // Mute local audio playback to prevent feedback
        session.audioVideo.realtimeMuteLocalAudio();

        // Add observer for video tiles and audio state
        session.audioVideo.addObserver({
          videoTileDidUpdate: (tile: VideoTileState) => {
            //console.log(tile.localTile,'--tile.localTile--',role,'---role---KASHIF--videoTileDidUpdate', tile,'--boundExternalUserId',tile.boundExternalUserId);
            if (!tile.boundAttendeeId || tile.tileId == null) return;
            
            // Local video
            if (tile.localTile && localVideoRef.current) {
              session!.audioVideo.bindVideoElement(tile.tileId, localVideoRef.current);
            }
            
            // Remote video
            if (!tile.localTile && (tile.boundExternalUserId!==null && (role==='customer'? tile.boundExternalUserId.includes('agent') : tile.boundExternalUserId.includes('customer')))  && remoteVideoRef.current) {
              session!.audioVideo.bindVideoElement(tile.tileId, remoteVideoRef.current);
              setHasRemoteParticipant(prev => !prev ? true : prev);
            }
          },
          videoTileWasRemoved: (tileId: number) => {
            // Check if this was a remote tile
            const remoteTiles = session!.audioVideo.getAllRemoteVideoTiles();
            if (remoteTiles.length === 0) {
              setHasRemoteParticipant(prev => prev ? false : prev);
              // Clear the remote video element
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
            }
          }
        });

        // Subscribe to mute/unmute events to keep state in sync
        session.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio((muted: boolean) => {
          console.log('Mute state changed:', muted);
          setIsAudioMuted(prev => prev !== muted ? muted : prev);
        });

        // Wait a bit for the session to fully establish before starting local video
        setTimeout(() => {
          if (session) {
            session.audioVideo.startLocalVideoTile();
            console.log('Local video tile started');
            
            // Check initial mute state (should be true since we muted on start)
            const initialMuteState = session.audioVideo.realtimeIsLocalAudioMuted();
            console.log('Initial mute state:', initialMuteState);
            setIsAudioMuted(initialMuteState);
          }
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    startMeeting();
    return () => {
      if (session) {
        session.audioVideo.stopLocalVideoTile();
        session.audioVideo.stop();
      }
      setHasRemoteParticipant(false);
      setIsAudioMuted(false);
    };
  }, [role, meetingId]);

  if (loading) return <div>Loading meeting...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>{role === 'customer' ? 'Customer' : 'Agent'} Meeting</h2>
      
      {/* Hidden audio element for meeting audio */}
      <audio ref={audioRef} autoPlay />
      
      {/* Audio Controls */}
      <div style={{ marginBottom: 20, padding: 10, background: '#f5f5f5', borderRadius: 5 }}>
        <button 
          onClick={toggleAudioMute}
          style={{
            padding: '10px 20px',
            backgroundColor: isAudioMuted ? '#ff4444' : '#44aa44',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isAudioMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
        <span style={{ marginLeft: 10, color: isAudioMuted ? '#ff4444' : '#44aa44' }}>
          Audio: {isAudioMuted ? 'Muted' : 'Unmuted'}
        </span>
        {meetingSession && (
          <span style={{ marginLeft: 10, color: '#666' }}>
            Can Unmute: {meetingSession.audioVideo.realtimeCanUnmuteLocalAudio() ? 'Yes' : 'No'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h3>Local Video ({role})</h3>
          <video ref={localVideoRef} style={{ width: 400, height: 300, background: '#000' }} autoPlay />
        </div>
        <div>
          <h3>Remote Video ({role === 'customer' ? 'Agent' : 'Customer'})</h3>
          <video 
            ref={remoteVideoRef} 
            style={{ 
              width: 400, 
              height: 300, 
              background: '#222',
              display: hasRemoteParticipant ? 'block' : 'none'
            }} 
            autoPlay 
          />
          {!hasRemoteParticipant && (
            <div style={{ width: 400, height: 300, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Waiting for {role === 'customer' ? 'Agent' : 'Customer'} to join...
            </div>
          )}
        </div>
      </div>
      {/* TODO: Add controls for leave, device selection */}
    </div>
  );
} 
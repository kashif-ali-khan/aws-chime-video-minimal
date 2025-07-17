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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);

  useEffect(() => {
    let session: DefaultMeetingSession | null = null;
    async function startMeeting() {
      setLoading(true);
      setError(null);
      setHasRemoteParticipant(false);
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

        // Start the meeting session
        session.audioVideo.start();

        // Add observer for video tiles
        session.audioVideo.addObserver({
          videoTileDidUpdate: (tile: VideoTileState) => {
           console.log(tile.localTile,'--tile.localTile--',role,'---role---KASHIF--videoTileDidUpdate', tile,'--boundExternalUserId',tile.boundExternalUserId);
            if (!tile.boundAttendeeId || tile.tileId == null) return;
            
            // Local video
            if (tile.localTile && localVideoRef.current) {
              session!.audioVideo.bindVideoElement(tile.tileId, localVideoRef.current);
            }
            
            // Remote video
            if (!tile.localTile && (tile.boundExternalUserId!==null && (role==='customer'? tile.boundExternalUserId.includes('agent') : tile.boundExternalUserId.includes('customer')))  && remoteVideoRef.current) {
              session!.audioVideo.bindVideoElement(tile.tileId, remoteVideoRef.current);
              setHasRemoteParticipant(true);
            }
          },
          videoTileWasRemoved: (tileId: number) => {
            // Check if this was a remote tile
            const remoteTiles = session!.audioVideo.getAllRemoteVideoTiles();
            if (remoteTiles.length === 0) {
              setHasRemoteParticipant(false);
              // Clear the remote video element
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
            }
          }
        });

        // Wait a bit for the session to fully establish before starting local video
        setTimeout(() => {
          if (session) {
            session.audioVideo.startLocalVideoTile();
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
      session?.audioVideo.stop();
      setHasRemoteParticipant(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, meetingId]);

  if (loading) return <div>Loading meeting...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>{role === 'customer' ? 'Customer' : 'Agent'} Meeting</h2>
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
      {/* TODO: Add controls for mute, leave, device selection */}
    </div>
  );
} 
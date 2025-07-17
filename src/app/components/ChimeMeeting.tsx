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
  const [localTileId, setLocalTileId] = useState<number | null>(null);
  const [remoteTileId, setRemoteTileId] = useState<number | null>(null);
  const [tileInfo, setTileInfo] = useState<string>('');

  // Helper function to get tile information
  const getTileInfo = (session: DefaultMeetingSession) => {
    const allTiles = session.audioVideo.getAllVideoTiles();
    const remoteTiles = session.audioVideo.getAllRemoteVideoTiles();
    console.log('KASHIF--remoteTiles', remoteTiles);
    const localTile = session.audioVideo.getLocalVideoTile();
    
    const info = {
      totalTiles: allTiles.length,
      remoteTiles: remoteTiles.length,
      localTileId: localTile?.id() || 'None',
      allTileIds: allTiles.map(tile => tile.id()),
      remoteTileIds: remoteTiles.map(tile => tile.id())
    };
    
    setTileInfo(JSON.stringify(info, null, 2));
    return info;
  };

  useEffect(() => {
    let session: DefaultMeetingSession | null = null;
    let tileCheckInterval: NodeJS.Timeout | null = null;
    
    async function startMeeting() {
      setLoading(true);
      setError(null);
      setHasRemoteParticipant(false);
      setLocalTileId(null);
      setRemoteTileId(null);
      setTileInfo('');
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
            if (!tile.boundAttendeeId || tile.tileId == null) return;
            
            console.log('KASHIF--videoTileDidUpdate', {
              tileId: tile.tileId,
              localTile: tile.localTile,
              isContent: tile.isContent,
              boundAttendeeId: tile.boundAttendeeId,
              active: tile.active,
              paused: tile.paused
            });
            
            // Local video tile
            if (tile.localTile) {
              console.log('KASHIF--localTile', tile);
              setLocalTileId(tile.tileId);
              if (localVideoRef.current) {
                session!.audioVideo.bindVideoElement(tile.tileId, localVideoRef.current);
              }
            }
            
            // Remote video tile (non-local, non-content, not paused)
            if (!tile.localTile && !tile.isContent && !tile.paused) {
              console.log('KASHIF--remoteTile', tile);
              setRemoteTileId(tile.tileId);
              setHasRemoteParticipant(true);
              if (remoteVideoRef.current) {
                session!.audioVideo.bindVideoElement(tile.tileId, remoteVideoRef.current);
              }
            }

            // Update tile information
            if (session) {
              getTileInfo(session);
            }
          },
          videoTileWasRemoved: (tileId: number) => {
            console.log('KASHIF--videoTileWasRemoved', tileId);
            
            // Unbind the video element when tile is removed
            session!.audioVideo.unbindVideoElement(tileId);
            
            // Update state based on which tile was removed
            if (tileId === localTileId) {
              setLocalTileId(null);
            } else if (tileId === remoteTileId) {
              setRemoteTileId(null);
              setHasRemoteParticipant(false);
            }

            // Update tile information
            if (session) {
              getTileInfo(session);
            }
          }
        });

        // Wait a bit for the session to fully establish before starting local video
        setTimeout(() => {
          if (session) {
            session.audioVideo.startLocalVideoTile();
            // Get initial tile information
            getTileInfo(session);
            
            // Set up periodic tile state check
            tileCheckInterval = setInterval(() => {
              if (session) {
                const remoteTiles = session.audioVideo.getAllRemoteVideoTiles();
                console.log('KASHIF--periodic check remoteTiles', remoteTiles);
                
                // If we think we have a remote participant but no remote tiles exist
                if (hasRemoteParticipant && remoteTiles.length === 0) {
                  console.log('KASHIF--remote participant disconnected, updating state');
                  setHasRemoteParticipant(false);
                  setRemoteTileId(null);
                  if (remoteVideoRef.current) {
                    session.audioVideo.unbindVideoElement(remoteTileId!);
                  }
                }
                
                getTileInfo(session);
              }
            }, 5000); // Check every 5 seconds
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
      // Cleanup: unbind all video elements before stopping
      if (tileCheckInterval) {
        clearInterval(tileCheckInterval);
      }
      if (session) {
        if (localTileId !== null) {
          session.audioVideo.unbindVideoElement(localTileId);
        }
        if (remoteTileId !== null) {
          session.audioVideo.unbindVideoElement(remoteTileId);
        }
        session.audioVideo.stop();
      }
      setHasRemoteParticipant(false);
      setLocalTileId(null);
      setRemoteTileId(null);
      setTileInfo('');
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
          {hasRemoteParticipant ? (
            <video ref={remoteVideoRef} style={{ width: 400, height: 300, background: '#222' }} autoPlay />
          ) : (
            <div style={{ width: 400, height: 300, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Waiting for {role === 'customer' ? 'Agent' : 'Customer'} to join...
            </div>
          )}
        </div>
      </div>
      
      {/* Debug information - optional */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h4>Tile Information (Debug)</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>{tileInfo || 'No tile information available'}</pre>
      </div>
      
      {/* TODO: Add controls for mute, leave, device selection */}
    </div>
  );
} 
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentHome() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState('');

  const joinMeeting = () => {
    if (!meetingId.trim()) {
      alert('Please enter a meeting ID');
      return;
    }
    router.push(`/agent/meeting?meetingId=${encodeURIComponent(meetingId)}`);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Agent Portal</h1>
      <div style={{ marginBottom: 20 }}>
        <label>
          Meeting ID to Join:
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter meeting ID to join"
            style={{ marginLeft: 10, padding: 8, width: 300 }}
          />
        </label>
      </div>
      <button onClick={joinMeeting}>Join Meeting</button>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerHome() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState('');

  const generateMeeting = () => {
    if (!meetingId.trim()) {
      alert('Please enter a meeting ID');
      return;
    }
    router.push(`/customer/meeting?meetingId=${encodeURIComponent(meetingId)}`);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Customer Portal</h1>
      <div style={{ marginBottom: 20 }}>
        <label>
          Meeting ID:
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter meeting ID (e.g., customer-support-123)"
            style={{ marginLeft: 10, padding: 8, width: 300 }}
          />
        </label>
      </div>
      <button onClick={generateMeeting}>Generate & Join Meeting</button>
    </div>
  );
} 
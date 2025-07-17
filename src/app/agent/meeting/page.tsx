'use client';
import { useSearchParams } from 'next/navigation';
import ChimeMeeting from '../../components/ChimeMeeting';

export default function AgentMeetingPage() {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId') || 'demo-meeting';
  
  return <ChimeMeeting role="agent" meetingId={meetingId} />;
} 
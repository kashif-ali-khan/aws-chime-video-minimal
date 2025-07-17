import { NextRequest, NextResponse } from 'next/server';
import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand } from '@aws-sdk/client-chime-sdk-meetings';

const client = new ChimeSDKMeetingsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || 'customer';
  const meetingId = searchParams.get('meetingId') || 'demo-meeting';

  // 1. Create or get meeting
  let meeting;
  try {
    const createMeetingRes = await client.send(
      new CreateMeetingCommand({
        ClientRequestToken: meetingId,
        ExternalMeetingId: meetingId,
        MediaRegion: process.env.AWS_REGION,
      })
    );
    meeting = createMeetingRes.Meeting;
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create meeting', details: err }, { status: 500 });
  }

  // 2. Create attendee
  let attendee;
  try {
    const createAttendeeRes = await client.send(
      new CreateAttendeeCommand({
        MeetingId: meeting?.MeetingId!,
        ExternalUserId: `${role}-${Math.random().toString(36).substring(2, 15)}`,
      })
    );
    attendee = createAttendeeRes.Attendee;
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create attendee', details: err }, { status: 500 });
  }

  return NextResponse.json({ Meeting: meeting, Attendee: attendee });
} 
const express = require('express');
const { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand } = require('@aws-sdk/client-chime-sdk-meetings');

const router = express.Router();

const client = new ChimeSDKMeetingsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// GET /api/meeting - Create or join meeting
router.get('/', async (req, res) => {
  try {
    const { role = 'customer', meetingId = 'demo-meeting' } = req.query;

    console.log(`Creating meeting for role: ${role}, meetingId: ${meetingId}`);

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
      console.log('Meeting created successfully:', meeting.MeetingId);
    } catch (err) {
      console.error('Failed to create meeting:', err);
      return res.status(500).json({ 
        error: 'Failed to create meeting', 
        details: err.message 
      });
    }

    // 2. Create attendee
    let attendee;
    try {
      const createAttendeeRes = await client.send(
        new CreateAttendeeCommand({
          MeetingId: meeting?.MeetingId,
          ExternalUserId: `${role}-${Math.random().toString(36).substring(2, 15)}`,
        })
      );
      attendee = createAttendeeRes.Attendee;
      console.log('Attendee created successfully:', attendee.AttendeeId);
    } catch (err) {
      console.error('Failed to create attendee:', err);
      return res.status(500).json({ 
        error: 'Failed to create attendee', 
        details: err.message 
      });
    }

    res.json({ 
      Meeting: meeting, 
      Attendee: attendee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

module.exports = router;
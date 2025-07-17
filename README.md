# AWS Chime Video Call Frontend

A Next.js React frontend for AWS Chime video calling functionality.

## Architecture

This frontend connects to a separate Node.js backend server that handles AWS Chime SDK operations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure the backend URL in `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

4. Make sure the backend server is running on port 3001.

## Running the Frontend

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The frontend will start on port 3000 by default.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── ChimeMeeting.tsx    # Main meeting component
│   ├── customer/
│   │   └── meeting/
│   │       └── page.tsx        # Customer meeting page
│   ├── agent/
│   │   └── meeting/
│   │       └── page.tsx        # Agent meeting page
│   ├── layout.tsx              # App layout
│   └── page.tsx                # Home page
```

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL (default: http://localhost:3001)
- `NODE_ENV`: Environment (development/production)

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Navigate to:
   - Customer: http://localhost:3000/customer/meeting
   - Agent: http://localhost:3000/agent/meeting

## Features

- Real-time video calling with AWS Chime SDK
- Separate customer and agent interfaces
- Audio mute/unmute controls
- Automatic headset detection and echo cancellation
- Responsive design

## Dependencies

- **amazon-chime-sdk-js**: Client-side Chime SDK for video/audio
- **next**: React framework
- **react**: UI library
- **react-dom**: React DOM rendering
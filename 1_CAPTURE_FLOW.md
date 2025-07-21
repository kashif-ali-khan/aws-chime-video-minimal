# Photo Capture Flow Documentation

## Overview
This document explains the correct photo capture flow implemented in the application.

## Flow Summary

### 1. Agent Initiates Photo Capture
- **Agent clicks camera button** (📸) in the video call interface
- **System sends message** to customer: `photo_ready`
- **Customer screen shows** circular overlay for face positioning

### 2. Customer Sees Circular Overlay (Face Capture)
- **Circular overlay appears** on customer's video screen
- **Dark background** outside the circle for focus
- **Green dashed border** around the capture area
- **Instructions displayed**: "Position your face within the circle"

### 3. Agent Initiates ID Capture
- **Agent clicks ID button** (🆔) in the video call interface  
- **System sends message** to customer: `id_ready`
- **Customer screen shows** rectangular overlay for ID positioning

### 4. Customer Sees Rectangular Overlay (ID Capture)
- **Rectangular overlay appears** on customer's video screen
- **Dark background** outside the rectangle for focus
- **Yellow dashed border** around the capture area
- **Instructions displayed**: "Show your ID card within the rectangle"

### 5. Capture Process
- **Agent clicks capture button** → sends `photo_capture` or `id_capture` message
- **3-second countdown** appears on customer screen
- **System captures** only the area within the overlay
- **Circular crop** for face photos (perfect circle)
- **Rectangular crop** for ID cards (maintains aspect ratio)
- **Image sent back** to agent as base64 data URL

## Technical Implementation

### Customer Side
- **Overlay rendering** with CSS positioning
- **Canvas-based cropping** using HTML5 Canvas API
- **Circular clipping path** for face photos
- **Rectangular cropping** for ID cards
- **Countdown timer** with visual feedback

### Agent Side
- **Trigger buttons** for photo and ID capture
- **Message sending** to customer via WebSocket
- **Image reception** and storage in state
- **Preview functionality** for captured images

## Configuration System

### Capture Configuration File 
All capture dimensions and settings are now configurable through a centralized configuration file:

```javascript
export const CAPTURE_CONFIG = {
  face: {
    overlayWidth: '75%',    // Overlay size on screen
    overlayHeight: '75%',   // Overlay size on screen
    cropRadius: 0.35,       // Crop size (35% of video dimension)
    borderColor: '#2ecc71', // Green border
    instruction: 'Position your face within the circle',
    countdownSeconds: 3,
  },
  id: {
    overlayWidth: '85%',    // Overlay size on screen
    overlayHeight: '60%',   // Overlay size on screen
    cropWidth: 0.7,         // Crop width (70% of video width)
    cropHeight: 0.5,        // Crop height (50% of video height)
    borderColor: '#f1c40f', // Yellow border
    instruction: 'Show your ID card within the rectangle',
    countdownSeconds: 3,
  },
  general: {
    backgroundOpacity: 0.6, // Overlay background opacity
    imageQuality: 0.9,      // JPEG quality (0.0 to 1.0)
    imageFormat: 'image/jpeg',
    animationDuration: '0.3s',
  }
};
```

### Benefits of Configuration System
- **Easy customization**: Change sizes without touching code
- **Consistent settings**: All capture parameters in one place
- **Maintainable**: Clear documentation of each setting
- **Flexible**: Easy to adjust for different use cases

## Key Features

### Visual Overlays
- **Circle**: 75% of video size, green dashed border
- **Rectangle**: 85% width × 60% height, yellow dashed border
- **Dark background**: 60% opacity outside capture area
- **Clear instructions**: Positioned at bottom of screen

### Capture Quality
- **High resolution**: Uses full video resolution
- **JPEG format**: 90% quality for optimal file size
- **Proper cropping**: Only captures area within overlay
- **Aspect ratio preservation**: Maintains original proportions

### User Experience
- **3-second countdown**: Gives time for positioning
- **Visual feedback**: Large pulsing numbers during countdown
- **Clear instructions**: Different messages for face vs ID
- **Smooth transitions**: Overlay appears/disappears smoothly

## Message Flow

```
Agent → Customer: photo_ready
Customer: Shows circular overlay
Agent → Customer: photo_capture  
Customer: 3-second countdown → captures circular crop → sends face_captured

Agent → Customer: id_ready
Customer: Shows rectangular overlay  
Agent → Customer: id_capture
Customer: 3-second countdown → captures rectangular crop → sends id_captured
```

## Customization Guide

To modify capture dimensions or settings:

1. **Open** `src/config/captureConfig.js`
2. **Locate** the setting you want to change
3. **Modify** the value as needed
4. **Save** the file - changes take effect immediately

### Common Customizations:
- **Increase overlay size**: Change `overlayWidth` and `overlayHeight` percentages
- **Adjust crop area**: Modify `cropRadius`, `cropWidth`, or `cropHeight` values
- **Change colors**: Update `borderColor` values
- **Modify countdown**: Adjust `countdownSeconds` value
- **Change image quality**: Update `imageQuality` (0.0 to 1.0) 
# Immersive Slideshow - Modern Image & Name Presentation Application

Immersive Slideshow is a sophisticated web application designed to create dynamic, visually engaging presentations that combine images with randomized name permutations. Built with Next.js and React, it offers a modern, immersive experience with extensive customization options.

## Application Overview

Immersive Slideshow transforms the traditional slideshow concept by combining uploaded images with dynamically generated name permutations. The application randomly selects images and names during playback, creating unique combinations with each transition. It's ideal for creative presentations, digital art installations, photography portfolios, and other contexts where visual content needs to be presented in an engaging manner.

## Core Features

### Image Management
- **Drag-and-drop Image Upload**: Easily add images to the slideshow through an intuitive interface
- **Automatic Image Processing**: Images are automatically resized and optimized according to user settings
- **Image Persistence**: All uploaded images are saved between sessions using local storage
- **Image Limit**: Maximum of 20 images can be stored to maintain performance

### Name Generation
- **Dynamic Name Permutations**: Combines first and last names from different entries to create unique combinations
- **Name Management**: Interface for adding, editing, or removing name combinations
- **Default Name Set**: Comes pre-loaded with a diverse set of example names

### Playback Controls
- **Play/Pause**: Start or stop the slideshow with button controls or keyboard shortcuts
- **Adjustable Transition Speeds**: Separate controls for image and text transition timing
- **Multiple Transition Effects**: Choose between fade, slide, zoom, or no transition effects
- **Immersive Mode**: Hide all UI elements for a distraction-free viewing experience

### Visual Customization
- **Theme Options**: Light and dark mode support
- **Text Positioning**: Drag-and-drop text box placement anywhere on the screen
- **Text Size Control**: Adjustable font size from 16px to 100px via slider
- **Image Fit Options**: Choose between contain, cover, or fill modes
- **Image Dimensions**: Adjust width and height independently
- **Blank Frame Injection**: Experimental feature to insert blank frames at adjustable frequencies

### User Interface
- **Intuitive Controls**: Clean, modern interface with responsive design
- **Quick-access Control Panel**: Sliders for immediate adjustment of key parameters
- **Keyboard Shortcuts**: Spacebar for play/pause, F key for fullscreen, and ESC to exit settings
- **Touch Support**: Full touch screen compatibility for mobile and tablet use

## Technical Architecture

### Frontend Framework
- **Next.js**: Utilizing the App Router for modern, server-side rendered React applications
- **React**: Component-based architecture with functional components and hooks
- **TypeScript**: Type-safe code ensuring reliability and better developer experience

### State Management
- **Zustand**: Lightweight state management with persist middleware for local storage
- **React Hooks**: Extensive use of useState, useEffect, useRef for component-level state

### Animation and Interaction
- **Framer Motion**: Powering smooth transitions and animations throughout the application
- **React Dropzone**: Handling drag-and-drop file uploads
- **Custom Drag Handlers**: Enabling text repositioning with mouse and touch events

### Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive, customizable designs
- **Heroicons**: SVG icon set for consistent visual elements
- **Dynamic Styling**: Theme-aware styling that adapts to light and dark mode

## Component Directory

### Core Components
- **`Home`** (`src/app/page.tsx`): Main application page containing the slideshow and UI
- **`SettingsPage`** (`src/app/settings/page.tsx`): Configuration page for all slideshow options
- **`NameManager`** (`src/components/NameManager.tsx`): Interface for managing name entries
- **`Settings`** (`src/components/Settings.tsx`): Settings button component
- **`Onboarding`** (`src/components/Onboarding.tsx`): First-time user experience guide

### State Management
- **`slideshowStore`** (`src/store/slideshowStore.ts`): Central state management using Zustand
  - Manages images, names, settings, and provides utility functions
  - Handles persistence of user data between sessions

### Configuration
- **`names.ts`** (`src/config/names.ts`): Configuration file for default names

## Feature Details

### Image Transition System
The image transition system works by:
1. Maintaining an array of image data URLs in the store
2. Using `getRandomImageIndex()` to select a random image (or blank frame)
3. Applying transition effects via Framer Motion when switching images
4. Controlling transition timing through adjustable settings

### Name Generation System
The name generation operates by:
1. Storing first and last name pairs in an array
2. Using `getRandomNamePermutation()` to randomly select different first and last names
3. Combining them to create unique name combinations
4. Displaying the results in a customizable text box

### Blank Frame Feature (Experimental)
This feature injects blank frames (showing just the background color) into the image sequence:
1. A probability slider (0-1) controls how frequently blank frames appear
2. When `getRandomImageIndex()` is called, it determines whether to return a normal image index or `null`
3. When `null` is returned, the UI displays a blank frame instead of an image
4. This creates visual pauses/breathing room in the presentation

### Text Size Control
The text size control allows customizing the prominence of text:
1. A slider in the control panel adjusts font size from 16px to 100px
2. The text component uses inline styles to apply the selected size
3. The text box adapts naturally to accommodate different font sizes

## Installation and Setup

### Prerequisites
- Node.js 14.6.0 or higher
- npm or yarn package manager

### Installation Steps
1. Clone the repository
   ```
   git clone <repository-url>
   cd Imagery2
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open the application in your browser
   - Default address: http://localhost:3000

### Production Deployment
1. Build the application
   ```
   npm run build
   # or
   yarn build
   ```

2. Start the production server
   ```
   npm start
   # or
   yarn start
   ```

## User Guide

### First-time Setup
1. When first opening the application, you'll see an onboarding screen
2. Upload images by dragging and dropping onto the upload area
3. Images will be processed and added to your library automatically

### Basic Usage
1. **Start/Stop Slideshow**:
   - Click the play button at the bottom of the screen
   - Alternatively, press the spacebar

2. **Add Images**:
   - Click the upload icon in the top right
   - Drag and drop images onto the highlighted area
   - Images are automatically processed and added to the rotation

3. **Manage Names**:
   - Click the names panel on the left side
   - Add new name pairs using the form
   - Remove existing names as needed

4. **Quick Adjustments**:
   - Click "Sliders" in the top right to access commonly used settings
   - Adjust image and text transition speeds
   - Change text size and image dimensions
   - Control blank frame probability

5. **Enter Immersive Mode**:
   - Click the fullscreen icon at the bottom
   - Press the F key
   - All UI elements will be hidden for distraction-free viewing
   - Press ESC or click the exit button to return to normal view

### Advanced Configuration
1. **Access Settings**:
   - Click the gear icon in the bottom right

2. **Appearance Settings**:
   - Theme: Switch between dark and light mode
   - Image Fit: Choose how images fill the display area
   - Image Dimensions: Set custom width and height

3. **Transition Settings**:
   - Effect Type: None, fade, slide, or zoom
   - Duration: How long transitions take to complete
   - Speed: Interval between transitions

4. **Text Positioning**:
   - Drag and drop the text box to any position on the screen
   - Position is saved between sessions

## Technical Considerations and Limitations

### Performance Optimization
- Images are resized and compressed on upload for optimal performance
- Maximum of 20 images to prevent excessive memory usage
- Transitions are hardware-accelerated where available

### Browser Compatibility
- Full support for modern browsers (Chrome, Firefox, Safari, Edge)
- Limited support for Internet Explorer
- Requires JavaScript to be enabled

### Storage Limitations
- Uses browser local storage with typical limits of 5-10MB
- May not be suitable for very large image collections without modification

### Accessibility
- Keyboard shortcuts for essential functions
- High contrast options through theme selection
- Text size adjustment for better readability

## Future Development Roadmap

### Planned Features
- Cloud storage integration for image persistence across devices
- Additional transition effects and animation options
- Advanced text formatting and styling options
- Multi-user collaboration features
- Export functionality for created presentations

### Contribution Guidelines
- Pull requests welcome for bug fixes and minor enhancements
- Major feature additions should be discussed via issues first
- Follow existing code style and TypeScript patterns
- Include tests for new functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with Next.js, React, TypeScript, and Tailwind CSS
- Animations powered by Framer Motion
- Icons from Heroicons
- Developed as a modern alternative to traditional presentation software
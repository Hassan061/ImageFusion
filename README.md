# ImageFusion - Modern Name & Image Slideshow Generator

ImageFusion is an immersive and modern name and image slideshow generator built with Next.js and React. It's designed to create dynamic and visually appealing slideshows that combine images with randomized name combinations.

## Features

- **Immersive Slideshow Experience**: Full-screen mode, smooth transitions, and optimized image display.
- **Dynamic Name Permutations**: Randomly combines first and last names for creative name pairings.
- **Customizable Settings**:
  - Separate image and text transition speeds
  - Multiple transition effects (fade, slide, zoom, none)
  - Configurable name positions (top, center, bottom)
  - Adjustable image fit options (contain, cover, fill)
  - Customizable image dimensions
- **Persistent Storage**: Automatically saves your uploaded images and settings between sessions.
- **Modern UI**: Clean, intuitive interface with responsive design.
- **Privacy-Focused**: Option to clear personal data.

## Getting Started

### Prerequisites

- Node.js 14.6.0 or higher
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/imagefusion.git
   cd imagefusion
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

4. Open http://localhost:3000 in your browser

### Usage

1. **Adding Images**: 
   - Drag and drop images onto the upload area in the top-right corner
   - Images are automatically resized and optimized

2. **Managing Names**:
   - Use the name manager panel on the left side to add first and last names
   - Names are automatically shuffled to create random combinations

3. **Playback Control**:
   - Use the play/pause button at the bottom center
   - Press the spacebar to toggle playback

4. **Settings**:
   - Click the gear icon in the bottom-right to access settings
   - Adjust transition speeds, effects, and other display options
   - Toggle fullscreen mode with the expand icon

## Technologies Used

- Next.js & React
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State Management)
- React Dropzone

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built as a modern alternative to traditional slideshow applications
- Inspired by the need for dynamic and customizable image presentations
- Special thanks to the open-source community for the amazing tools that made this possible 
#!/bin/bash

# ImageFusion GitHub Setup Script

echo "Setting up ImageFusion for GitHub..."

# 1. Replace the store file with the privacy-focused version
echo "Copying privacy-focused store file..."
cp src/store/slideshowStore.cleaner.ts src/store/slideshowStore.ts

# 2. Initialize git repository if not already initialized
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
fi

# 3. Add all files
echo "Adding files to git..."
git add .

# 4. Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: ImageFusion slideshow generator"

# 5. Instructions for GitHub
echo ""
echo "Setup complete! To push to GitHub:"
echo "1. Create a new repository on GitHub"
echo "2. Run the following commands:"
echo "   git remote add origin https://github.com/yourusername/imagefusion.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Replace 'yourusername' with your actual GitHub username" 
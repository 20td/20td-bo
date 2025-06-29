# 🚀 Manual Setup Instructions

Since the automated scripts failed, here's how to set up the chat application manually:

## Prerequisites
- Node.js (v16 or higher) - Download from https://nodejs.org/
- npm (comes with Node.js)

## Step 1: Set Up Backend Server

1. **Create a new folder for your project:**
   \`\`\`bash
   mkdir chat-app
   cd chat-app
   \`\`\`

2. **Create server folder and files:**
   \`\`\`bash
   mkdir server
   cd server
   \`\`\`

3. **Copy the server-package.json content and save it as package.json**

4. **Copy the server.js content and save it as server.js**

5. **Install backend dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

6. **Start the backend server:**
   \`\`\`bash
   npm start
   \`\`\`
   
   You should see:
   \`\`\`
   🚀 Server running on port 5000
   📡 Socket.IO server ready
   🌐 API available at: http://localhost:5000/api/sessions
   \`\`\`

## Step 2: Set Up Frontend (New Terminal)

1. **Go back to main project folder:**
   \`\`\`bash
   cd ..  # Go back to chat-app folder
   \`\`\`

2. **Copy the frontend-package.json content and save it as package.json**

3. **Create src folder and components:**
   \`\`\`bash
   mkdir src
   mkdir src/components
   mkdir src/context
   \`\`\`

4. **Copy all the React component files:**
   - Save App.tsx in src/
   - Save LoginPage.tsx in src/components/
   - Save Chat.tsx in src/components/
   - Save SocketContext.tsx in src/context/

5. **Create index.tsx in src/ folder:**
   \`\`\`tsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import './index.css';
   import App from './App';

   const root = ReactDOM.createRoot(
     document.getElementById('root') as HTMLElement
   );
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   \`\`\`

6. **Create index.css in src/ folder:**
   \`\`\`css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   body {
     margin: 0;
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
       'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
       sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
   }
   \`\`\`

7. **Create public/index.html:**
   \`\`\`html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <title>Chat App</title>
       <script src="https://cdn.tailwindcss.com"></script>
     </head>
     <body>
       <div id="root"></div>
     </body>
   </html>
   \`\`\`

8. **Install frontend dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

9. **Start the frontend:**
   \`\`\`bash
   npm start
   \`\`\`

## Step 3: Test the Application

1. **Backend should be running on:** http://localhost:5000
2. **Frontend should open automatically at:** http://localhost:3000

3. **Test with multiple browser tabs:**
   - Tab 1: Login as "Owner"
   - Tab 2: Login as "User" with any name
   - Start chatting!

## Troubleshooting

### Port Issues
\`\`\`bash
# If port 5000 is busy
npx kill-port 5000

# If port 3000 is busy  
npx kill-port 3000
\`\`\`

### Missing Dependencies
\`\`\`bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Socket Connection Issues
- Make sure backend is running first
- Check browser console for errors
- Verify the proxy setting in package.json

## Project Structure
\`\`\`
chat-app/
├── server/
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   └── Chat.tsx
│   ├── context/
│   │   └── SocketContext.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── public/
│   └── index.html
└── package.json
\`\`\`

That's it! Your chat application should now be running successfully.

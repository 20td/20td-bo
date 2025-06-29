# 🚀 Socket.IO Chat Application Setup Guide

A complete real-time chat application built with Express.js, Socket.IO, React, and Tailwind CSS.

## 📋 Prerequisites

- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- A code editor (VS Code recommended)

## 🛠 Manual Setup Instructions

### Step 1: Create Project Structure

\`\`\`bash
mkdir chat-app
cd chat-app
mkdir server
mkdir src
mkdir src/components
mkdir src/hooks
mkdir public
\`\`\`

### Step 2: Backend Setup

1. **Copy server files:**
   - Copy `server/server.js` content → `server/server.js`
   - Copy `server/package.json` content → `server/package.json`

2. **Install backend dependencies:**
   \`\`\`bash
   cd server
   npm install
   \`\`\`

3. **Start the backend:**
   \`\`\`bash
   npm start
   \`\`\`
   
   You should see:
   \`\`\`
   🚀 Chat server running on port 5000
   📡 Socket.IO server ready for connections
   \`\`\`

### Step 3: Frontend Setup (New Terminal)

1. **Go back to main folder:**
   \`\`\`bash
   cd ..  # Back to chat-app folder
   \`\`\`

2. **Copy frontend files:**
   - Copy `package.json` content → `package.json`
   - Copy all React component files to their respective folders:
     - `src/App.tsx`
     - `src/components/LoginPage.tsx`
     - `src/components/Chat.tsx`
     - `src/components/OwnerDashboard.tsx`
     - `src/components/UserChat.tsx`
     - `src/hooks/useSocket.tsx`

3. **Create additional required files:**

   **src/index.tsx:**
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

   **src/index.css:**
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

   **public/index.html:**
   \`\`\`html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <title>Socket.IO Chat App</title>
       <script src="https://cdn.tailwindcss.com"></script>
     </head>
     <body>
       <div id="root"></div>
     </body>
   </html>
   \`\`\`

4. **Install frontend dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

5. **Start the frontend:**
   \`\`\`bash
   npm start
   \`\`\`

## 🎯 Quick Start with Scripts

### Option 1: Use Node.js Scripts

**Terminal 1 (Backend):**
\`\`\`bash
node scripts/start-backend.js
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
node scripts/start-frontend.js
\`\`\`

### Option 2: Manual Commands

**Terminal 1 (Backend):**
\`\`\`bash
cd server
npm install
npm start
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
npm install
npm start
\`\`\`

## 🧪 Testing the Application

1. **Backend runs on:** `http://localhost:5000`
2. **Frontend opens at:** `http://localhost:3000`

3. **Test with multiple browser tabs:**
   - **Tab 1:** Login as "Owner" with any name
   - **Tab 2:** Login as "User" with any name
   - Start chatting and see real-time updates!

## 🎮 Features

### ✅ Implemented Features
- **Real-time messaging** with Socket.IO
- **Session-based chat rooms** with unique IDs
- **Owner dashboard** with multi-chat management
- **Unread message badges** and notifications
- **Typing indicators** for better UX
- **Sound notifications** for new messages
- **Role-based message styling** (Owner vs User)
- **Connection status indicators**
- **Online user tracking**
- **Message read receipts**
- **Search and filter sessions**
- **Responsive design** with Tailwind CSS

### 🔧 Socket.IO Events Used

**Client → Server:**
- `join-session` - Join a chat session
- `send-message` - Send a message
- `typing-start` / `typing-stop` - Typing indicators
- `mark-messages-read` - Mark messages as read
- `owner-join-all-sessions` - Owner joins all sessions
- `get-sessions` - Get session list

**Server → Client:**
- `message-history` - Load previous messages
- `new-message` - Receive new message
- `session-updated` - Session status update
- `user-typing` - Someone is typing
- `users-online` - Online users in session
- `new-message-notification` - Sound notification
- `all-sessions` - All sessions data
- `sessions-list` - Session list

## 🐛 Troubleshooting

### Port Issues
\`\`\`bash
# Kill processes on ports
npx kill-port 5000  # Backend
npx kill-port 3000  # Frontend
\`\`\`

### Dependencies Issues
\`\`\`bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Socket Connection Issues
- Ensure backend is running first on port 5000
- Check browser console for connection errors
- Verify CORS settings in server.js
- Make sure proxy is set in frontend package.json

### Common Errors
1. **"Cannot connect to server"** - Start backend first
2. **"Module not found"** - Run `npm install` in both folders
3. **"Port already in use"** - Use `npx kill-port <port>` to free ports

## 📁 Final Project Structure

\`\`\`
chat-app/
├── server/
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   ├── Chat.tsx
│   │   ├── OwnerDashboard.tsx
│   │   └── UserChat.tsx
│   ├── hooks/
│   │   └── useSocket.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── public/
│   └── index.html
├── scripts/
│   ├── start-backend.js
│   └── start-frontend.js
└── package.json
\`\`\`

## 🚀 Next Steps

- Add database persistence (MongoDB/PostgreSQL)
- Implement user authentication
- Add file upload support
- Deploy to production (Heroku, Vercel, AWS)
- Add message encryption
- Implement push notifications

---

**🎉 Congratulations!** Your Socket.IO chat application is now ready to use!

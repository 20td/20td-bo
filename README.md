# 💬 Real-Time Chat Application

A full-stack chat application built with Express.js, Socket.IO, React, and Tailwind CSS featuring session-based chat rooms and an owner dashboard.

## 🚀 Features

- **Session-Based Chat Rooms**: Each user gets a unique session ID
- **Owner Dashboard**: Multi-chat view with unread message badges
- **Real-Time Messaging**: Powered by Socket.IO
- **Role-Based UI**: Different styling for owners vs users
- **Typing Indicators**: See when someone is typing
- **Sound Notifications**: Audio alerts for new messages
- **Responsive Design**: Works on desktop and mobile

## 🛠 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Option 1: Automated Setup (Recommended)

Run the Python setup script:
\`\`\`bash
python scripts/setup_chat_app.py
\`\`\`

### Option 2: Manual Setup

#### Backend Setup
\`\`\`bash
# Install and start backend
node scripts/setup-and-run.js
\`\`\`

#### Frontend Setup (in a new terminal)
\`\`\`bash
# Install and start frontend
node scripts/install-frontend-deps.js
\`\`\`

### Option 3: Step by Step

#### 1. Backend Server
\`\`\`bash
cd server
npm install
npm start
\`\`\`
Server runs on http://localhost:5000

#### 2. Frontend App
\`\`\`bash
npm install
npm start
\`\`\`
App opens at http://localhost:3000

## 🎮 How to Use

### As a User:
1. Enter your name and select "User" role
2. Start chatting - you'll get a unique session ID
3. Messages appear in real-time

### As an Owner:
1. Enter your name and select "Owner" role
2. View dashboard with all active sessions
3. Click any session to join and chat
4. Get notifications for new messages

## 🧪 Testing

1. Open http://localhost:3000 in two browser tabs
2. In tab 1: Login as "Owner"
3. In tab 2: Login as "User" with any name
4. Start chatting and see real-time updates!

## 📁 Project Structure

\`\`\`
chat-app/
├── server/
│   ├── package.json
│   └── server.js          # Express + Socket.IO backend
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx   # Login interface
│   │   ├── OwnerDashboard.tsx # Owner multi-chat view
│   │   ├── UserChat.tsx    # User chat interface
│   │   └── Chat.tsx        # Shared chat component
│   ├── context/
│   │   └── SocketContext.tsx # Socket.IO context
│   └── App.tsx             # Main app component
├── scripts/                # Setup and run scripts
└── package.json           # Frontend dependencies
\`\`\`

## 🔧 API Endpoints

- `GET /api/sessions` - Get all chat sessions
- `GET /api/sessions/:id/messages` - Get messages for a session

## 🎯 Socket.IO Events

### Client → Server
- `join-session` - Join a chat session
- `send-message` - Send a message
- `typing` - Typing indicator
- `mark-as-read` - Mark messages as read

### Server → Client
- `message-history` - Load previous messages
- `new-message` - Receive new message
- `session-updated` - Session status update
- `user-typing` - Someone is typing
- `new-message-notification` - Sound notification

## 🚀 Next Steps

- [ ] Add database persistence (MongoDB/PostgreSQL)
- [ ] Implement user authentication
- [ ] Add file upload support
- [ ] Push notifications
- [ ] Message encryption
- [ ] Chat history export

## 🐛 Troubleshooting

### Port Already in Use
\`\`\`bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
\`\`\`

### Dependencies Issues
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Socket Connection Issues
- Make sure backend is running on port 5000
- Check browser console for connection errors
- Verify CORS settings in server.js

## 📝 License

MIT License - feel free to use this project for learning and development!

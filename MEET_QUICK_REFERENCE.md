# Meet Feature - Quick Reference Card

## 🚀 Quick Start

### Start Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Open http://localhost:5173
```

## 📍 Navigation

### Freelancer
- Sidebar → Meet → Schedule/View meetings

### Client
- Sidebar → Meet → Schedule/View meetings

### Video Room
- Click "Start" or "Join Now" → `/meet/{meetingId}`

## 📋 Features at a Glance

| Feature | Freelancer | Client | Status |
|---------|-----------|--------|--------|
| Schedule Meeting | ✅ | ✅ | Ready |
| View Meetings | ✅ | ✅ | Ready |
| Copy Link | ✅ | ✅ | Ready |
| Join Meeting | ✅ | ✅ | Ready |
| Cancel Meeting | ✅ | ✅ | Ready |
| Video Room | ✅ | ✅ | Placeholder |
| Notifications | ❌ | ❌ | TODO |
| Recordings | ❌ | ❌ | TODO |

## 🔌 API Endpoints

### Freelancer Meetings
```
GET    /api/freelancer/meetings
POST   /api/freelancer/meetings
GET    /api/freelancer/meetings/:id
PATCH  /api/freelancer/meetings/:id/status
POST   /api/freelancer/meetings/:id/participants
POST   /api/freelancer/meetings/:id/cancel
```

### Client Meetings
```
GET    /api/client/meetings
POST   /api/client/meetings
GET    /api/client/meetings/:id
PATCH  /api/client/meetings/:id/status
POST   /api/client/meetings/:id/participants
POST   /api/client/meetings/:id/cancel
```

## 📝 Create Meeting Request

```json
POST /api/freelancer/meetings
{
  "title": "Project Review",
  "description": "Discuss project progress",
  "scheduledTime": "2024-04-25T14:00:00Z",
  "duration": 30,
  "participants": [],
  "projectId": "optional-project-id"
}
```

## 📊 Meeting Status

| Status | Badge | Button | Description |
|--------|-------|--------|-------------|
| Upcoming | Purple | Copy Link + Start | Future meeting |
| Live | Red | Join Now | Meeting in progress |
| Completed | Gray | Disabled | Past meeting |
| Cancelled | Gray | Disabled | Cancelled meeting |

## 🎯 Key Files

### Frontend
- `frontend/src/pages/freelancer/FreelancerMeet.jsx` - Freelancer page
- `frontend/src/pages/client/ClientMeet.jsx` - Client page
- `frontend/src/pages/MeetRoom.jsx` - Video room placeholder
- `frontend/src/App.jsx` - Routes

### Backend
- `backend/models/Meeting.js` - Database model
- `backend/controllers/meeting.controller.js` - API logic
- `backend/routes/freelancer.routes.js` - Freelancer endpoints
- `backend/routes/client.routes.js` - Client endpoints

## 🧪 Testing

### Quick Test
1. Login as freelancer
2. Go to Meet
3. Click "Schedule Meeting"
4. Fill form and submit
5. Verify meeting appears
6. Click "Copy Link" - should show "Copied"
7. Click "Start" - should go to meet room

### API Test (Postman)
```
GET http://localhost:5000/api/freelancer/meetings
Authorization: Bearer <token>
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Meetings not loading | Check backend running, verify token |
| Schedule button disabled | Fill all required fields |
| Copy link not working | Check browser console, try different browser |
| Mobile layout broken | Clear cache, check responsive breakpoints |
| API 404 error | Verify backend routes imported in app.js |

## 📚 Documentation

- **MEET_FEATURE_IMPLEMENTATION.md** - Full technical details
- **MEET_TESTING_GUIDE.md** - Testing procedures
- **TASK_11_COMPLETION_SUMMARY.md** - Completion summary
- **MEET_QUICK_REFERENCE.md** - This file

## 🔄 Next Steps

### Immediate
- [ ] Test all features locally
- [ ] Verify API endpoints work
- [ ] Test mobile layout

### Short-term
- [ ] Integrate Jitsi Meet or Agora
- [ ] Add email notifications
- [ ] Add meeting reminders

### Long-term
- [ ] Add recordings
- [ ] Add chat
- [ ] Add screen sharing

## 💡 Tips

1. **Meeting Links**: Automatically generated with timestamp + random string
2. **Status**: Automatically determined based on scheduledTime and duration
3. **Participants**: Can be added after meeting creation
4. **Authorization**: All endpoints require authentication
5. **Mobile**: Fully responsive with 44px+ touch targets

## 🎨 UI Components Used

- Framer Motion - Animations
- Lucide React - Icons
- Tailwind CSS - Styling
- CSS Variables - Theme support

## 📱 Responsive Breakpoints

- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (2 columns)

## 🔐 Security

- All endpoints require authentication
- Role-based access control (freelancer/client)
- Authorization checks on meeting access
- CORS configured for frontend domain

## 📞 Support

1. Check documentation files
2. Review browser console for errors
3. Check network tab in DevTools
4. Verify backend logs
5. Check MongoDB for data

---

**Last Updated**: April 18, 2026
**Status**: ✅ Complete and Ready for Testing

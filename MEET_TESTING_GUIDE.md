# Meet Feature Testing Guide

## Quick Start

### 1. Start the Backend
```bash
cd backend
npm run dev
```
Expected output: `OTP Service: Supabase Email OTP enabled`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Application
- Open `http://localhost:5173`
- Login with your credentials (or create new account)

## Testing Scenarios

### Scenario 1: Freelancer Scheduling a Meeting

1. **Login as Freelancer**
   - Navigate to `/freelancer/dashboard`
   - Verify you see the sidebar with "Meet" option

2. **Navigate to Meet**
   - Click "Meet" in the sidebar
   - Should see "No meetings scheduled" empty state
   - Click "Schedule Meeting" button

3. **Schedule Meeting**
   - Fill in form:
     - Title: "Project Review Call"
     - Description: "Discuss project requirements"
     - Date & Time: Select future date/time
     - Duration: Select 30 minutes
   - Click "Schedule"
   - Should see meeting appear in list

4. **Verify Meeting Display**
   - Meeting should show:
     - Title and description
     - Date and time
     - Duration
     - "UPCOMING" badge
     - "Copy Link" and "Start" buttons

5. **Test Copy Link**
   - Click "Copy Link"
   - Button should change to "Copied" for 2 seconds
   - Link format: `http://localhost:5173/meet/{meetingId}`

6. **Test Start Meeting**
   - Click "Start" button
   - Should navigate to `/meet/{meetingId}`
   - Should see MeetRoom placeholder with controls

### Scenario 2: Client Scheduling a Meeting

1. **Login as Client**
   - Navigate to `/client/dashboard`
   - Verify "Meet" in sidebar

2. **Schedule Meeting**
   - Click "Meet" → "Schedule Meeting"
   - Fill form with meeting details
   - Click "Schedule"

3. **Verify Meeting List**
   - Meeting should appear with status badge
   - Should show all meeting details

### Scenario 3: Meeting Status Transitions

1. **Schedule Meeting for Current Time**
   - Create meeting with scheduledTime = now
   - Meeting should show "LIVE" badge (red with pulsing dot)
   - Button should show "Join Now" instead of "Start"

2. **Schedule Meeting for Past Time**
   - Create meeting with scheduledTime = past
   - Meeting should show "Completed" state
   - Button should be disabled

3. **Schedule Meeting for Future**
   - Create meeting with scheduledTime = future
   - Meeting should show "UPCOMING" badge
   - Should have "Copy Link" and "Start" buttons

### Scenario 4: Mobile Responsiveness

1. **Test on Mobile Viewport**
   - Resize browser to mobile size (375px width)
   - Verify:
     - Hamburger menu appears
     - Meeting cards stack vertically
     - Buttons are at least 44px tall
     - Text is readable

2. **Test Sidebar on Mobile**
   - Click hamburger menu
   - Sidebar should slide in
   - Click "Meet" link
   - Sidebar should close
   - Meet page should display

### Scenario 5: API Testing with Postman

#### Get Freelancer Meetings
```
GET http://localhost:5000/api/freelancer/meetings
Authorization: Bearer <your_token>
```
Expected: 200 OK with array of meetings

#### Create Freelancer Meeting
```
POST http://localhost:5000/api/freelancer/meetings
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Test Meeting",
  "description": "Testing the API",
  "scheduledTime": "2024-04-25T15:00:00Z",
  "duration": 30,
  "participants": []
}
```
Expected: 201 Created with meeting object

#### Get Meeting Details
```
GET http://localhost:5000/api/freelancer/meetings/{meetingId}
Authorization: Bearer <your_token>
```
Expected: 200 OK with meeting details

#### Update Meeting Status
```
PATCH http://localhost:5000/api/freelancer/meetings/{meetingId}/status
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "status": "live"
}
```
Expected: 200 OK with updated meeting

#### Cancel Meeting
```
POST http://localhost:5000/api/freelancer/meetings/{meetingId}/cancel
Authorization: Bearer <your_token>
```
Expected: 200 OK with cancelled meeting

## Expected Behavior

### Frontend
- ✅ Meet pages load without errors
- ✅ Schedule meeting modal opens/closes
- ✅ Form validation works
- ✅ Meetings display in grid
- ✅ Status badges show correctly
- ✅ Copy link functionality works
- ✅ Navigation to meet room works
- ✅ Mobile responsive layout works

### Backend
- ✅ Meetings are created in database
- ✅ Meetings are retrieved correctly
- ✅ Status updates work
- ✅ Participants can be added
- ✅ Meetings can be cancelled
- ✅ Authorization checks work
- ✅ Error handling works

### Database
- ✅ Meeting documents created in MongoDB
- ✅ Timestamps are set correctly
- ✅ References to users are populated
- ✅ Meeting links are unique

## Common Issues & Solutions

### Issue: "Meetings not loading"
**Solution**: 
- Check backend is running
- Verify API endpoint in browser DevTools Network tab
- Check authentication token is valid
- Check MongoDB connection

### Issue: "Schedule button doesn't work"
**Solution**:
- Verify all form fields are filled
- Check browser console for errors
- Verify backend is responding
- Check network tab for failed requests

### Issue: "Meeting doesn't appear after scheduling"
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify backend response in Network tab
- Check MongoDB for meeting document

### Issue: "Copy link not working"
**Solution**:
- Check browser console for errors
- Verify clipboard API is available
- Try in different browser
- Check if HTTPS is required

### Issue: "Mobile layout broken"
**Solution**:
- Clear browser cache
- Check responsive breakpoints in DevTools
- Verify Tailwind CSS is loaded
- Check for CSS conflicts

## Performance Testing

### Load Testing
1. Create 50+ meetings
2. Verify page loads in < 2 seconds
3. Check for memory leaks in DevTools

### Network Testing
1. Throttle network to 3G
2. Verify page still loads
3. Check for timeout issues

## Accessibility Testing

1. **Keyboard Navigation**
   - Tab through all buttons
   - Enter to activate buttons
   - Escape to close modals

2. **Screen Reader**
   - Test with NVDA or JAWS
   - Verify all text is readable
   - Check button labels

3. **Color Contrast**
   - Verify text meets WCAG AA standards
   - Check status badges are distinguishable

## Deployment Testing

### Before Deploying to Production

1. **Build Frontend**
   ```bash
   npm run build
   ```
   Should complete without errors

2. **Test Production Build**
   ```bash
   npm run preview
   ```
   Should load and function correctly

3. **Environment Variables**
   - Verify `FRONTEND_URL` is set in backend
   - Verify `VITE_API_URL` is set in frontend
   - Verify MongoDB connection string is correct

4. **API Endpoints**
   - Test all endpoints with production URLs
   - Verify CORS is configured correctly
   - Check authentication works

## Sign-Off Checklist

- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Can schedule meeting as freelancer
- [ ] Can schedule meeting as client
- [ ] Meeting appears in list
- [ ] Can copy meeting link
- [ ] Can start/join meeting
- [ ] Mobile layout works
- [ ] API endpoints respond correctly
- [ ] Database stores meetings correctly
- [ ] Status transitions work
- [ ] Authorization checks work
- [ ] Error handling works
- [ ] No console errors
- [ ] No network errors

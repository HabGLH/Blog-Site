# BlogApp Frontend - Testing Guide

## 🚀 Quick Start Testing

### 1. **Start the Application**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### 2. **Test API Connection**
- Navigate to `/test` or click "Test API" in the navbar
- This page provides a comprehensive API testing interface
- Test all endpoints: Login, Register, Get Posts, Create Post

### 3. **Test Authentication Flow**
1. **Register**: Create a new account
2. **Login**: Test login functionality
3. **Dashboard**: Access protected dashboard
4. **Logout**: Test logout functionality

### 4. **Test Post Management**
1. **Create Post**: Add new posts with title, content, and tags
2. **Edit Post**: Modify existing posts
3. **Delete Post**: Remove posts with confirmation
4. **View Posts**: Browse posts on home page and detail pages

## 🔧 **API Endpoints Expected**

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout (optional)

### Posts
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post (requires auth)
- `PUT /posts/:id` - Update post (requires auth)
- `DELETE /posts/:id` - Delete post (requires auth)

## 🐛 **Common Issues & Solutions**

### 1. **CORS Issues**
- Ensure backend has CORS enabled for `http://localhost:5173`
- Check browser console for CORS errors

### 2. **Authentication Issues**
- Verify JWT token format in browser localStorage
- Check if token is being sent in Authorization header
- Ensure backend validates Bearer tokens correctly

### 3. **API Connection Issues**
- Verify backend is running on `http://localhost:5000`
- Check API base URL in environment variables
- Use the Test API page to diagnose connection issues

### 4. **Post Management Issues**
- Ensure user is authenticated before creating/editing posts
- Check if posts are filtered correctly for user ownership
- Verify post data structure matches backend expectations

## 📋 **Testing Checklist**

### ✅ **Authentication**
- [ ] User registration works
- [ ] User login works
- [ ] JWT token is stored correctly
- [ ] User data persists on page refresh
- [ ] Logout clears all data
- [ ] Protected routes redirect to login

### ✅ **Post Management**
- [ ] Create new posts
- [ ] Edit existing posts
- [ ] Delete posts with confirmation
- [ ] View post details
- [ ] Search and filter posts
- [ ] Tags functionality works

### ✅ **UI/UX**
- [ ] Responsive design works
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Form validation works
- [ ] Navigation is smooth

### ✅ **API Integration**
- [ ] All API calls work correctly
- [ ] Error handling is proper
- [ ] Loading states are shown
- [ ] Data is displayed correctly
- [ ] Authentication headers are sent

## 🔍 **Debugging Tools**

### 1. **Browser DevTools**
- Check Network tab for API calls
- Monitor Console for errors
- Inspect localStorage for auth data

### 2. **Test API Page**
- Navigate to `/test` for comprehensive API testing
- Test individual endpoints
- View detailed error messages

### 3. **Console Logging**
- All API calls include console.error for debugging
- Authentication state changes are logged
- Form validation errors are logged

## 📝 **Expected Data Structures**

### User Object
```javascript
{
  _id: "user_id",
  username: "username",
  email: "user@example.com"
}
```

### Post Object
```javascript
{
  _id: "post_id",
  title: "Post Title",
  content: "Post content...",
  tags: ["tag1", "tag2"],
  author: {
    _id: "user_id",
    username: "username"
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🎯 **Performance Testing**

### 1. **Load Testing**
- Test with multiple posts
- Test search functionality with large datasets
- Test pagination if implemented

### 2. **Error Handling**
- Test with invalid credentials
- Test with network failures
- Test with malformed data

### 3. **Security Testing**
- Verify JWT tokens are handled securely
- Test protected routes
- Verify user data isolation

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Use the Test API page to diagnose API issues
3. Verify backend is running and accessible
4. Check environment variables
5. Review the API endpoint documentation

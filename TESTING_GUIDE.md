# Swafri Blockchain Real Estate - Testing Guide

## Prerequisites
- Backend API running
- Frontend running
- Database connection configured
- MapTiler API key configured (for map testing)

## 1. User Authentication & Roles Testing

### 1.1 Create Test Users

Create users with different roles to test all features:

**Super Admin (for initial setup):**
```bash
# Via API or direct database insertion
{
  "email": "superadmin@swafri.com",
  "password": "Admin123!",
  "role": "SUPER_ADMIN",
  "status": "ACTIVE"
}
```

**Admin:**
```json
{
  "email": "admin@swafri.com",
  "password": "Admin123!",
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

**Property Owner:**
```json
{
  "email": "owner@swafri.com",
  "password": "Owner123!",
  "role": "PROPERTY_OWNER",
  "status": "ACTIVE",
  "kycStatus": "verified"
}
```

**Tenant:**
```json
{
  "email": "tenant@swafri.com",
  "password": "Tenant123!",
  "role": "TENANT",
  "status": "ACTIVE"
}
```

### 1.2 Test Authentication Flow

**Test Registration:**
1. Navigate to `/register`
2. Fill in email, password, confirm password
3. Submit form
4. Verify user is created with PENDING status
5. Check email for verification (if implemented)

**Test Login:**
1. Navigate to `/login`
2. Enter credentials
3. Verify successful login redirects to dashboard
4. Verify session persistence
5. Test logout functionality

**Test Role-Based Access:**
1. Login as TENANT - should see Marketplace, Saved, Favorites
2. Login as PROPERTY_OWNER - should see My Listings, Create Listing
3. Login as ADMIN - should see Listing Review Queue
4. Login as SUPER_ADMIN - should see all admin features

## 2. Listing CRUD Operations Testing

### 2.1 Create Listing (Property Owner)

**Steps:**
1. Login as PROPERTY_OWNER
2. Navigate to `/properties/create`
3. Fill in listing details:
   - Title: "Modern Apartment in Addis Ababa"
   - Listing Type: rent or sale
   - Property Type: apartment
   - Category: residential
   - Price: 50000 (for sale) or Monthly Rent: 1500 (for rent)
   - Bedrooms: 2
   - Bathrooms: 2
   - Area: 120 sqm
   - Address:
     - Street: "Bole Road"
     - City: "Addis Ababa"
     - Country: "Ethiopia"
     - Postal Code: "1000"
   - Location: Click on map or enter coordinates
   - Amenities: Select relevant amenities
4. Submit form
5. Verify listing created as DRAFT status

**Expected Results:**
- Listing appears in "My Listings"
- Status shows as "draft"
- Can edit the listing
- Can delete the listing

### 2.2 Upload Photos

**Steps:**
1. Navigate to listing detail page
2. Click "Upload Photos"
3. Select 3-5 images (JPG/PNG, max 5MB each)
4. Verify photos upload successfully
5. Drag and drop to reorder photos
6. Click star icon to set cover photo
7. Delete a photo

**Expected Results:**
- Photos display in grid
- Cover photo highlighted
- Reordering persists
- Delete removes photo

### 2.3 Upload Ownership Documents

**Steps:**
1. Navigate to listing detail page
2. In Ownership Documents section
3. Select document type: "Title Deed"
4. Upload PDF or image
5. Submit
6. Repeat for other document types

**Expected Results:**
- Documents appear in list
- Status shows as "pending"
- Can view documents
- Verification status updates

### 2.4 Submit for Review

**Steps:**
1. Ensure KYC is verified
2. Ensure at least one photo uploaded
3. Ensure title deed uploaded
4. Click "Submit for Review" button
5. Verify status changes to "submitted"

**Expected Results:**
- Status changes to "submitted"
- Cannot edit listing while in review
- Listing appears in admin review queue

### 2.5 Edit Listing

**Steps:**
1. Navigate to listing detail page
2. Click "Edit" button (only available for draft/rejected)
3. Modify listing details
4. Save changes
5. Verify updates persist

**Expected Results:**
- Changes saved successfully
- Listing updated in database
- UI reflects changes

### 2.6 Delete Listing

**Steps:**
1. Navigate to listing detail page
2. Click "Delete" button (only available for draft/rejected)
3. Confirm deletion
4. Verify listing removed from "My Listings"

**Expected Results:**
- Listing deleted from database
- No longer accessible
- Associated photos/documents cleaned up

## 3. Document Review Workflow Testing

### 3.1 Admin Review Documents

**Steps:**
1. Login as ADMIN or SUPER_ADMIN
2. Navigate to listing detail page
3. In Ownership Documents section
4. Click "Review" button on pending document
5. Select "Approve" or "Reject"
6. Add optional note
7. Submit review

**Expected Results:**
- Document status updates
- Review note saved
- Verification status updates based on all documents
- Notification sent to owner

### 3.2 Test Duplicate Detection

**Steps:**
1. Create two similar listings with same owner
2. Or create listings within 50m with similar titles
3. Login as ADMIN
4. Navigate to listing detail page
5. Check for duplicate detection banner

**Expected Results:**
- Banner shows potential duplicates
- Lists duplicate titles and status
- Shows reasons (same_owner, nearby_similar)

## 4. Map Search Functionality Testing

### 4.1 Configure MapTiler

**Steps:**
1. Get API key from https://cloud.maptiler.com/
2. Update `components/map/PropertyMap.tsx`
3. Replace `YOUR_MAPTILER_KEY` with actual key
4. Restart frontend

### 4.2 Test Viewport Search

**Steps:**
1. Login as TENANT
2. Navigate to `/properties`
3. Click "Map" button
4. Select "Viewport" mode
5. Pan/zoom map to desired area
6. Verify listings update based on viewport

**Expected Results:**
- Map displays with tiles
- Listings appear as markers
- Markers show on hover
- Click marker to see popup
- Filter updates on map movement

### 4.3 Test Radius Search

**Steps:**
1. In map panel, select "Radius" mode
2. Set radius (e.g., 5000 meters)
3. Click on map to set center point
4. Verify circle appears
5. Verify listings within radius shown

**Expected Results:**
- Circle displays on map
- Listings inside circle filtered
- Radius can be adjusted
- Center point can be moved

### 4.4 Test Polygon Search

**Steps:**
1. In map panel, select "Polygon" mode
2. Click pencil icon to start drawing
3. Click on map to add points (minimum 3)
4. Right-click to finish polygon
5. Verify polygon closes
6. Verify listings inside polygon filtered

**Expected Results:**
- Points appear as markers
- Lines connect points
- Polygon closes on right-click
- Area fills with color
- Listings inside polygon filtered
- Can clear polygon with trash icon

### 4.5 Test Map + List Integration

**Steps:**
1. Enable map view
2. Apply text search
3. Apply attribute filters (price, bedrooms, etc.)
4. Verify both map and list update
5. Click listing in list to see on map
6. Click marker on map to navigate to listing

**Expected Results:**
- Map and list stay in sync
- Combined filters work correctly
- Navigation between views works

## 5. Inquiries Testing

### 5.1 Send Inquiry (Tenant)

**Steps:**
1. Login as TENANT
2. Navigate to published listing
3. Click "Ask a question" button
4. Select inquiry type (rent/buy/general)
5. Write message
6. Submit inquiry

**Expected Results:**
- Inquiry sent successfully
- Confirmation message shown
- Inquiry appears in "My Inquiries"

### 5.2 View Received Inquiries (Owner)

**Steps:**
1. Login as PROPERTY_OWNER
2. Navigate to listing with inquiries
3. View inquiry details
4. Respond to inquiry

**Expected Results:**
- Inquiries displayed
- Can respond with message
- Status updates
- Notification sent to tenant

### 5.3 Admin View All Inquiries

**Steps:**
1. Login as ADMIN
2. Navigate to inquiries section
3. View all inquiries across platform
4. Filter by status, type, etc.

**Expected Results:**
- All inquiries visible
- Filters work correctly
- Can take action if needed

## 6. Offers Testing

### 6.1 Submit Offer (Tenant/Buyer)

**Steps:**
1. Login as TENANT
2. Navigate to published listing for sale
3. Click "Make Offer" button
4. Enter offer amount
5. Add message
6. Submit offer

**Expected Results:**
- Offer submitted successfully
- Offer appears in "My Offers"
- Owner receives notification

### 6.2 Respond to Offer (Owner)

**Steps:**
1. Login as PROPERTY_OWNER
2. Navigate to listing with offers
3. View offer details
4. Accept, reject, or counter
5. Add response message

**Expected Results:**
- Offer status updates
- Buyer receives notification
- Transaction moves forward if accepted

### 6.3 Cancel Offer

**Steps:**
1. Login as offer creator
2. Navigate to "My Offers"
3. Click cancel on pending offer
4. Confirm cancellation

**Expected Results:**
- Offer cancelled
- Status updated
- Other party notified

## 7. Rental Applications Testing

### 7.1 Submit Rental Application (Tenant)

**Steps:**
1. Login as TENANT
2. Navigate to published rental listing
3. Click "Apply to Rent" button
4. Fill in application details:
   - Personal information
   - Income details
   - References
   - Move-in date
5. Submit application

**Expected Results:**
- Application submitted
- Status: "pending"
- Appears in "My Applications"

### 7.2 Review Application (Owner)

**Steps:**
1. Login as PROPERTY_OWNER
2. Navigate to listing with applications
3. View application details
4. Update screening status
5. Schedule viewing appointment
6. Accept or reject application

**Expected Results:**
- Application status updates
- Tenant receives notifications
- Can proceed to lease creation

### 7.3 Create Lease from Application

**Steps:**
1. After accepting application
2. Click "Create Lease"
3. Fill in lease terms:
   - Start date
   - End date
   - Rent amount
   - Security deposit
4. Submit lease

**Expected Results:**
- Lease created
- Application status: "approved"
- Lease appears in leases section

### 7.4 Withdraw Application

**Steps:**
1. Login as TENANT
2. Navigate to "My Applications"
3. Click withdraw on pending application
4. Confirm withdrawal

**Expected Results:**
- Application withdrawn
- Status updated
- Owner notified

## 8. Admin Features Testing

### 8.1 Admin Dashboard Stats

**Steps:**
1. Login as ADMIN
2. Navigate to `/properties`
3. View stats cards at top

**Expected Results:**
- Total Listings count
- Pending Review count
- Published count
- Verified count
- Stats update in real-time

### 8.2 Listing Review Queue

**Steps:**
1. Login as ADMIN
2. Navigate to `/properties`
3. View status tabs (submitted, under_review, etc.)
4. Click on a listing
5. Review listing details
6. Take action (approve, reject, request info)

**Expected Results:**
- Listings grouped by status
- Can filter by status
- Actions work correctly
- Status transitions properly
- Owner receives notifications

### 8.3 User Management

**Steps:**
1. Login as SUPER_ADMIN
2. Navigate to admin users section
3. View all users
4. Filter by role, status
5. Suspend/activate user
6. Block user if needed

**Expected Results:**
- All users listed
- Filters work
- Status changes persist
- User cannot login when suspended/blocked

## 9. On-Chain Title Verification Testing

### 9.1 Mint Title

**Steps:**
1. Login as PROPERTY_OWNER
2. Navigate to verified listing
3. Click "Mint Title" button
4. Confirm minting
5. Wait for blockchain transaction

**Expected Results:**
- Title minted on-chain
- Title info displays
- Transaction hash shown
- Status updates to "on_chain_verified"

### 9.2 Dispute Title

**Steps:**
1. Login as PROPERTY_OWNER or ADMIN
2. Navigate to on-chain verified listing
3. Click "Dispute Title" button
4. Enter reason
5. Submit dispute

**Expected Results:**
- Title disputed
- Listing suspended
- Dispute reason saved
- Admin notified

### 9.3 Clear Dispute

**Steps:**
1. Login as ADMIN
2. Navigate to disputed listing
3. Click "Clear Dispute" button
4. Enter resolution reason
5. Submit

**Expected Results:**
- Dispute cleared
- Listing restored
- Status updated

### 9.4 Revoke Title

**Steps:**
1. Login as ADMIN
2. Navigate to on-chain verified listing
3. Click "Revoke Title" button
4. Enter reason
5. Submit

**Expected Results:**
- Title revoked
- Listing archived
- Status updated
- Owner notified

## 10. Listing Analytics Testing

### 10.1 View Analytics (Owner)

**Steps:**
1. Login as PROPERTY_OWNER
2. Navigate to listing detail page
3. Scroll to Analytics section
4. View metrics:
   - Views
   - Favorites
   - Inquiries
   - Offers
   - Rental Applications

**Expected Results:**
- All metrics display
- Numbers are accurate
- Updates in real-time

### 10.2 Admin Dashboard Stats

**Steps:**
1. Login as ADMIN
2. Navigate to admin dashboard
3. View platform-wide statistics

**Expected Results:**
- Platform-wide metrics visible
- Breakdown by status
- Verification statistics

## 11. Saved Searches & Favorites Testing

### 11.1 Save Search

**Steps:**
1. Login as TENANT
2. Perform search with filters
3. Click "Save search" button
4. Enter search name
5. Enable/disable alerts
6. Save

**Expected Results:**
- Search saved
- Appears in "Saved Searches"
- Can be re-applied
- Can be deleted

### 11.2 Add to Favorites

**Steps:**
1. Login as TENANT
2. Navigate to listing
3. Click heart icon
4. Verify favorite added

**Expected Results:**
- Listing favorited
- Heart icon filled
- Appears in "Saved Properties"
- Can be removed

## 12. Notifications Testing

### 12.1 View Notifications

**Steps:**
1. Login as any user
2. Click notification bell icon
3. View notification dropdown
4. Click notification to navigate

**Expected Results:**
- Notifications displayed
- Unread count shown
- Click marks as read
- Navigation works correctly

### 12.2 Mark All Read

**Steps:**
1. In notification dropdown
2. Click "Mark all as read"
3. Verify all cleared

**Expected Results:**
- All notifications marked read
- Count resets to 0

## 13. Edge Cases & Error Handling

### 13.1 Test Validation Errors

**Steps:**
1. Try to create listing without required fields
2. Try to upload invalid file types
3. Try to upload files > 5MB
4. Try to submit without KYC verification

**Expected Results:**
- Appropriate error messages
- Form validation works
- User guided to fix issues

### 13.2 Test Permission Errors

**Steps:**
1. Login as TENANT
2. Try to access admin routes
3. Try to edit others' listings
4. Try to delete without permission

**Expected Results:**
- Access denied
- Redirected appropriately
- Error messages clear

### 13.3 Test Network Errors

**Steps:**
1. Disconnect network
2. Try to perform actions
3. Reconnect
4. Retry

**Expected Results:**
- Graceful error handling
- Clear error messages
- Retry functionality

## 14. Performance Testing

### 14.1 Test with Large Datasets

**Steps:**
1. Create 100+ listings
2. Test search performance
3. Test map performance with many markers
4. Test pagination

**Expected Results:**
- Fast load times
- Smooth interactions
- Pagination works efficiently

### 14.2 Test Concurrent Users

**Steps:**
1. Login multiple users simultaneously
2. Perform concurrent actions
3. Verify data integrity

**Expected Results:**
- No race conditions
- Data remains consistent
- No conflicts

## 15. Security Testing

### 15.1 Test Authentication Security

**Steps:**
1. Try to access protected routes without login
2. Try to access others' data
3. Try to modify others' listings
4. Test session expiration

**Expected Results:**
- Proper authentication required
- Authorization enforced
- Sessions expire correctly

### 15.2 Test Input Validation

**Steps:**
1. Try SQL injection in search
2. Try XSS in listing fields
3. Try malicious file uploads
4. Test rate limiting

**Expected Results:**
- Inputs sanitized
- Malicious content blocked
- Rate limiting enforced

## Test Data Cleanup

After testing, clean up test data:

```sql
-- Delete test listings
DELETE FROM listings WHERE created_by IN (
  SELECT id FROM users WHERE email LIKE '%@swafri.com'
);

-- Delete test users (except super admin)
DELETE FROM users WHERE email LIKE '%@swafri.com' 
AND email != 'superadmin@swafri.com';
```

## Common Issues & Solutions

**Map not displaying:**
- Verify MapTiler API key is set
- Check browser console for errors
- Ensure network connectivity

**Documents not uploading:**
- Check file size (< 5MB)
- Verify file type (PDF, JPG, PNG)
- Check API endpoint configuration

**Status not updating:**
- Verify KYC is verified
- Check required fields are filled
- Ensure documents are uploaded

**Notifications not appearing:**
- Check notification service is running
- Verify user notification settings
- Check database for notification records

## Next Steps

1. Run through this testing guide systematically
2. Document any bugs or issues found
3. Create bug reports with reproduction steps
4. Prioritize fixes based on severity
5. Re-test after fixes are applied
6. Prepare for production deployment

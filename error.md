ull-Stack Bug Fix & System Audit
Act as a senior Full-Stack Developer. Analyze the entire project (Frontend, Backend, Database, APIs, Authentication, File Uploads, and Dashboard modules) and fix every issue instead of applying temporary workarounds. Identify the root cause of each problem and ensure the application is production-ready.

Admin Dashboard Issues
Brand
Brand creation fails when uploading an image.
Brand edit image upload does not work.
Fix image upload, storage, validation, and database saving.
Ensure Brand CRUD works completely.
Category
Category creation fails due to image upload.
Fix image upload and ensure Category CRUD works properly.
Banner
Banner upload fails because image upload fails.
Fix upload middleware, API, storage, and frontend integration.
Testimonials
Avatar upload fails during testimonial creation.
Fix avatar upload and ensure testimonial CRUD works correctly.
Newsletter
"Failed to load subscribers."
Fix the subscribers API and database queries.
Customers
"Failed to load customers."
Fix customers API and ensure customer data loads correctly.
Reviews
"Failed to load reviews."
Fix reviews API and frontend integration.
Settings
/api/settings (or /api/setting) returns 404 API Not Found.
Implement or fix the Settings API.
Ensure GET and UPDATE endpoints work correctly.
Manager Dashboard Issues
Fix all failing modules:

Testimonials → Failed to load
FAQs → Failed to load
Newsletter → Failed to load
Customers → Failed to load
Reviews → Failed to load
Settings → API Not Found
Ensure role-based permissions and APIs are configured correctly.

Customer Authentication
Registration
Registration fails.
Fix validation, database insertion, password hashing, and API responses.
Login
Login fails.
Fix authentication logic, JWT/session generation, middleware, and password verification.
File Upload System
Audit and repair the complete upload system.

Verify and fix:

Multer (or upload middleware)
Storage configuration
Upload directory permissions
Static file serving
File validation
MIME types
File size limits
FormData handling
Database image paths
Frontend upload requests
Ensure uploads work for:

Brand images
Category images
Banner images
Testimonial avatars
Backend Audit
Verify every API route exists.
Fix missing routes.
Fix controllers, services, repositories, and middleware.
Verify request validation.
Fix database models and relationships.
Verify migrations.
Fix HTTP status codes.
Improve error handling.
Remove unnecessary exceptions.
Ensure consistent API responses.
Frontend Audit
Verify every API endpoint matches the backend.
Fix incorrect URLs.
Fix Axios/Fetch requests.
Fix state management.
Handle loading and error states properly.
Refresh UI after successful CRUD operations.
Remove console errors.
Database Audit
Verify tables exist.
Verify foreign keys.
Verify image path columns.
Verify seed data.
Fix migration issues.
Ensure no missing records or schema mismatches.
Final Verification
Before finishing, test every feature end-to-end.

✅ Brand CRUD
✅ Category CRUD
✅ Banner CRUD
✅ Testimonial CRUD
✅ FAQ CRUD
✅ Newsletter Subscribers
✅ Customers
✅ Reviews
✅ Settings
✅ Customer Registration
✅ Customer Login
✅ Image Uploads
✅ Admin Dashboard
✅ Manager Dashboard
Do not stop after fixing one issue. Continue until all errors are resolved.

Finally, provide:

A list of every root cause found.
The files modified.
Database changes or migrations performed.
APIs created or fixed.
A summary confirming that all dashboards, authentication, APIs, uploads, and CRUD operations are fully functional and free of errors.
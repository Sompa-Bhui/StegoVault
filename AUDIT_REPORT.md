# StegoVault Project Audit Report

Date: 2026-07-02
Scope: Full repository review of the frontend, backend, configuration, and project structure.

> Note: This audit is analysis-only. No application code was modified.

## 1. Architecture Review

### Overall architecture
StegoVault is a fairly clear full-stack web application with:
- A React/Vite frontend in [frontend/src](frontend/src)
- A FastAPI backend in [backend/app](backend/app)
- SQLAlchemy models and SQLite persistence in [backend/app/models](backend/app/models)
- Local filesystem storage for uploaded and encoded images

The overall pattern is sensible for a prototype or MVP: the frontend handles UI flow, the backend exposes steganography endpoints, and a simple database stores user and activity metadata.

### Folder structure
The project is organized into the expected high-level areas:
- Root-level orchestration files such as [package.json](package.json) and [backend/requirements.txt](backend/requirements.txt)
- Backend application modules in [backend/app](backend/app)
- Frontend app entry points and pages in [frontend/src](frontend/src)
- Static assets and public resources in [frontend/public](frontend/public)

### Project organization
Strengths:
- Clear separation between routes, schemas, security, and stego logic
- Feature-oriented organization in the backend
- Page-based frontend structure that is easy to navigate

Weaknesses:
- The backend and frontend are both still fairly monolithic for their size
- Some modules mix concerns, especially in [backend/app/routers/stego.py](backend/app/routers/stego.py)
- The current structure is good for a demo but needs stronger layering for long-term maintenance

## 2. Frontend Review

### UI/UX issues
The interface is polished and visually strong, especially on the landing page and the encode/decode pages. The cyber-themed design is consistent and appealing.

However, a few UX issues stand out:
- The dashboard contains placeholder or mock-like content, such as hardcoded activity entries in [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
- The “View all” link points to a route that does not appear to be implemented
- Some screen states are not fully thought through, especially around failed requests and empty data

### Responsiveness
The layout is mostly responsive thanks to Tailwind-based layout classes. The main pages adapt from mobile to desktop reasonably well.

Remaining issues:
- Some cards and layouts could be tuned for smaller screens, especially around long form content and image previews
- The upload areas may feel cramped on very small devices

### Accessibility
The UI includes semantic structure and keyboard-friendly controls in many places, but accessibility is not yet robust.

Issues include:
- The custom input component in [frontend/src/components/UI.jsx](frontend/src/components/UI.jsx) does not appear to support textarea semantics for multi-line message entry, even though the encode page uses a multiline input pattern
- Some interactive elements rely on color and visual styling without enough descriptive context
- Error messages and status states are visually present but not always announced in an accessible way

### Component organization
The frontend is reasonably organized by page and shared UI components.

Opportunities:
- Repeated upload/dropzone logic across multiple pages could be extracted into reusable hooks or components
- The large page components in [frontend/src/pages/Encode.jsx](frontend/src/pages/Encode.jsx) and [frontend/src/pages/Decode.jsx](frontend/src/pages/Decode.jsx) could be split into smaller, focused subcomponents

### Performance issues
Performance is acceptable for a small app, but there are a few concerns:
- Image preview URLs are created with `URL.createObjectURL`, but they are not revoked after use, which can cause memory overhead over time
- Several pages use animated effects and large visual layers that may feel heavier on lower-end devices
- The landing page uses many animated floating elements, which may be visually impressive but could be overkill for performance-sensitive environments

## 3. Backend Review

### API structure
The backend uses a clean router-based structure:
- Authentication routes in [backend/app/routers/auth.py](backend/app/routers/auth.py)
- Steganography routes in [backend/app/routers/stego.py](backend/app/routers/stego.py)
- Dashboard endpoints in [backend/app/routers/dashboard.py](backend/app/routers/dashboard.py)

This is a good foundation and is aligned with FastAPI best practices.

### Authentication
Authentication is implemented using JWT via OAuth2 password flow.

Strengths:
- Token-based auth is appropriate for the app model
- Protected routes rely on dependency injection in the router layer

Concerns:
- The backend uses a fallback secret key in [backend/app/security/auth.py](backend/app/security/auth.py)
- There is no visible password policy enforcement or multi-factor authentication flow
- Token handling is fairly minimal and does not appear to include refresh-token logic or token revocation

### Security issues
The most important security concerns are:
- Sensitive configuration values are present in [backend/.env](backend/.env), including a secret key and database URL
- The app uses a hardcoded CORS policy in [backend/app/main.py](backend/app/main.py)
- File uploads are accepted from users and stored directly on disk without obvious size limits, malware scanning, or content validation beyond extensions
- The backend exposes static files from local directories and does not appear to implement per-user access control around those files beyond the current route protections

### Error handling
Error handling is present but inconsistent.

Examples:
- Some routes raise clear `HTTPException` responses
- Other code paths catch exceptions and expose raw error strings to clients, which can leak implementation details

The API would benefit from centralized exception handling and consistent error-response formats.

### Validation
Validation is mixed:
- Pydantic schemas exist in [backend/app/schemas/schemas.py](backend/app/schemas/schemas.py)
- Form inputs and uploaded files are not deeply validated at the API boundary

Examples:
- Password strength is not enforced
- Uploaded files are only checked by extension, not by content type or actual image integrity
- The stego routes do not limit message length or file size

### Database usage
The current database model is straightforward and functional:
- Users, encoded images, and activity logs are modeled in [backend/app/models/models.py](backend/app/models/models.py)
- Tables are created at startup via [backend/app/main.py](backend/app/main.py)

Issues:
- SQLite is suitable for development, but not ideal for production scaling or concurrency
- There is no migration framework or schema versioning strategy
- The app is relying on `create_all()` at import time rather than a managed migration path

### File upload handling
Uploads are stored locally in the project directories such as uploads and encoded_images.

Concerns:
- No explicit file-size caps
- No cleanup of temporary files in all cases beyond some `finally` blocks
- No antivirus or content-scanning layer
- No storage strategy for production-scale deployments

## 4. Code Quality

### Dead code
There are several signs of dead or unused code and UI elements:
- Some imported icons and utilities appear unused in the frontend pages
- The dashboard includes a link to a route that is not implemented
- A few components may be carrying structure that does not yet have a real data source

### Duplicate code
There is noticeable duplication in the upload and form flows across pages like encode, decode, and analysis. These could be consolidated into shared components or hooks.

### Bad practices
Examples include:
- Hardcoded values and fallback secrets in backend configuration
- Logging via `console.error` instead of structured application logging
- Repeated state setup across similar components
- Using inline random values during render in the landing page animation logic

### Large files
The largest and most complex files are:
- [frontend/src/pages/Encode.jsx](frontend/src/pages/Encode.jsx)
- [frontend/src/pages/Decode.jsx](frontend/src/pages/Decode.jsx)
- [backend/app/routers/stego.py](backend/app/routers/stego.py)
- [backend/app/stego/engine.py](backend/app/stego/engine.py)

These files would benefit from refactoring into smaller helpers and reusable components.

### Refactoring opportunities
High-value refactors would include:
- Extracting shared upload form logic into reusable hooks/components
- Centralizing API error handling in the frontend service layer
- Moving stego processing logic into a clearer service layer instead of keeping it directly in the route handlers
- Introducing a dedicated configuration module for environment-based settings

## 5. Production Readiness

### Missing features
The current app is functional as a prototype, but several production features are missing:
- Password reset and account recovery
- Email verification
- Two-factor authentication
- File history/export features
- Real steganalysis model or stronger statistical detection
- Admin and moderation features

### Missing loading states
Loading states are present in some flows, but they are not fully consistent across the app.

Examples:
- The dashboard has a basic loading view, but other flows could use skeleton screens and clearer progress feedback
- The analysis page does not provide a clearly defined loading/error state for failed runs

### Missing error states
The user experience would be stronger with more granular error handling:
- Better empty states for no images / no history
- User-visible errors for failed image analysis or upload problems
- Retry actions when requests fail

### Logging
Logging is minimal.

Current state:
- The app relies mostly on basic console output and database activity logs
- There is no structured logging, request tracing, or centralized monitoring approach

### Environment configuration
Configuration is not production-hardened:
- Sensitive values are present in committed environment files
- Default security values are weak and could be accidentally used in deployment
- CORS and storage paths are hardcoded rather than environment-driven

### Deployment issues
The current setup would require additional hardening before production deployment:
- No Docker or containerization workflow is evident
- No health checks or deployment automation are described
- No reverse proxy or TLS-oriented deployment config is present
- No backup or storage durability plan is in place for uploaded and encoded files

## 6. Priority List

### HIGH
- Sensitive configuration values are committed in [backend/.env](backend/.env), including secrets and database settings.
- Authentication relies on fallback secrets and lacks stronger production-grade hardening.
- The steganalysis path contains fragile implementation details that can cause runtime failure and should be validated more rigorously.
- The app lacks automated tests and a stronger production safety net.

### MEDIUM
- File upload handling is not sufficiently constrained for production use.
- The frontend has several placeholder or mock-like states that reduce trust and polish.
- The current database approach is fine for development but should be upgraded for production reliability.
- The codebase would benefit from modularization to reduce maintenance cost.

### LOW
- Some UI polish and copy issues remain, especially around empty and error states.
- Minor dead code and unused imports are present.
- Performance can be improved through better resource cleanup and fewer heavy visual effects.

## Summary
StegoVault is a promising and visually strong prototype with a clear concept and an understandable technical structure. The core idea is compelling, and the frontend/backend split is already in place. The biggest concerns are around security configuration, input validation, and production hardening rather than the overall architecture itself. With a stronger security posture, better validation, and a few structural refactors, the project could become a much more robust product.

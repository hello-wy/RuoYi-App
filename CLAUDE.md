# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RuoYi-App is a **uni-app mobile application** (Vue 3 + Pinia) for an education platform called "智育傢" (ZhiYuJia). It's the mobile frontend component of a larger RuoYi-based system, targeting WeChat mini-programs, H5, and native mobile apps.

**Key Technologies:**
- **Framework:** uni-app (Vue 3)
- **State:** Pinia
- **UI Components:** uni-ui
- **Build:** Supports WeChat mini-program (mp-weixin), H5, Android/iOS apps
- **Authentication:** JWT-based dual auth system (admin vs WeChat mini-program)

## Development Workflow

### Running the Application

**WeChat Mini-Program:**
```bash
# Open in HBuilderX or use CLI
# Configure WeChat appid in manifest.json (mp-weixin.appid)
# Development tools: WeChat Developer Tools
```

**H5 Development:**
```bash
# The H5 dev server runs on port 9090 (configured in manifest.json)
# No additional build step needed for H5 development in HBuilderX
```

### API Configuration

The API base URL is configured in `config.js`:
```javascript
baseUrl: 'http://192.168.31.64:8080'  // Default local development
// baseUrl: 'http://zhiyujia.xyz:8080'  // Production
```

**Important:** When switching between local and production, update `config.js`.

### Adding New Features

1. **New Page:** Create in `pages/<domain>/` and register in `pages.json`
2. **New API:** Add to `api/system/<domain>.js` or `api/wxmini/<domain>.js`
3. **New Component:** Add to `components/` if reusable across pages
4. **New Store Module:** Add to `store/modules/<module>.js` if state is shared across pages

## Architecture

### Directory Structure

```
├── api/                    # API layer - interface封装
│   ├── login.js           # Authentication APIs
│   ├── system/            # Regular business APIs
│   └── wxmini/            # WeChat mini-program specific APIs
├── components/            # Reusable components
├── mixins/               # Vue mixins (dict-related)
├── pages/                # Page components (views)
│   ├── common/           # Common pages
│   ├── growup/           # Education/growth module
│   ├── tutoring/         # Tutoring/parent matching
│   ├── jobs/             # Part-time jobs
│   ├── salon/            # Events/salons
│   └── mine/             # User profile
├── plugins/              # Global plugins ($tab, $auth, $modal)
├── store/                # Pinia state management
│   └── modules/
├── utils/                # Utilities (request, auth, storage, etc.)
├── static/               # Static assets
├── uni_modules/          # uni-ui and third-party modules
├── App.vue               # Root component
├── main.js               # Entry point
├── pages.json            # Pages/routes configuration
├── manifest.json         # Build/platform configuration
├── config.js             # Runtime configuration (API base URL)
└── permission.js         # Navigation guards and whitelist
```

### Dual Authentication System

The app supports **two authentication mechanisms**:

1. **Standard Admin Authentication**
   - Header: `Authorization: Bearer {token}`
   - Used for: `/getInfo`, `/logout`, `/system/*` endpoints
   - Managed via: `useUserStore().login()`, `getInfoAction()`

2. **WeChat Mini-Program Authentication**
   - Header: `Wx-Authorization: Bearer {token}`
   - Used for: `/wxmini/**` endpoints
   - Managed via: `resolveWxLogin()`, `resolveWxPhoneLogin()`
   - Flow: WeChat login → temporary token → phone binding → full session

**Key Implementation (utils/request.js:19):**
```javascript
const authHeader = requestUrl.startsWith('/wxmini') ? 'Wx-Authorization' : 'Authorization'
```

### State Management (Pinia)

**Core Store Modules:**
- **user** (`store/modules/user.js`): Authentication, user profile, roles, permissions
- **config** (`store/modules/config.js`): App configuration
- **location** (`store/modules/location.js`): Current city and district data
- **dict** (`store/modules/dict.js`): Dictionary cache for dropdowns/options

**User Store Key Actions:**
- `login()` - Standard username/password login
- `resolveWxLogin(appid, code)` - WeChat mini-program code login
- `resolveWxPhoneLogin({appid, code, phoneCode})` - WeChat phone number binding
- `getInfo()` - Fetch user profile after login
- `logOut()` - Clear session and redirect to login

### Request Layer (utils/request.js)

All API calls go through `utils/request.js` which:
- Automatically adds appropriate auth header based on URL prefix
- Handles common error codes (401, 500, etc.)
- Shows toast messages for errors
- Enforces token-based authentication

**Usage pattern:**
```javascript
import request from '@/utils/request'

export function myApi(data) {
  return request({
    url: '/api/endpoint',
    method: 'post',
    data: data
  })
}
```

### Navigation Guards (permission.js)

**Protected Routes:** Any page not in the `whiteList` requires authentication

**Whitelist Pages:** Login, register, and public pages like:
- `/pages/login`
- `/pages/register`
- `/pages/index`
- `/pages/tutoring/parent/list`
- `/pages/tutoring/tutor/list`
- `/pages/jobs/list`
- etc.

### Page Organization by Business Domain

- **pages/growup/** - Courses, tutors, materials, enrollment
- **pages/tutoring/** - Parent/tutor matching (split into `parent/` and `tutor/`)
- **pages/jobs/** - Part-time job listings
- **pages/salon/** - Events and salons
- **pages/mine/** - User profile, wallet, settings, enrolled courses
- **pages/common/** - Shared pages (webview, about, contact)

## Key Conventions

### Dictionary System

The app uses a dictionary system for dynamic options:
- `useDict()` composable for fetching dictionaries
- `DictTag` component for displaying dictionary values
- `dictMixin` for automatic dictionary loading via component options

### Component Architecture

**Custom Components** (in `components/`):
- `data-list` - Unified list loading with pagination
- `TutoringFilterBar` - Tutoring search filters
- `AreaPicker` - Province/city/district selector
- `LocationMap` - Map display with navigation
- `ServiceGrid` - Home page service grid
- `DictTag` - Dictionary value tags
- `LoginPopup` - Login modal

**Component Design Rules:**
- Use `props + emits` for interface
- Don't directly access external page state
- Business navigation components can hold routes, display components should not

### API Layer Conventions

- **system APIs:** Standard business endpoints
- **wxmini APIs:** WeChat mini-program specific endpoints
- All requests return `{ code, msg, data }` structure
- Use `request()` wrapper, never `uni.request()` directly

## Platform-Specific Notes

### WeChat Mini-Program (mp-weixin)

- **appid:** `wx0ac1366c34e4ce68` (configured in manifest.json)
- URL check is disabled for development
- Supports ES6 and postcss transformations
- Uses subPackages optimization

### H5

- **Dev Server:** Port 9090
- **Router Mode:** hash
- **Base:** `./` (relative paths)

### Native Apps (app-plus)

- Requires Android/iOS permissions (camera, network, etc.)
- nvue compiler: uni-app
- Splashscreen configured

## Common Patterns

### Adding a New List Page

1. Create page in `pages/<domain>/list.vue`
2. Register route in `pages.json`
3. Add API functions in `api/system/<domain>.js`
4. Use `data-list` component for unified list handling
5. Add to `permission.js` whitelist if public

### WeChat Login Flow

```javascript
// Step 1: Get wx.login code
const { code } = await uni.login()

// Step 2: Login with code (no phone binding)
await useUserStore().resolveWxLogin(appid, code)

// OR Step 3: Login with phone number binding
const { code } = await uni.login()
const phoneCode = await getPhoneNumber() // From button getphonenumber
await useUserStore().resolveWxPhoneLogin({ appid, code, phoneCode })
```

### Working with Location

The app uses `pca-code.json` for province/city/district data:
```javascript
import { useLocationStore } from '@/store'
const locationStore = useLocationStore()

// Get current city
const city = locationStore.city

// Get districts for current city
const districts = locationStore.districts
```

## Reference Documentation

For detailed documentation, see:
- [reference/project-structure.md](reference/project-structure.md) - Complete directory structure
- [reference/components.md](reference/components.md) - Component catalog
- [reference/routes.md](reference/routes.md) - Route index
- [AGENTS.md](AGENTS.md) - Agent development guidelines

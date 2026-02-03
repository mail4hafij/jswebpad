# jsWebPad

A lightweight jQuery-based framework for server-controlled AJAX applications.

## Why jsWebPad?

Modern web development often defaults to heavy client-side frameworks like React, Vue, or Angular. While these tools are powerful and excel in complex, highly interactive applications, they introduce significant complexity and overhead for simpler use cases.

**The Reality of Most Web Applications:**
- The majority of web applications are CRUD-based (Create, Read, Update, Delete)
- Most user interactions involve form submissions, data display, and simple UI updates
- These operations don't require a virtual DOM, complex state management, or heavy client-side rendering
- Server-side MVC frameworks (Laravel, ASP.NET MVC, Rails, Django) already handle business logic efficiently

**The Problem:**
React and similar frameworks require:
- Large JavaScript bundles shipped to clients
- Build processes and transpilation
- Client-side state management
- Virtual DOM reconciliation overhead
- Steep learning curve for team members
- Increased complexity for simple tasks

**The Solution:**
jQuery already solved UI manipulation and AJAX communication years ago. For most CRUD applications, you don't need React's virtual DOM—you need a simple, server-controlled approach where your backend dictates what happens on the page.

**jsWebPad's Philosophy:**
- **Server in Control**: Your MVC backend controls all UI logic through JSON responses
- **Minimal Client-Side Code**: No complex state management, no virtual DOM overhead
- **jQuery is Enough**: Leverage jQuery's proven capabilities for DOM manipulation and AJAX
- **Developer Efficiency**: Build full-featured applications with minimal JavaScript
- **Keep It Simple**: Focus on your server-side code, let jsWebPad handle the client

**When to Use jsWebPad:**
- ✅ CRUD applications (admin panels, dashboards, data entry)
- ✅ Form-heavy applications
- ✅ Traditional server-rendered MVC apps with AJAX
- ✅ Projects where simplicity and maintainability matter
- ✅ Teams comfortable with server-side development

**When NOT to Use jsWebPad:**
- ❌ Real-time collaborative applications
- ❌ Complex single-page applications with heavy client-side logic
- ❌ Applications requiring offline-first capabilities
- ❌ Highly interactive UI with frequent state changes

**The Bottom Line:**
Don't use a sledgehammer to crack a nut. If your application is primarily CRUD operations with server-side rendering, jsWebPad lets you build it efficiently without the complexity and overhead of modern client-side frameworks. Your well-structured MVC application can handle everything with minimal effort, keeping your codebase simple, maintainable, and performant.

---

## Installation

### 1. Include Dependencies

```html
<!-- jQuery (required) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- jQuery Form Plugin (required) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.3.0/jquery.form.min.js"></script>

<!-- jsWebPad -->
<script src="path/to/jswebpad.js"></script>
```

### 2. Optional: Add Loader Element

```html
<div id="ajax-loader" style="display:none;">
  <div class="spinner">Loading...</div>
</div>
```

jsWebPad automatically shows/hides this element during AJAX requests.

### 3. Configure (Optional)

**Default values (no configuration needed):**
```javascript
$.jsWebPad.options.clearForm = false;                    // Don't clear forms by default
$.jsWebPad.options.timeout = 30000;                      // 30 seconds timeout
$.jsWebPad.options.showmsg = 'notifications';            // Default HTML element id for responses
$.jsWebPad.options.successClass = 'success';             // CSS class for success messages
$.jsWebPad.options.errorClass = 'error';                 // CSS class for error messages
$.jsWebPad.options.classesToRemove = ['notice', 'hidden']; // Classes to remove before showing messages
```

**Customize if needed:**
```javascript
// Enable form clearing after submission
$.jsWebPad.options.clearForm = true;

// Change timeout to 5 seconds
$.jsWebPad.options.timeout = 5000;

// Use custom HTML element id for responses
$.jsWebPad.options.showmsg = 'alerts';

// Form submission hook (checks if button has 'confirm' class)
$.jsWebPad.beforeSubmit = function($form, $button) {
  if ($button && $button.hasClass('confirm')) {
    return confirm('Are you sure?');
  }
  return true;
};

// GET request hook (checks if link has 'confirm' class)
$.jsWebPad.beforeGet = function($link, url) {
  if ($link.hasClass('confirm')) {
    return confirm('Are you sure?');
  }
  return true;
};
```

**HTML usage:**
```html
<!-- Button needs name="jsonsubmit" + class="confirm" -->
<button name="jsonsubmit" class="confirm">Delete User</button>

<!-- Link needs class="get" (triggers jsWebPad) + class="confirm" (shows confirmation) -->
<a href="/delete?id=123" class="get confirm">Delete</a>
```

**For Bootstrap:**
```javascript
$.jsWebPad.options.successClass = 'alert alert-success';
$.jsWebPad.options.errorClass = 'alert alert-danger';
$.jsWebPad.options.classesToRemove = ['alert-success', 'alert-danger', 'd-none'];
```

**For Tailwind:**
```javascript
$.jsWebPad.options.successClass = 'text-green-600 bg-green-50 p-4';
$.jsWebPad.options.errorClass = 'text-red-600 bg-red-50 p-4';
$.jsWebPad.options.classesToRemove = ['hidden'];
```

---

## Quick Start

### Basic Form Submission

**HTML:**
```html
<div id="notifications"></div>

<form action="/users/create" method="post">
  <input type="text" name="username" required>
  <input type="email" name="email" required>
  <button name="jsonsubmit">Create User</button>
</form>
```

**Server (PHP/Laravel example):**
```php
public function create(Request $request) {
    $user = User::create($request->all());

    return response()->json([
        'url' => '/users/list'  // Redirect after creation
    ]);
}
```

**That's it!** jsWebPad handles the AJAX submission and redirects to `/users/list`.

### Show Success Message

**HTML:**
```html
<div id="notifications"></div>

<form action="/contact/send" method="post">
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button name="jsonsubmit">Send Message</button>
</form>
```

**Server:**
```php
public function send(Request $request) {
    // Validate input
    if (empty($request->email)) {
        return response()->json([
            'error' => 'Email address is required!'
        ]);
    }

    // Send email...

    return response()->json([
        'success' => 'Message sent successfully!'
    ]);
}
```

jsWebPad shows success in `#notifications` with the `success` class, or error with the `error` class and scrolls to it.

### GET Request

**HTML:**
```html
<a href="/users/delete/123" class="get confirm">Delete User</a>
```

**Server:**
```php
public function delete($id) {
    User::destroy($id);

    return response()->json([
        'success' => 'User deleted!',
        'hide' => 'user-row-123'
    ]);
}
```

jsWebPad makes the AJAX GET request, shows success message, and hides the user row.

### Error with Alert Dialog

**HTML:**
```html
<form action="/payment/process" method="post">
  <input type="text" name="amount" required>
  <button name="jsonsubmit">Process Payment</button>
</form>
```

**Server:**
```php
public function process(Request $request) {
    // Check for critical errors
    if ($request->amount > $user->balance) {
        return response()->json([
            'error' => 'Insufficient funds! Please add money to your account.',
            'showmsg' => 'alert'  // Show as alert dialog instead of div
        ]);
    }

    // Process payment...

    return response()->json([
        'success' => 'Payment processed successfully!',
        'url' => '/payments/receipt'
    ]);
}
```

jsWebPad shows critical errors as alert dialogs when `showmsg` is set to `"alert"`. Use this for important errors that require immediate attention.

### Update Partial View with CSS Classes

**HTML:**
```html
<div id="user-profile">
  <!-- Current profile -->
</div>

<form id="profile-form" action="/profile/updateProfile" method="post">
  <input type="text" name="name" value="John">
  <button name="jsonsubmit">Update</button>
</form>
```

**Server:**
```php
public function updateProfile(Request $request) {
    // Update user...

    $html = view('partials.profile', ['user' => $user])->render();

    return response()->json([
        'html' => $html,
        'showmsg' => 'user-profile',
        'addClass' => [
            'user-profile' => 'highlight'
        ]
    ]);
}
```

jsWebPad replaces `#user-profile` content with updated HTML and adds a `highlight` class for visual feedback (e.g., brief green glow that fades after animation).

### Load Partial into Container

**HTML:**
```html
<div id="sidebar-container">
  <!-- Sidebar will be loaded here -->
</div>

<form action="/settings/updateSettings" method="post">
  <input type="text" name="setting" value="value">
  <button name="jsonsubmit">Save Settings</button>
</form>
```

**Server:**
```php
public function updateSettings(Request $request) {
    // Update settings...

    return response()->json([
        'url' => '/dashboard/sidebar',  // Action that renders sidebar partial
        'container' => 'sidebar-container'
    ]);
}

// Sidebar action that renders the partial
public function sidebar() {
    return view('partials.sidebar');  // Returns HTML directly
}
```

jsWebPad saves the settings, then loads the `/dashboard/sidebar` action and renders it into `#sidebar-container`. The visual update provides feedback to the user.

### Reload Elements with Render

**HTML:**
```html
<div id="user-stats" src="/dashboard/userStats">
  <!-- Stats will be loaded here -->
</div>

<div id="recent-activity" src="/dashboard/recentActivity">
  <!-- Activity will be loaded here -->
</div>

<a href="/dashboard/refresh" class="get">Refresh Dashboard</a>
```

**Server:**
```php
public function refresh() {
    return response()->json([
        'render' => ['user-stats', 'recent-activity']
    ]);
}

// Each element loads from its src attribute
public function userStats() {
    return view('partials.user_stats');
}

public function recentActivity() {
    return view('partials.recent_activity');
}
```

jsWebPad reloads multiple elements by fetching content from each element's `src` attribute. Each element independently loads its content from a different URL.

---

## How jsWebPad Works

### Perfect Match with MVC Architecture

jsWebPad is designed to work seamlessly with **MVC-driven backends** (Laravel, ASP.NET MVC, Rails, Django, etc.). Here's why they're a perfect match:

**MVC's Component-Based Structure:**
- MVC frameworks organize code into **actions** (controller methods)
- Actions render **partial views/elements** (reusable UI components)
- Elements can be nested and composed together
- Each action has a specific URL endpoint

**jsWebPad Leverages This:**
- Each action can be called via AJAX and return JSON
- JSON responses tell jsWebPad what to do with the page
- Elements can be **reloaded independently** without full page refresh
- Server remains in **complete control** of UI logic

### The Server-Controlled Approach

Unlike React/Vue where components manage their own state, jsWebPad puts the **server in charge**:

```
User Action → AJAX Request → Server Action → JSON Response → jsWebPad Updates Page
```

**Example Flow:**
1. User clicks "Delete" button
2. jsWebPad sends AJAX POST to `/users/delete/123`
3. Server (MVC action) processes deletion
4. Server returns JSON: `{ "success": "User deleted!", "hide": "user-row-123" }`
5. jsWebPad shows success message and hides the user row
6. **No client-side logic needed** - server told jsWebPad exactly what to do

### Working with Partials and Elements

MVC frameworks excel at rendering partial views/elements. jsWebPad makes them dynamic:

**Scenario: Update a user profile section**

**Server-Side (MVC Action):**
```php
// Controller action
public function updateProfile() {
    // Process update...

    // Render updated profile element
    $html = $this->renderElement('profile_card', ['user' => $user]);

    return json_encode([
        'success' => 'Profile updated!',
        'html' => $html,
        'showmsg' => 'profile-container'
    ]);
}
```

**Client-Side (HTML):**
```html
<div id="profile-container">
  <!-- Current profile card will be replaced -->
</div>

<form action="/profile/update" method="post">
  <input name="name" value="John">
  <button name="jsonsubmit">Update</button>
</form>
```

**What Happens:**
- User submits form
- Server processes and re-renders the profile element
- jsWebPad replaces `#profile-container` with new HTML
- **No page reload, no React components, just clean MVC**

### Why This Works So Well

**1. Natural MVC Flow**
- You're already writing actions and partials
- Just return JSON instead of full page HTML
- Elements become dynamic without rewriting as components

**2. Server Stays in Control**
- Business logic where it belongs (server)
- UI decisions made by server (which elements to show/hide)
- Security and validation handled server-side

**3. Reusable Elements**
- Same partial used for initial render AND updates
- No duplicate logic in frontend components
- Consistent HTML structure

**4. Independent Updates**
- Update sidebar without touching main content
- Reload a data table without refreshing the page
- Show/hide elements based on server state

### Basic Concept

**Three Ways to Trigger Actions:**

1. **Form Submission** - `<button name="jsonsubmit">`
2. **GET Links** - `<a class="get" href="/action">`
3. **Form onsubmit** - `$.jsWebPad.eventonsubmit('formId')` (for rich text editors)

**Server Returns JSON, jsWebPad Reacts:**

The server's JSON response controls everything:
- Show success/error messages
- Update HTML in specific containers
- Show/hide elements
- Add/remove CSS classes
- Redirect to another page
- Reload specific sections

**You write server-side code, jsWebPad handles the DOM updates.**

---


## Dependencies

- **jQuery** 3.x or higher
- **jQuery Form Plugin** 4.x or higher

---

## Browser Support

Works in all modern browsers that support:
- jQuery 3.x
- ES5 (forEach, Array.isArray)

---

## Version

**Current Version:** 5.0

Check version:
```javascript
console.log($.jsWebPad.version); // "5.0"
```

---

## License

Free to use

---

## Author

**Mohammad Hafijur Rahman**
- GitHub: https://github.com/mail4hafij/jswebpad

---

## Contributing

Issues and pull requests are welcome at:
https://github.com/mail4hafij/jswebpad/issues

---

## Changelog

### Version 5.0 (Initial Release)
- Server-controlled AJAX framework for MVC applications
- jQuery-based with minimal client-side complexity
- Form submission and GET request handling
- Configurable options for form behavior and message display
- Hook system for client-side behavior (`beforeSubmit`, `beforeGet`)
- Flexible JSON response format for DOM manipulation
- Support for partial view rendering and dynamic updates
- CSS class manipulation (add, remove, toggle)
- Element visibility control (show, hide, remove)
- Backward compatible `eventonsubmit` for rich text editors

---


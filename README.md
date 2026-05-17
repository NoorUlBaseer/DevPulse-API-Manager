# DevPulse API Manager

> A lightweight static frontend for managing APIs and related resources — dashboard, users, products, notifications, and analytics.

## Features

- Dashboard overview with key metrics
- User authentication (login / signup)
- User management view
- Product management view
- Notifications and alerts
- Simple analytics pages

## Demo

Open `index.html` in your browser (or serve the folder with a static server) and use the provided UI to explore the dashboard, users, products, and analytics pages.

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- (Optional) A simple static server for correct HTTP requests during development

## Installation / Run Locally

1. Clone the repository:

```bash
git clone https://github.com/NoorUlBaseer/DevPulse-API-Manager.git
cd "DevPulse API Manager"
```

2. Open the project in your editor and either:

- Open `index.html` directly in your browser (double-click), or
- Run a quick static server. For example with Python 3:

```bash
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or use the VS Code Live Server extension for live reload.

## Usage

- `login.html` / `signup.html`: Authentication pages (client-side demo flows).
- `dashboard.html`: Main management dashboard.
- `users.html`: View and manage users.
- `products.html`: View and manage products.
- `analytics.html`: View analytics panels.
- `settings.html`: App settings UI.

JavaScript code that powers the UI is in `script.js`, with specific modules like `auth.js` and `notifications.js`. 

## Project Structure

```
./
├─ index.html
├─ dashboard.html
├─ users.html
├─ products.html
├─ analytics.html
├─ login.html
├─ signup.html
├─ settings.html
├─ script.js
├─ auth.js
├─ notifications.js
├─ styles.css
└─ assets/
```

## Development Notes

- The codebase is a static client-side app using vanilla HTML, CSS, and JavaScript.
- To add new UI pages, create a new `.html` file and link `styles.css` and `script.js` as appropriate.
- Keep state and mock data in `script.js` or separate modules for clarity.

## Contributing

- Fork the repo, create a feature branch, add your changes, and open a pull request. Keep changes focused and include any UI screenshots when relevant.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE.txt) file for details.

---

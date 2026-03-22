# StoxScoop UI

A premium, responsive React front-end dashboard that translates market news into actionable signals. Provides a sleek, card-based interface optimized for professional traders to log and filter impactful stock market events quickly.

## Tech Stack
- **React (Vite)**: Lightning-fast HMR and bundling.
- **Tailwind CSS v3**: Extensive utility-first styling utilizing a curated custom emerald and slate design system.
- **TanStack React Query**: Caching, background fetching, and intelligent API state management.
- **Axios**: HTTP client configured with a development proxy to circumvent CORS restrictions.
- **Lucide React**: Clean, modern SVG iconography.
- **React Router Dom**: Client-side routing for the Single Page Application architecture.

## Core Implementations & Logic

### 1. The Dashboard (`/`)
- **Pagination & Filters**: Automatically filters and fetches events natively. Features immediate presets for "Today", "This Week", and "This Month". Built-in frontend skip/limit pagination handles large datasets cleanly.
- **Stock Autocomplete**: A specialized 2-character threshold input component gracefully queries backend stock symbols and names without overloading DOM elements with massive native `<select>` wrappers.
- **Visual Event Badges**: Dynamic mapping assigns curated pill color alignments directly against 12 specific event types. High-priority events natively draw attention using Tailwind pulsing classes.

### 2. Batch Event Entry Wizard (`/batch/create`)
- **Multi-Event Payload Engine**: Empowers traders to construct massive, multiple-event packages seamlessly in one sitting, wrapping them internally into a single HTTP `POST` payload.
- **Dynamic Field Injection**: Choosing different events (e.g., `Stake Transaction` vs `Contract Win`) reactively morphs the exact UI inputs below it to capture the most relevant technical parameters for that event profile.
- **Local Storage Draft Recovery**: Entire deeply-nested state objects are stringified and saved safely to browser `localStorage` when clicking "Save as Draft." In case of a browser crash or accidental navigation, the wizard instantly resurrects the user's progress.
- **Stock Autofill Memory**: The wizard persists and remembers your last-used Stock ID locally, automatically populating the stock selector when you click "Add Another Event".

### 3. Event Detail Rendering (`/events/:id`)
- Designed around flexibility, the individual detail page natively loop-renders dynamic `*_details` schema fields, accurately parsing nested numbers, generic string values, and converting backend booleans (`false`/`true`) into clean "Yes/No" labels. 

## Local Development
```bash
# Install NPM dependencies
npm install

# Run the local Vite dev server
npm run dev
```

> **CORS Proxy Note**: The Vite configuration (`vite.config.js`) intentionally routes any client requests hitting `/api/*` straight through to your backend at `http://127.0.0.1:8000`. This completely shields frontend API requests from strict preflight cors blocks!

# Rally Notes Driver Management UI

A SvelteKit SPA (Single Page Application) for managing rally racing drivers. This is the first resource implementation following a patterns that can be extended to other resources (teams, manufacturers, stages, etc.).

## Project Architecture

### SPA Mode

- **Client-side only rendering** - all UI rendering happens in the browser
- No server-side rendering (HTML is sent empty, JavaScript hydrates it)
- Fast, lightweight, deployable as static files

### Type Safety

- **Full TypeScript** with strict mode enabled
- Separate type definitions for API contracts (`lib/types/driver.ts`)
- Type-safe API client layer (`lib/api/drivers.ts`)

### API Integration

- **Native fetch** - no external HTTP libraries
- Proper error handling with field-level validation errors
- Maps Ktor backend validation responses to usable UI format

### Component Architecture

- **Decoupled components** - API logic separated from UI
- **Reusable utilities** - Modal, LoadingSpinner, ErrorAlert, Form components
- **Semantic HTML + vanilla CSS** - no UI framework dependencies

## Project Structure

```
src/
├── app.css                          # Global styles, CSS variables, resets
├── routes/
│   ├── +layout.svelte              # Root layout (imports app.css)
│   ├── +page.svelte                # Index (redirects to /drivers)
│   └── drivers/
│       ├── +page.svelte            # Driver list with create modal
│       └── [id]/
│           ├── +page.svelte        # Driver detail with edit modal
│           └── +page.ts            # Load function for driver ID
└── lib/
    ├── api/
    │   └── drivers.ts              # Driver API client (fetch calls)
    ├── types/
    │   └── driver.ts               # Driver type definitions
    └── components/
        ├── Modal.svelte            # Reusable modal container
        ├── LoadingSpinner.svelte   # Loading indicator
        ├── ErrorAlert.svelte       # Error message display
        └── DriverForm.svelte       # Create/edit form for drivers
```

## Features

### Driver List Page (`/drivers`)

- ✅ Fetch and display all drivers in a table
- ✅ Loading state with spinner indicator
- ✅ Error handling with dismissible alerts
- ✅ Create driver button → opens modal with form
- ✅ View details link → navigates to `/drivers/[id]`
- ✅ Edit button → opens modal with pre-filled form
- ✅ Delete button → confirmation → removes from list
- ✅ Empty state when no drivers exist

### Driver Detail Page (`/drivers/[id]`)

- ✅ Fetch and display single driver
- ✅ Loading state with spinner
- ✅ 404 handling for not found
- ✅ Edit button → opens modal with pre-filled form
- ✅ Delete button → confirmation → redirects to list
- ✅ Back to list navigation link

### Driver Form Component

- ✅ Works for both create and edit (initialData prop switches mode)
- ✅ Form fields: name (required), number (optional)
- ✅ Inline validation error display under each field
- ✅ Loading state: spinner + disabled submit button
- ✅ Cancel button
- ✅ Smart submit button text: "Create" vs "Update"
- ✅ Prevents submit if form is empty

### API Client Features

- ✅ Type-safe request/response types
- ✅ Proper HTTP status code handling (200, 201, 204, 400, 404)
- ✅ Validation error parsing → field-level error map
- ✅ Custom ApiException with field errors and status code
- ✅ Fetch calls: listDrivers, getDriver, createDriver, updateDriver, deleteDriver

### Styling

- ✅ Global CSS variables for colors, spacing, typography
- ✅ Semantic HTML with clean, readable styling
- ✅ Modal backdrop with animations (fade-in, slide-up)
- ✅ Form styling with focus states and error states
- ✅ Table styling with hover effects
- ✅ Button styles with hover/disabled states
- ✅ Responsive design (mobile-friendly)
- ✅ Spinner animation (CSS rotate)
- ✅ Accessibility: focus-visible, sr-only utilities

## Running the Project

### Development

```bash
# Install dependencies (already done)
pnpm install

# Start dev server
pnpm dev

# Visit http://localhost:5173
# Note: Backend should be running at http://localhost:8080
```

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
```

## Backend API Contract

The project expects a Ktor API at `http://localhost:8080` with these endpoints:

### Driver Endpoints

- `GET /drivers` → List of all drivers
- `GET /drivers/{id}` → Single driver or 404
- `POST /drivers` → Create driver, returns 201 with created driver
- `PUT /drivers/{id}` → Update driver, returns 204 No Content or error
- `DELETE /drivers/{id}` → Delete driver, returns 204 No Content or error

### Error Responses

```json
{
	"error": "Error message",
	"details": [
		{ "field": "name", "message": "Name is required" },
		{ "field": "number", "message": "Number must be positive" }
	]
}
```

## Extending to Other Resources

This implementation follows a pattern that can be extended to other resources:

1. **Create type definitions** → `src/lib/types/{resource}.ts`
2. **Create API client** → `src/lib/api/{resource}.ts`
3. **Create form component** → `src/lib/components/{Resource}Form.svelte`
4. **Create list page** → `src/routes/{resources}/+page.svelte`
5. **Create detail page** → `src/routes/{resources}/[id]/+page.svelte`
6. **Update navigation** → Link between resource management pages

The same components (Modal, LoadingSpinner, ErrorAlert) can be reused across all resources.

## Key Design Decisions

### SPA (No SSR)

- Faster initial load time
- Easier to deploy (static files)
- All rendering happens in browser
- Better for dynamic UI with frequent updates

### Native Fetch

- No external HTTP library overhead
- Built-in to modern browsers
- Simpler dependency tree
- Easy to customize if needed

### Field-Level Validation Errors

- Display directly under each form input
- Better UX than summary at top
- Users see exactly what's wrong with each field

### Modal-First UX

- Create/edit via modals keeps context
- List and detail pages accessible via routes
- Users can bookmark/share detail page links

### Decoupled API Layer

- Components don't call fetch directly
- API errors are parsed and transformed
- Easy to test, swap, or enhance API client
- Type-safe throughout

### CSS Variables

- Easy theme changes
- Centralized color/spacing definitions
- Consistent look across all components
- Good for dark mode in the future

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020+ JavaScript support
- No IE11 support (uses native fetch, optional chaining, nullish coalescing, etc.)

## Future Enhancements

- [ ] Dark mode (toggle CSS variables)
- [ ] Custom modal component (instead of native confirm)
- [ ] Toast notifications for success feedback
- [ ] Search/filter on driver list
- [ ] Pagination for large datasets
- [ ] Export drivers to CSV
- [ ] Bulk actions (delete multiple)
- [ ] Driver statistics dashboard
- [ ] Authentication/authorization
- [ ] Form validation on client-side before submit
- [ ] Optimistic updates for better UX
- [ ] Error retry logic with exponential backoff

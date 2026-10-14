# School Equipment Tracking System

A browser application built with HTML5, CSS3, and vanilla JavaScript. It provides Supabase administrator sign-in, equipment records, add equipment, category filtering, Linear Search, Bubble Sort, and equipment details. It requires no Node.js, npm, or build tooling.

The interface uses the provided CPSU logo in its original colors and proportions, with restrained forest-green and golden-yellow accents.

Equipment status choices include Available, In Use, Under Maintenance, Lost, and Damaged.

## Run with VS Code Live Server

1. Open this project folder in Visual Studio Code.
2. Open `login.html` and start **Live Server** from the editor's status bar or file context menu.
3. Sign in with the administrator email and password for the Supabase account `kodular1100@gmail.com`.
4. Use the navigation links to manage and view equipment.

Equipment records are stored in the shared Supabase `public.equipment` table. Authentication uses the project configured in `js/auth.js`; the Supabase JavaScript client is loaded from jsDelivr. Before using the application, run `supabase/equipment.sql` in the Supabase SQL Editor and ensure the administrator account exists in Supabase Authentication.

The table setup creates the table if it does not exist, adds missing non-key columns, enables RLS, applies email-restricted policies, and adds the table to Realtime. The existing table in this project uses UUID IDs; the migration converts their values to text without changing their string representations, so new manually entered IDs can also be stored. The SQL resets this table's policies to the administrator-only policy set, but does not delete or update equipment rows. Review the SQL first; keep a database backup, particularly if other tables reference `equipment.id`.

If this browser has pre-Supabase equipment saved in its `schoolEquipmentRecords` local storage, open **Equipment Records** and select **Import this browser’s existing records**. The import uses the equipment ID as the conflict key and ignores IDs already in Supabase, so it does not overwrite cloud rows. Repeat from other devices only if they have different legacy records to retain. If an old browser record uses an `EQ-...` ID that matches a migrated UUID string, the existing cloud record is preserved and that legacy copy is skipped.

## Administrator access and security limitation

Only the configured administrator email is accepted, and there is no registration page or other user role. The administrator account must already exist in Supabase Authentication. Each protected page asks Supabase to validate the current user before rendering; the Supabase client persists its session between pages and refreshes, but application authorization does not trust a locally stored session flag.

The publishable key is intended for browser use; never put a Supabase secret or service-role key in this project. The SQL migration restricts table access through RLS to the configured administrator email. Browser JavaScript checks are not a security boundary; keep RLS enabled and review the policies before production use.

## Supabase and Vercel setup

1. Review `supabase/equipment.sql`, then run it in the Supabase SQL Editor. The existing table uses UUID IDs, so this migration converts those ID values to text; their string values are preserved. It also replaces existing RLS policies on this table with the administrator-only set. Back up the project and inspect any foreign keys referencing `equipment.id` before running it. No equipment rows are deleted or overwritten.
2. The SQL migration adds the table to `supabase_realtime`. In Supabase, verify `public.equipment` is listed under Database → Publications → `supabase_realtime`.
3. In Supabase Authentication, ensure the administrator account `kodular1100@gmail.com` exists, disable public sign-ups if not needed, and configure the project Site URL and allowed redirect URLs for the Live Server origin and deployed Vercel domain.
4. Deploy the static site to Vercel with the project root as the root directory and no build command. Supabase URL and publishable key are configured in `js/auth.js`; no secret/service-role key or Vercel server environment variable is used.

To test sharing, deploy/open the same Vercel URL on two devices and sign in to both with the authorized administrator account. Add a uniquely identified item on device A. Device B should receive the record through Realtime; refresh its records page if Realtime is not connected. Test a browser's older local records separately by using **Import this browser’s existing records** on that device.

## Demonstration

- **Login:** Open `login.html` and sign in with the configured administrator's Supabase email and password. Other email addresses are rejected. The password visibility button toggles password display.
- **Home:** Open the Home link after logging in to see the system introduction and live equipment summary.
- **Equipment records:** Open **Equipment Records** to see shared records, categories, conditions, and statuses. Filter by category or select Equipment Name, Equipment ID, or Equipment Category and select **Sort records**. Records added on another device appear through Supabase Realtime when enabled; otherwise refresh the page.
- **Add equipment:** Select **Add Equipment**, complete every documented field, then select **Save Equipment**. Duplicate IDs and blank fields are rejected. The saved record is available through the **View equipment records** link.
- **Equipment search:** Open **Search Equipment**, enter a name, ID, or category, select the field (or search all three), and submit. Try an unmatched value to see **Equipment not found.**
- **Equipment details:** Choose **View details** on a record or use the full-details link from a search result. The page displays every documented field.
- **Logout/access checks:** Select **Logout**. Directly opening any protected page redirects to the login page until the administrator signs in again.

## Algorithms

- `js/dsa.js` contains `linearSearch`, which checks records sequentially and returns the first match by name, ID, or category.
- `js/dsa.js` also contains `bubbleSort`, which compares adjacent records and arranges them by name, ID, or category. The equipment records page uses this algorithm.

## Project files

- `login.html`, `index.html`, `equipment.html`, `search.html`, `details.html`, and `add-equipment.html` provide sign-in and the protected system pages.
- `assets/cpsu-logo.png` is the supplied CPSU logo used for application branding.
- `supabase/equipment.sql` creates the compatible table and administrator-only RLS policies without deleting rows.
- `css/style.css` contains the responsive interface styles.
- `js/auth.js` and `js/login.js` implement Supabase password authentication, administrator email allowlisting, remote session validation, protected-page redirects, and logout.
- `js/storage.js` reads, writes, imports legacy local records, and subscribes to Supabase Realtime. It maps `serialNumber` / `purchaseDate` to `serial_number` / `purchase_date`.
- `js/app.js`, `js/equipment.js`, `js/search.js`, `js/details.js`, and `js/add-equipment.js` implement page interactions.

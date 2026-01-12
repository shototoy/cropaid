# Implementation Plan - Refinements & Fixes

This plan addresses the user's latest feedback regarding the Admin Dashboard map, setup scripts, and the advisory carousel, while ensuring previous report functionality updates are preserved.

## User Objectives
1.  **Admin Map Reuse**: Make the Admin Dashboard Map identical to the Farmer Dashboard's "Community View" map.
2.  **Clean Setup**: Ensure `npm run setup` only resets the DB and seeds the Admin user. Simulation should be a separate manual step.
3.  **Carousel Fix**: Fix the initial "full card" glitch on the system advisory carousel and preload data on the Splash screen.
4.  **Deploy Friendly**: Ensure scripts are ready for deployment (Railway).

## Proposed Changes

### 1. Server Scripts Refactoring
- **File**: `server/package.json`
- **Action**: Update `"setup"` script to remove `&& node simulate-data.js`. It should only run `setup-db.js`.
- **Verification**: Check `server/seed.sql` to ensure it contains the default Admin account.

### 2. Admin Map Refactor
- **Source**: `src/pages/FarmerMapPage.jsx`
- **Target**: `src/pages/admin/AdminMapPage.jsx`
- **Action**: 
    - Analyze `FarmerMapPage` to identify the "Community View" components/logic.
    - Refactor `AdminMapPage` to import and reuse the map component used in `FarmerMapPage`, or duplicate the logic if tight coupling prevents reuse.
    - Ensure Admin permissions are respected (Admin should see ALL public/verified reports/farms).

### 3. Carousel & Splash Optimization
- **File**: `src/pages/Splash.jsx`
    - **Action**: Fetch initial news/advisory data here and store it (e.g., in Context or specific Cache) so it's ready when `FarmerDashboard` mounts.
- **File**: `src/pages/FarmerDashboard.jsx`
    - **Action**: 
        - Update carousel logic to use preloaded data if available.
        - Fix initial rendering state (CSS/Layout) to prevent the "full card" glitch before the slide logic initializes.

### 4. Previous Report Updates (Verification)
- Ensure the `FarmSelector` and `MixReport` changes are solid.
- Verify `simulate-data.js` works manually.

## Task List
1.  [ ] **Server**: Update `server/package.json` scripts.
2.  [ ] **Server**: Verify `server/seed.sql` has Admin.
3.  [ ] **Frontend**: Refactor `AdminMapPage.jsx` to match `FarmerMapPage.jsx`.
4.  [ ] **Frontend**: Implement data prefetching in `Splash.jsx`.
5.  [ ] **Frontend**: Fix Carousel layout in `FarmerDashboard.jsx`.
6.  [ ] **Manual Verification**: Run setup and simulation manually to confirm fix.


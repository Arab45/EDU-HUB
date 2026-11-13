# Redux in EDU-HUB

This project uses Redux Toolkit for shared application state. Redux Toolkit is
already a project dependency, and `react-redux` provides the React `<Provider>`
and the `useSelector` / `useDispatch` hooks.

## How the pieces fit together

1. A **slice** owns one category of data and defines actions that update it.
2. The **store** combines the slice reducers into one app-wide state tree.
3. `<Provider>` in `src/main.jsx` makes that store available to the React app.
4. Components read state with `useSelector`.
5. Components request updates by dispatching an exported slice action with
   `useDispatch`.

Profile request state is registered at `state.profile` and defined in
`profileSlice.js`. After login, the app stores the API's `userId` in Redux;
the profile page uses that ID to call `fetchProfile(userId)` from
`src/services/auth.js`.

## Read Redux data in a component

`src/pages/profile.jsx` selects the profile object from the store:

```jsx
const { data: profile, status, error } = useSelector((state) => state.profile); // Select API profile data and request state.
```

The page dispatches `loadProfile(userId)` when it has an ID and the request is
idle. This thunk calls the existing service and stores the returned API data in
`state.profile.data`. Render loading and error states before reading profile
properties:

```jsx
if (status === "loading") return <p>Loading profile...</p>; // Let the user know the request is running.
if (status === "failed") return <p role="alert">{error}</p>; // Show the API error instead of fake profile data.
if (!profile) return <p>No profile data was returned.</p>; // Handle an empty API response.
return <p>{profile.name}</p>; // Render the name returned by the profile API.
```

When the slice changes, React Redux automatically re-renders components that
select the affected data.

The login handler expects `loginUser()` to return `{ userId: "..." }`. It saves
that non-secret ID to the profile slice and browser session storage, so a page
refresh can still fetch the profile. If your login API nests
the ID (for example, under `user.id`), update the `loginResult.userId` access
in `src/pages/login.jsx` to match the actual response.

## Update profile data from any component

Import the Redux hooks and the action in the component that needs to update the
profile:

```jsx
import { useDispatch } from "react-redux"; // Import the hook used to send actions to Redux.
import { profileUpdated } from "../context/profileSlice"; // Import the profile update action.

function EditProfileButton() { // Define a component that can change shared profile data.
  const dispatch = useDispatch(); // Get this component's dispatch function.
  const updateName = () => { // Define what should happen when the user requests a name change.
    dispatch(profileUpdated({ name: "Alex Researcher" })); // Update only the name; other profile fields stay unchanged.
  }; // Finish defining the click handler.
  return <button onClick={updateName}>Update name</button>; // Render a button that dispatches the update.
} // Finish defining the component.
```

Use the relative action import that matches the component's folder. For example,
from `src/pages/profile.jsx`, the import is
`../context/profileSlice`; from a component inside `src/components`, it is
`../context/profileSlice` as well.

`profileUserIdSet(userId)` stores the ID received after login. `loadProfile(userId)`
performs the API request and updates the profile data, status, and error state.
For locally editing profile fields, add an update reducer and dispatch its
action only when a corresponding edit flow is implemented.

## Add another kind of shared data

For posts, messages, or another data domain, create a separate slice in
`src/context` and register its reducer in `store.js`. It will then be available
under the key you choose in the store reducer map, for example
`state.posts` or `state.messages`. Components can select it with
`useSelector((state) => state.posts)` and update it by dispatching that slice's
actions.

Redux state is in memory by default, so it resets on a full page reload. Avoid
putting passwords or other secrets in Redux or browser storage. Fetching and
persisting backend data should be added when the API contract is available.

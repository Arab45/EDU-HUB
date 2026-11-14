import { configureStore } from "@reduxjs/toolkit"; // Import Redux Toolkit's recommended store creator.
import profileReducer from "./profileSlice"; // Import the reducer that manages profile data.
import followingReducer from "./followingSlice";

const store = configureStore({ // Create the single Redux store for the application.
  reducer: { // Register each state slice under a named key.
    profile: profileReducer, // Make profile state available as state.profile.
    following: followingReducer,
  }, // Finish registering reducers.
}); // Finish creating the Redux store.

export default store; // Export the store for the React Provider.

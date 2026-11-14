import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAllFollows } from "../services/social";
import { profileUserIdSet } from "./profileSlice";

function getId(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  const id = value?._id ?? value?.id ?? value?.userId;
  return id == null ? null : String(id);
}

async function loadAllFollowRelations() {
  const relations = [];
  let page = 1;
  let limit = 20;

  while (true) {
    const response = await fetchAllFollows(page, limit);
    const pageRelations = response?.relations;
    if (!Array.isArray(pageRelations)) {
      throw new Error("The follow-relations response did not include a relations array.");
    }

    relations.push(...pageRelations);
    const total = Number(response.total ?? pageRelations.length);
    const responseLimit = Number(response.limit ?? limit);
    if (!Number.isInteger(responseLimit) || responseLimit < 1) {
      throw new Error("The follow-relations response included an invalid limit.");
    }
    if (relations.length >= total || pageRelations.length === 0) break;

    limit = responseLimit;
    page += 1;
  }

  return relations;
}

export const loadFollowing = createAsyncThunk(
  "following/load",
  async (userId, { rejectWithValue }) => {
    try {
      const relations = await loadAllFollowRelations();
      const normalizedUserId = String(userId);
      return {
        userId: normalizedUserId,
        ids: [
          ...new Set(
            relations
              .filter(
                (relation) => getId(relation?.follower) === normalizedUserId
              )
              .map((relation) => getId(relation?.following))
              .filter(Boolean)
          ),
        ],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ??
          error.message ??
          "Unable to load your following list."
      );
    }
  },
  {
    condition: (userId, { getState }) => {
      const following = getState().following;
      return (
        String(following.userId ?? "") !== String(userId) ||
        following.status === "idle" ||
        following.status === "failed"
      );
    },
  }
);

const followingSlice = createSlice({
  name: "following",
  initialState: {
    userId: null,
    ids: [],
    status: "idle",
    error: null,
  },
  reducers: {
    followingStatusChanged(state, action) {
      const { userId, targetId, isFollowing } = action.payload;
      if (String(state.userId ?? "") !== String(userId)) {
        state.userId = String(userId);
        state.ids = [];
        state.status = "loaded";
      }

      const normalizedTargetId = String(targetId);
      state.ids = isFollowing
        ? [...new Set([...state.ids, normalizedTargetId])]
        : state.ids.filter((id) => id !== normalizedTargetId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(profileUserIdSet, (state, action) => {
        if (String(state.userId ?? "") !== String(action.payload)) {
          state.userId = null;
          state.ids = [];
          state.status = "idle";
          state.error = null;
        }
      })
      .addCase(loadFollowing.pending, (state, action) => {
        state.userId = String(action.meta.arg);
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadFollowing.fulfilled, (state, action) => {
        state.userId = action.payload.userId;
        state.ids = action.payload.ids;
        state.status = "loaded";
        state.error = null;
      })
      .addCase(loadFollowing.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { followingStatusChanged } = followingSlice.actions;
export default followingSlice.reducer;

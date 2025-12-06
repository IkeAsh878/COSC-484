import { createSlice } from "@reduxjs/toolkit";

const initialState = {editProfileModalOpen: false,
    editPostModalOpen: false,
    editPostId: "",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openEditProfileModal: state => {
            state.editProfileModalOpen = true;
        },
        closeEditProfileModal: state => {
            state.editProfileModalOpen = false;
        },
        openEditPostModal: (state, action) => {
            state.editPostModalOpen = true;
            state.editPostId = action.payload;
        },
        closeEditPostModal: state => {
            state.editPostModalOpen = false;
        },
    }
});

export const uiSliceActions = uiSlice.actions;
export default uiSlice;
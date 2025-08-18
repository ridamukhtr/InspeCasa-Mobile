// features/chat/chatSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ChatState {
  unseenCount: number;
  lastUnseenUpdate: string | null;
}

const initialState: ChatState = {
  unseenCount: 0,
  lastUnseenUpdate: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUnseenCount: (state, action: PayloadAction<number>) => {
      state.unseenCount = action.payload;
      state.lastUnseenUpdate = new Date().toISOString();
    },
    resetUnseenCount: state => {
      state.unseenCount = 0;
      state.lastUnseenUpdate = new Date().toISOString();
    },
    markMessagesAsSeen: state => {
      state.unseenCount = 0;
    },
  },
});

export const {setUnseenCount, markMessagesAsSeen, resetUnseenCount} =
  chatSlice.actions;
export default chatSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface JamState {
  invalidJam: boolean
  invalidEdit: boolean
}

const initialState: JamState = {
  invalidJam: true,
  invalidEdit: true,
}

const jamSlice = createSlice({
  name: 'jam',
  initialState,
  reducers: {
    setInvalidJam(state, action: PayloadAction<boolean>) {
      state.invalidJam = action.payload
    },
    setInvalidEdit(state, action: PayloadAction<boolean>) {
      state.invalidEdit = action.payload
    },
  },
})

export const { setInvalidJam, setInvalidEdit } = jamSlice.actions

export default jamSlice.reducer

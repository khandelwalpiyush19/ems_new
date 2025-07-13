// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Slices
import authReducer from "./Auth/authSlice";
import projectReducer from "./projectSlice";
import employeeReducer from "./employeeSlice";
import payrollReducer from "./payrollSlice";
import leaveReducer from "./leaveSlice";
import employeeLeaveReducer from "./employeeLeaveSlice";
import attendanceReducer from "./attendanceSlice";
import employeeDetailsReducer from './employeeDetailsSlice';
import notificationReducer from "./notificationSlice"
import forgotPasswordReducer from "./../context/forgotPasswordSlice"
import employeeTaskReducer from "./../context/employeeTaskSlice"

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  project: projectReducer,
  employees: employeeReducer,
  payroll: payrollReducer,
  leave: leaveReducer,
  employeeLeave: employeeLeaveReducer,
  attendance: attendanceReducer,
  employeeDetails: employeeDetailsReducer,
  notifications: notificationReducer,
  forgotPassword: forgotPasswordReducer,
  employeeTask: employeeTaskReducer
});

// Persistence configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Optional: persist only auth/user data
 whitelist: ['auth', 'employeeDetails']
 // Only persist `auth` slice, for login persistence
  // OR use `blacklist` if you want to persist everything *except* some slices
  // blacklist: ['payroll', 'attendance'], 
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;

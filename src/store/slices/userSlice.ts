import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User, Doctor, Patient, Allergy, Insurance } from "../../models/User";
import { TokenService } from "../../services/tokenService";
const initialState: { user: User | null, accessToken: string | null, refreshToken: string | null } = {
    user: null,
    accessToken: null,
    refreshToken: null
}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAccessToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
        },
        setRefreshToken(state, action: PayloadAction<string>) {
            state.refreshToken = action.payload;
        },
        setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        loadTokensFromStorage(state, action: PayloadAction<{ accessToken: string | null; refreshToken: string | null }>) {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        clearTokens(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
        },
        setMe(state, action: PayloadAction<User>) {
            let doctor: Doctor = {
                specialty: action.payload.doctor?.specialty ?? "",
                experienceYears: action.payload.doctor?.experienceYears ?? 0,
                bio: action.payload.doctor?.bio ?? "",
                examinationFee: action.payload.doctor?.examinationFee ?? 0,
                clinicAddress: action.payload.doctor?.clinicAddress ?? "",
                rating: action.payload.doctor?.rating ?? 0,
                certifications: action.payload.doctor?.certifications ?? []
            }
            let patient: Patient = {
                height: action.payload.patient?.height ?? 0,
                weight: action.payload.patient?.weight ?? 0,
                bloodType: action.payload.patient?.bloodType ?? "",
                bmi: action.payload.patient?.bmi ?? 0,
                insurances: action.payload.patient?.insurances ?? [],
                allergies: action.payload.patient?.allergies ?? []
            }
            if (state.user && state.user.role === 'DOCTOR' && action.payload.role === 'DOCTOR') {
                state.user.doctor = doctor
            } else if (state.user && state.user.role === 'PATIENT' && action.payload.role === 'PATIENT') {
                state.user.patient = patient
            }
            state.user = action.payload;
        }
    }
})

export const { setMe, setAccessToken, setRefreshToken, setTokens, loadTokensFromStorage, clearTokens } = userSlice.actions;

export const selectAccessToken = (state: RootState) => state.user.accessToken;

export default userSlice.reducer;
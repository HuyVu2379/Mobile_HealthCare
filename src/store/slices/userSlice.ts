import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User, Doctor, Patient, Allergy, Insurance } from "../../models/User";
import { TokenService } from "../../services/token.service";
const initialState: { user: User | null, accessToken: string | null, refreshToken: string | null, isLoggedIn: boolean } = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false
}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAccessToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            if (action.payload) {
                state.isLoggedIn = true;
            }
        },
        setRefreshToken(state, action: PayloadAction<string>) {
            state.refreshToken = action.payload;
        },
        setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            if (action.payload.accessToken) {
                state.isLoggedIn = true;
            }
        },
        loadTokensFromStorage(state, action: PayloadAction<{ accessToken: string | null; refreshToken: string | null }>) {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            if (action.payload.accessToken) {
                state.isLoggedIn = true;
            }
        },
        clearTokens(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.isLoggedIn = false;
        },
        setMe(state, action: PayloadAction<any>) {
            // API trả về flat object, cần map vào đúng structure
            const payload = action.payload;

            let doctor: Doctor | null = null;
            let patient: Patient | null = null;

            // Nếu là doctor, map doctor fields
            if (payload.role === 'DOCTOR') {
                doctor = {
                    specialty: payload.specialty ?? payload.doctor?.specialty ?? "",
                    experienceYears: payload.experienceYears ?? payload.doctor?.experienceYears ?? 0,
                    bio: payload.bio ?? payload.doctor?.bio ?? "",
                    examinationFee: payload.examinationFee ?? payload.doctor?.examinationFee ?? 0,
                    clinicAddress: payload.clinicAddress ?? payload.doctor?.clinicAddress ?? "",
                    rating: payload.rating ?? payload.doctor?.rating ?? 0,
                    certifications: payload.certifications ?? payload.doctor?.certifications ?? []
                }
            }

            // Nếu là patient, map patient fields
            if (payload.role === 'PATIENT') {
                patient = {
                    height: payload.height ?? payload.patient?.height ?? 0,
                    weight: payload.weight ?? payload.patient?.weight ?? 0,
                    bloodType: payload.bloodType ?? payload.patient?.bloodType ?? "",
                    bmi: payload.bmi ?? payload.patient?.bmi ?? 0,
                    insurances: payload.insurances ?? payload.patient?.insurances ?? [],
                    allergies: payload.allergies ?? payload.patient?.allergies ?? []
                }
            }

            state.user = {
                userId: payload.userId ?? null,
                email: payload.email ?? "",
                fullName: payload.fullName ?? "",
                gender: payload.gender ?? "",
                dob: payload.dob ?? new Date(),
                phone: payload.phone ?? "",
                address: payload.address ?? "",
                avatarUrl: payload.avatarUrl ?? "",
                role: payload.role ?? "",
                status: payload.status ?? "",
                doctor,
                patient
            };
            // Khi set user thì cũng đánh dấu là đã đăng nhập
            if (payload.userId) {
                state.isLoggedIn = true;
            }
        }
    }
})

export const { setMe, setAccessToken, setRefreshToken, setTokens, loadTokensFromStorage, clearTokens } = userSlice.actions;

export const selectAccessToken = (state: RootState) => state.user.accessToken;

export default userSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "@/src/redux/slices/adminSlice";
import teamReducer from "@/src/redux/slices/teamSlice";
import clientReducer from "@/src/redux/slices/clientSlice";
import taskReducer from "@/src/redux/slices/taskSlice";
import authReducer from "@/src/redux/slices/authSlice";
import leadReducer from "@/src/redux/slices/leadSlice";
import packageReducer from "@/src/redux/slices/packageSlice";
import userReducer from "@/src/redux/slices/userSlice";
import paymentReducer from "@/src/redux/slices/paymentSlice";
import subscriptionReducer from "@/src/redux/slices/subscriptionSlice";
import optionSetReducer from "@/src/redux/slices/optionSetSlice";
import uiSchemaReducer from "@/src/redux/slices/uiSchemaSlice";
import scheduleReducer from "@/src/redux/slices/scheduleSlice";
import companyReducer from "@/src/redux/slices/companySlice";
import attendanceReducer from "@/src/redux/slices/attendanceSlice";
import sopGroupReducer from "@/src/redux/slices/sopGroupSlice";
import sopPointReducer from "@/src/redux/slices/sopPointSlice";
import salaryReducer from "@/src/redux/slices/salarySlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        superadmin: adminReducer,
        team: teamReducer,
        clients: clientReducer,
        tasks: taskReducer,
        leads: leadReducer,
        packages: packageReducer,
        users: userReducer,
        payments: paymentReducer,
        subscription: subscriptionReducer,
        optionSet: optionSetReducer,
        uiSchema: uiSchemaReducer,
        schedule: scheduleReducer,
        payment: paymentReducer,
        companies: companyReducer,
        attendance: attendanceReducer,
        sopGroups: sopGroupReducer,
        sopPoints: sopPointReducer,
        salary: salaryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
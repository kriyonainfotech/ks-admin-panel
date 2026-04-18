import { axiosInstance } from "./apiConnector";
import { Team, TeamResponse, TeamsResponse } from "@/lib/teamdata";

const ENDPOINT = "api/users/team";

export const teamAPI = {
    // GET ALL TEAM MEMBERS
    getAllTeam: async (): Promise<TeamsResponse> => {
        const res = await axiosInstance.get(`${ENDPOINT}/all`);
        console.log(res.data, "res.data team service");
        return res.data;
    },

    // CREATE TEAM MEMBER
    createTeamMember: async (member: any): Promise<TeamResponse> => {
        const res = await axiosInstance.post(`${ENDPOINT}/create`, member);
        console.log(res.data, "res.data team service");
        return res.data;
    },

    // UPDATE TEAM MEMBER
    updateTeamMember: async (id: string, userId: string, data: Partial<Team> | FormData): Promise<TeamResponse> => {
        const res = await axiosInstance.put(`${ENDPOINT}/update/${id}`, data);
        console.log(res.data, "res.data team service");
        return res.data;
    },

    // DELETE TEAM MEMBER   
    deleteTeamMember: async (id: string): Promise<void> => {
        console.log(id, "id to delete----------------")
        const res = await axiosInstance.delete(`${ENDPOINT}/delete/${id}`);
        console.log(res.data, "res.data team service");
        return res.data;
    },

    // GET TEAM BY ID
    getTeamById: async (id: string): Promise<TeamResponse> => {
        const res = await axiosInstance.post(`${ENDPOINT}/ById`, { id });
        console.log(res.data, "res.data team service");
        return res.data;
    },

    resetTeamPassword: async (id: string, password: string): Promise<TeamResponse> => {
        const res = await axiosInstance.put(`${ENDPOINT}/resetPassword/${id}`, { password });
        return res.data;
    },
};

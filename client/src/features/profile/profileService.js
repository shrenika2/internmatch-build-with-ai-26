import API from '../../utils/api';

const profileService = {
    getMyProfile: async () => {
        const { data } = await API.get('/student-profile/me');
        return data;
    },
    upsertProfile: async (profileData) => {
        const { data } = await API.post('/student-profile/me', profileData);
        return data;
    },
    uploadResume: async (formData) => {
        const { data } = await API.post('/upload/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }
};

export default profileService;

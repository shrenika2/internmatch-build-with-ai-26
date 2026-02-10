import API from '../../utils/api';

const profileService = {
    getMyProfile: async () => {
        const { data } = await API.get('/student-profile/me');
        return data;
    },
    upsertProfile: async (profileData) => {
        const { data } = await API.post('/student-profile/me', profileData);
        return data;
    }
};

export default profileService;

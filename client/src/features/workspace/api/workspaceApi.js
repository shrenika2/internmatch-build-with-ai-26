import API from '../../../utils/api';

export const workspaceApi = {
  // Workspace API (mounted at /api/workspace)
  getMyWorkspace: async () => {
    try { return await API.get('/workspace/my'); }
    catch (e) { console.error('API Error /workspace/my:', e); throw e; }
  },

  getChannels: async (communityId) => {
    try { return await API.get('/workspace/channels', { params: { communityId } }); }
    catch (e) { console.error('API Error /workspace/channels:', e); throw e; }
  },

  createChannel: async (data) => {
    try { return await API.post('/workspace/channels', data); }
    catch (e) { console.error('API Error createChannel:', e); throw e; }
  },

  getMessages: async (channelId) => {
    try { return await API.get(`/workspace/messages/${channelId}`); }
    catch (e) { console.error('API Error getMessages:', e); throw e; }
  },

  sendMessage: async (channelId, data) => {
    try { return await API.post(`/workspace/messages/${channelId}`, data); }
    catch (e) { console.error('API Error sendMessage:', e); throw e; }
  },

  createGroup: async (data) => {
    try { return await API.post('/workspace/groups', data); }
    catch (e) { console.error('API Error createGroup:', e); throw e; }
  },

  // Community API (mounted at /api/workspace/community)
  createCommunity: async (data) => {
    try { return await API.post('/workspace/community', data); }
    catch (e) { console.error('API Error createCommunity:', e); throw e; }
  },

  getCommunities: async () => {
    try { return await API.get('/workspace/community'); }
    catch (e) { console.error('API Error getCommunities:', e); throw e; }
  },

  deleteCommunity: async (id, userId) => {
    try { return await API.delete(`/workspace/community/${id}`, { data: { userId } }); }
    catch (e) { console.error('API Error deleteCommunity:', e); throw e; }
  },

  requestJoin: async (communityId, requesterId) => {
    try { return await API.post(`/workspace/community/${communityId}/request`, { requesterId }); }
    catch (e) { console.error('API Error requestJoin:', e); throw e; }
  },

  getJoinRequests: async (communityId, userId) => {
    try { return await API.get(`/workspace/community/${communityId}/requests?userId=${userId}`); }
    catch (e) { console.error('API Error getRequests:', e); throw e; }
  },

  processRequest: async (communityId, requestId, action, userId) => {
    try { return await API.put(`/workspace/community/${communityId}/request/${requestId}`, { action, userId }); }
    catch (e) { console.error('API Error processRequest:', e); throw e; }
  },

  uploadFile: async (formData) => {
    try { return await API.post('/workspace/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); }
    catch (e) { console.error('API Error uploadFile:', e); throw e; }
  }
};

const API_BASE = '/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('cdar_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Erreur réseau' }));
    throw new Error(errorData.detail || 'Une erreur est survenue');
  }

  return response.json();
}

// Authentification
export const apiLogin = (login, password) => 
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ login, password }) });

export const apiRegisterFan = (data) => 
  apiRequest('/auth/register/fan', { method: 'POST', body: JSON.stringify(data) });

export const apiRegisterArtist = (data) => 
  apiRequest('/auth/register/artist', { method: 'POST', body: JSON.stringify(data) });

export const apiGetMe = () => 
  apiRequest('/auth/me');

export const apiUpdateProfile = (data) => 
  apiRequest('/auth/me', { method: 'PUT', body: JSON.stringify(data) });

// Publications & Feed
export const apiGetFeed = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append('query', params.query);
  if (params.content_type) queryParams.append('content_type', params.content_type);
  if (params.artist_id) queryParams.append('artist_id', params.artist_id);
  if (params.visibility) queryParams.append('visibility', params.visibility);
  const qs = queryParams.toString();
  return apiRequest(`/posts/feed${qs ? `?${qs}` : ''}`);
};

export const apiGetArtists = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append('query', params.query);
  if (params.category) queryParams.append('category', params.category);
  const qs = queryParams.toString();
  return apiRequest(`/posts/artists${qs ? `?${qs}` : ''}`);
};

export const apiCreatePost = (postData) => 
  apiRequest('/posts/', { method: 'POST', body: JSON.stringify(postData) });

// Abonnements & Paliers
export const apiGetArtistTiers = (artistId) => 
  apiRequest(`/subscriptions/artist/${artistId}/tiers`);

export const apiUpdateMyTiers = (tiers) => 
  apiRequest('/subscriptions/my-tiers', { method: 'PUT', body: JSON.stringify(tiers) });

export const apiGetMySubscriptions = () => 
  apiRequest('/subscriptions/my-subscriptions');

// Passerelle de Paiement Mobile Money & Cartes
export const apiCheckout = (payload) => 
  apiRequest('/payments/checkout', { method: 'POST', body: JSON.stringify(payload) });

export const apiMockCheckout = apiCheckout;

export const apiSendTip = (payload) => 
  apiRequest('/payments/tip', { method: 'POST', body: JSON.stringify(payload) });

// Portefeuille & Retraits
export const apiGetWalletBalance = () => 
  apiRequest('/wallet/balance');

export const apiGetTransactions = () => 
  apiRequest('/wallet/transactions');

export const apiRequestPayout = (payoutData) => 
  apiRequest('/wallet/payout-request', { method: 'POST', body: JSON.stringify(payoutData) });

export const apiGetPayoutHistory = () => 
  apiRequest('/wallet/payouts');

export const apiGetArtistAnalytics = () => 
  apiRequest('/wallet/analytics');

// Administration & Modération
export const apiGetPendingArtists = () =>
  apiRequest('/admin/pending-artists');

export const apiApproveArtist = (artistId) =>
  apiRequest(`/admin/approve-artist/${artistId}`, { method: 'POST' });

export const apiRejectArtist = (artistId) =>
  apiRequest(`/admin/reject-artist/${artistId}`, { method: 'POST' });

export const apiGetPlatformStats = () =>
  apiRequest('/admin/stats');

export const apiGetAdminPosts = (params = {}) => {
  const q = new URLSearchParams();
  if (params.status) q.append('status', params.status);
  if (params.search) q.append('search', params.search);
  if (params.artist_id) q.append('artist_id', params.artist_id);
  const qs = q.toString();
  return apiRequest(`/admin/posts${qs ? `?${qs}` : ''}`);
};

export const apiModeratePost = (postId, payload) =>
  apiRequest(`/admin/posts/${postId}/moderate`, { method: 'POST', body: JSON.stringify(payload) });

export const apiDeletePostAdmin = (postId) =>
  apiRequest(`/admin/posts/${postId}`, { method: 'DELETE' });

export const apiGetAdminLives = () =>
  apiRequest('/admin/lives');

export const apiInterveneLive = (liveId, payload) =>
  apiRequest(`/admin/lives/${liveId}/intervene`, { method: 'POST', body: JSON.stringify(payload) });

export const apiGetArtistsRevenues = () =>
  apiRequest('/admin/artists/revenues');

export const apiGetArtistsRanking = (params = {}) => {
  const q = new URLSearchParams();
  if (params.sort_by) q.append('sort_by', params.sort_by);
  if (params.category) q.append('category', params.category);
  if (params.country) q.append('country', params.country);
  if (params.kyc_status) q.append('kyc_status', params.kyc_status);
  const qs = q.toString();
  return apiRequest(`/posts/artists/ranking${qs ? `?${qs}` : ''}`);
};

// Lives & Directs
export const apiGetActiveLives = () =>
  apiRequest('/lives/active');

export const apiGetLiveDetail = (liveId) =>
  apiRequest(`/lives/${liveId}`);

export const apiCreateLive = (data) =>
  apiRequest('/lives', { method: 'POST', body: JSON.stringify(data) });

export const apiStartLive = (liveId) =>
  apiRequest(`/lives/${liveId}/start`, { method: 'POST' });

export const apiStopLive = (liveId) =>
  apiRequest(`/lives/${liveId}/stop`, { method: 'POST' });

export const apiPurchaseLiveTicket = (liveId, data) =>
  apiRequest(`/lives/${liveId}/ticket`, { method: 'POST', body: JSON.stringify(data) });

export const apiGetLiveMessages = (liveId) =>
  apiRequest(`/lives/${liveId}/messages`);

export const apiSendLiveMessage = (liveId, content) =>
  apiRequest(`/lives/${liveId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });

export const apiSendLiveTip = (liveId, data) =>
  apiRequest(`/lives/${liveId}/tip`, { method: 'POST', body: JSON.stringify(data) });

// Messagerie Directe VIP
export const apiGetConversations = () =>
  apiRequest('/messaging/conversations');

export const apiCheckMessagingEligibility = (artistId) =>
  apiRequest(`/messaging/eligibility/${artistId}`);

export const apiGetConversationMessages = (conversationId) =>
  apiRequest(`/messaging/conversations/${conversationId}/messages`);

export const apiSendDirectMessage = (targetId, data) =>
  apiRequest(`/messaging/${targetId}/send`, { method: 'POST', body: JSON.stringify(data) });

// Communauté & Fan Club Officiel Artiste
export const apiGetMyCommunity = () =>
  apiRequest('/community/my-community');

export const apiCreateCommunity = (data) =>
  apiRequest('/community/create', { method: 'POST', body: JSON.stringify(data) });

export const apiUpdateCommunitySettings = (data) =>
  apiRequest('/community/settings', { method: 'PUT', body: JSON.stringify(data) });

export const apiCreateCommunityAnnouncement = (data) =>
  apiRequest('/community/announcements', { method: 'POST', body: JSON.stringify(data) });

export const apiDeleteCommunityAnnouncement = (announcementId) =>
  apiRequest(`/community/announcements/${announcementId}`, { method: 'DELETE' });

export const apiCreateCommunityPoll = (data) =>
  apiRequest('/community/polls', { method: 'POST', body: JSON.stringify(data) });

export const apiVoteCommunityPoll = (pollId, optionId) =>
  apiRequest(`/community/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ option_id: optionId }) });

export const apiManageCommunityMember = (memberId, data) =>
  apiRequest(`/community/members/${memberId}/manage`, { method: 'PUT', body: JSON.stringify(data) });

export const apiJoinCommunity = (communityId) =>
  apiRequest(`/community/${communityId}/join`, { method: 'POST' });



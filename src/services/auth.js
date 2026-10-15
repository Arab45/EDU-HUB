async function signup({ userData }) {
    const response = await axios.post('/api/signup', { ...userData });
    return response.data;
}

async function researcherStepOne({ userData }) {
    const response = await axios.post('/api/researcher/step-one', { ...userData });
    return response.data;
}

async function researcherStepTwo({ userData }) {
    const response = await axios.post('/api/researcher/step-two', { ...userData });
    return response.data;
}

async function fetchUserProfile(userId) {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
}

async function login({ credentials }) {
    const response = await axios.post('/api/login', { ...credentials });
    return response.data;
}

async function logout() {
    const response = await axios.post('/api/logout');
    return response.data;
}

async function forgetPassword({ email }) {
    const response = await axios.post('/api/forget-password', { email });
    return response.data;
}

async function resetPassword({ credentials }) {
    const response = await axios.post('/api/reset-password', { ...credentials });
    return response.data;
}


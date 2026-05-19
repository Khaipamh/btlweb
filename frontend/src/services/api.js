import axios from 'axios';

const api = axios.create({
    // Sử dụng biến môi trường cho URL API
    baseURL: import.meta.env.VITE_API_URL || '', 
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor phản hồi để đơn giản hóa việc xử lý dữ liệu
api.interceptors.response.use(
    (response) => {
        const res = response.data; 

        // Nếu cấu trúc chuẩn { success: true, data: [...], meta: {...} }
        if (res && res.success === true && res.data) {
            const output = res.data;
            
            // Gắn meta vào mảng đầu ra nếu có
            if (Array.isArray(output) && res.meta) {
                output.meta = res.meta;
            }
            
            return output; 
        }

        // Trả về phản hồi thô cho các trường hợp khác
        return res; 
    },
    (error) => Promise.reject(error)
);


export default api;
import axios from 'axios';
import { BASE_URI } from './config';
import store from '../redux/store';
import { clearToken } from '../redux/reducer/authSlice';

const axiosInstance = axios.create({
  baseURL: BASE_URI,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearToken());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
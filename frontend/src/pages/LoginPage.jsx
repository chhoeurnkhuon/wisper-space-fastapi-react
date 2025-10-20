import axios from "axios";
import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from "react";
import { setToken } from "../redux/reducer/authSlice";
import {useDispatch} from 'react-redux';

function LoginPage() {
  const BASE_URI = import.meta.env.VITE_BASE_URI;
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    data.append("username", formData.username);
    data.append("password", formData.password);

    try {
      const response = await axios.post(`${BASE_URI}auth/login`,
        data
        , {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });

      const { access_token } = response.data;
      alert("Login successfull");
      console.log("Login successful. Token:", access_token);

      dispatch(setToken(access_token));

      setFormData({
        username: '',
        password: ''
      });
      
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Box component='form' onSubmit={handleLogin}>
        <Typography sx={{ fontSize: 30, textAlign: 'center' }}>Login</Typography>
        <TextField
          name="username"
          label="Username"
          variant="outlined"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          fullWidth
        />
        <TextField
          name="password"
          label="Password"
          variant="outlined"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          fullWidth
        />

        <Button type="submit" variant="contained" fullWidth>Login</Button>
      </Box>
    </Box>
  )
}

export default LoginPage;

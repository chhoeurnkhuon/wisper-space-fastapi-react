import axios from "axios";
import { useState } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";

function RegisterPage() {
    const BASE_URI = import.meta.env.VITE_BASE_URI;

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${BASE_URI}auth/register`,
                formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            }
            );
            alert("User has been created");
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Box>
                <Box component='form' onSubmit={handleRegister}>
                    <Typography sx={{ fontSize: 30, textAlign: 'center' }}>Register</Typography>
                    <TextField
                        name='username'
                        label='Username'
                        variant='outlined'
                        value={formData.username}
                        onChange={handleChange}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        name='email'
                        label='Email'
                        variant='outlined'
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        name='password'
                        type="password"
                        label='Password'
                        variant='outlined'
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        fullWidth
                    />
                    <Button variant="contained" type="submit" fullWidth>Submit</Button>
                </Box>
            </Box>
        </Box>
    )
}

export default RegisterPage

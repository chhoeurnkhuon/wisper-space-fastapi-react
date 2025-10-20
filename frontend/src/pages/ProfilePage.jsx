import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import {Box} from '@mui/material';

function ProfilePage() {
    const token = useSelector((state) => state.auth.token);

    const [user, setUser] = useState();
    const BASE_URI = import.meta.env.VITE_BASE_URI;

    const fetchProfile = async () => {
        const res = await axios.get(`${BASE_URI}users/me`,
            {
            headers: {
                Authorization: `Bearer ${token}`
            },
            
        });
        setUser(res.data);
    }

    useEffect(()=> {
        fetchProfile();
    }, []);

    return (
        <div>
            <Box >

            </Box>
        </div>
    )
}

export default ProfilePage

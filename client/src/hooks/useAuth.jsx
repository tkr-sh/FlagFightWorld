import { useState, useEffect } from 'react';

const useAuth = () => {
    // state to store the token
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        // Get the token from localstorage
        const tokenFromStorage = localStorage.getItem('token');
        console.log("UseAuth")
        console.log(tokenFromStorage)
        setToken(tokenFromStorage);
    }, []);

    // Function to send the token with the headers of your fetch requests
    const authFetch = async (url, options = {}) => {

        console.log(options)

        // Add the token to the headers of the options object
        options.headers = options.headers || {};
        // options.headers.Authorization = `Bearer ${token}`;
        // options.headers.Authorization = `${token}`;
        options.headers.Authorization = `Basic ${token}`;

        // Send the fetch request with the updated headers
        const response = await fetch(url, options);
        return response.json();
    };

    return { token, authFetch };
}


export default useAuth;












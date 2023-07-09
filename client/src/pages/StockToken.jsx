import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


// StockToken
const StockToken = () => {
    // Hooks
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Get the token in the URL
        const token = searchParams.get('token');
        // Put the token in the localStorage
        localStorage.setItem('token', token);
        // Go to the Root
        navigate('/');
    }, []);

    // Return nothing
    return <div></div>
}


// Export
export default StockToken;
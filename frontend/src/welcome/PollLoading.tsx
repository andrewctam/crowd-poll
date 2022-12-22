
import {useEffect} from 'react';
import { useNavigate } from 'react-router';


interface PollLoadingProps {
    dispatch: React.Dispatch<any>
}

function PollLoading(props: PollLoadingProps) {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate("/");
        }, 10000);

        return () => clearTimeout(timeout);

    // eslint-disable-next-line 
    }, []) 


    return null;
}

export default PollLoading;
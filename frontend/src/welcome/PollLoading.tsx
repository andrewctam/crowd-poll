
import {useEffect} from 'react';
import { useNavigate } from 'react-router';

import { AddAlert } from '../hooks/useAlert';

interface PollLoadingProps {
    addAlert: AddAlert
}

function PollLoading(props: PollLoadingProps) {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            props.addAlert("Returned to Home Page", 1000, "error");
            navigate("/");
        }, 2000);

        return () => clearTimeout(timeout);

    // eslint-disable-next-line 
    }, []) 


    return null;
}

export default PollLoading;
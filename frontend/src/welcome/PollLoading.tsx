
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertAction } from '../hooks/useAlert';


interface PollLoadingProps {
    dispatch: React.Dispatch<AlertAction>
}

function PollLoading(props: PollLoadingProps) {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            props.dispatch({type: "ADD_ALERT", payload: {
                msg: "Error loading poll",
                time: 1000,
                type: "error"
            }});
            
            navigate("/");
        }, 10000);

        return () => clearTimeout(timeout);

    // eslint-disable-next-line 
    }, []) 


    return null;
}

export default PollLoading;
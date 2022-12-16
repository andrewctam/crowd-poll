
import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router';

interface PollLoadingProps {
    addAlert: (str: string, time: number, msg?: string) => void
}

function PollLoading(props: PollLoadingProps) {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            props.addAlert("Poll not found", 1000, "error");
            navigate("/");
        }, 2000);

        return () => clearTimeout(timeout);
    }, []) 


    return null;
}

export default PollLoading;
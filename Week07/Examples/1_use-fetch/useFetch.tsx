import React, {useState, useEffect} from 'react';

type UseFetchProps = {
    url: string
}

export function useFetch<T>({url}: UseFetchProps) {
    const [data, setData] = useState<T[]>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        async function getData() {
            setIsLoading(true);
            try {
                const response = await fetch(url);
                const responseData = await response.json();
                setData(responseData);
            } catch (error) {
                if (error instanceof Error) setError(error.message);
                else setError("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }
        getData();
    }, [url])

    return {data, error, isLoading}
}
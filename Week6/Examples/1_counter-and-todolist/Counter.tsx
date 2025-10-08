import React, {useState, useEffect} from 'react';

type CounterProptery = {
    name: string
}

export const Counter: React.FC<CounterProptery> = (props) => {
    const { name } = props;
    const [count, setCount] = useState<number>(() => {
        const count = localStorage.getItem(name);
        return count ? Number(count) : 0; 
    });

    // runs everytime counter changes
    useEffect(() => {
        localStorage.setItem(name, count.toString());
    }, [count])

    return (
        <div>
            <input type="button" value="increment" onClick={() => setCount(count + 1)}/>
            Counter ({name}): {count}
        </div>
    )
}
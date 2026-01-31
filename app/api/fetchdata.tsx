import {useState, useEffect} from 'react';

const URL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15"

function SampleApi(){

    const [temp, setTemp] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetch(URL)
            result.json().then(json => {
                console.log(json);
                setTemp(json.current.temp_c)
            })
        }
        fetchData();
    })

    return(
<div>
    Philippines Temp Now: {temp}F
</div>

    );
}

export default SampleApi
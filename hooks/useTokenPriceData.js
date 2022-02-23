import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINT } from "../constants";

const useTokenPriceData = () =>
{
    const [tokenPrices, setTokenPrices] = useState(null);

    const fetchPriceData = async () =>
    {
        const result = await axios.get(API_BASE_URL+API_ENDPOINT);
        setTokenPrices(result.data);
    }

    useEffect(fetchPriceData, []);

    return { tokenPrices };
}

export default useTokenPriceData;

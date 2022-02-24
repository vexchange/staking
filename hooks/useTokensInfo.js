import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINT } from "../constants";

const useTokensInfo = () =>
{
    const [tokensInfo, setTokensInfo] = useState(null);

    const fetchPriceData = async () =>
    {
        try
        {
            const result = await axios.get(API_BASE_URL+API_ENDPOINT);
            setTokensInfo(result.data);
        }
        catch (err)
        {
            console.error("Error fetching from API", err);  
        }
    }

    useEffect(fetchPriceData, []);

    return { tokensInfo };
}

export default useTokensInfo;

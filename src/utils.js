import axios from "axios";

export const GetIpfsUrlFromPinata = async (pinataUrl) => {
    // console.log("pinataUrl", pinataUrl)
    // var IPFSUrl = pinataUrl.split("/");
    // const lastIndex = IPFSUrl.length;

    // // Change to a CORS-enabled gateway
    // IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];

    // // Log the generated IPFS URL
    // console.log("Generated IPFS URL:", IPFSUrl);

    // Fallback mechanism
    const result = await axios.get(pinataUrl);
    // console.log("result", result);
    return result.data;
};



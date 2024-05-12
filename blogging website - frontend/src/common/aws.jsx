import axios from "axios";

export const uploadImage = async (img) =>{

    let imgUrl = null;

    // console.log(import.meta.env.VITE_SERVER_DOMAIN+"/get-upload-url")
    
    await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
    .then( async ({data: {uploadUrl}}) => {

        await axios({
            method: 'PUT',
            url: uploadUrl,
            headers: {'Content-type':'multipart/form-data'},
            data: img
        })
        .then(() =>{
            // console.log(uploadUrl)
            imgUrl = uploadUrl.split("?")[0]
        })

    })

    return imgUrl;

}
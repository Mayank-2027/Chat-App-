import {v2 as cloudinary} from 'cloudinary';

import dotenv from'dotenv';

dotenv.config();



    cloudinary.config({ 
        cloud_name: 'devvps0ss', 
        api_key: '626245476849699', 
        api_secret: process.env.CLOUDINARY_SECRETKEY // Click 'View API Keys' above to copy your API secret
    });
   
    export default cloudinary;
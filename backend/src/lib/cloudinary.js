import {v2 as cloudinary} from 'cloudinary';

import dotenv from'dotenv';

dotenv.config();



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'devvps0ss', 
    api_key: process.env.CLOUDINARY_API_KEY || '626245476849699', 
    api_secret: process.env.CLOUDINARY_SECRETKEY || 'Lfzii4KdOzmAifeg9rR1MSytpwk'
});

   
    export default cloudinary;
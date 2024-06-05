const AWS = require('aws-sdk')
const { v4 } = require('uuid');

exports.generatePresignedUrl = async (req, res, next) => {
        const { fileName } = req.params
        const BUCKET = process.env.BUCKET;
        const IAM_USER_KEY = process.env.IAM_USER_KEY;
        const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
        const myKey = `${v4()}-${fileName}`
        console.log(myKey, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        const s3 = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
            signatureVersion: 'v4',
            region: 'eu-north-1'
        });

        const params = {
            Bucket: BUCKET,
            Key: myKey,
            Expires: 60 * 2
        };

        try {
            const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
            res.status(200).json({ success: true, url: presignedUrl })
        } catch (error) {
            console.log(error)
            res.status(400).json('Failed to upload file')
        }
};




















async function uploadFile(category) {
    // Create a hidden input element of type file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none'; // Hide the input element

    // Add event listener to handle file selection
    fileInput.addEventListener('change', async function () {
        const file = fileInput.files[0];

        // Check if file is selected
        if (!file) {
            console.error('No file selected.');
            return;
        }

        // Get the file extension (consider more robust validation)
        const extension = file.name.split('.').pop().toLowerCase();

        // Get the file's content type (optional, server may infer)
        const contentType = file.type;

        try {
            // Fetch presigned URL from backend
            const token = localStorage.getItem('token');
            const response = await axios.get(`${URL}/presigned-url?category=${category}&extension=${extension}&contentType=${contentType}`, { headers: { 'Authorization': token } });
            const presignedUrl = response.data.url;

            // Upload file to S3 using presigned URL
            await axios.put(presignedUrl, file, { headers: { 'Content-Type': contentType } }); // Use retrieved content type if available

            // Send file metadata to backend
            const obj = {
                filename: file.name,
                url: presignedUrl,
                // Add more properties as needed (e.g., size)
            };
            await axios.post(`${URL}/send-${category}-message`, obj, { headers: { 'Authorization': token } });

            console.log('File uploaded successfully.');
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    });

    // Trigger a click on the input element to open the file picker dialog
    fileInput.click();
}

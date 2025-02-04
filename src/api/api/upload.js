import { PinataClient } from '@pinata/sdk';

const pinata = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileBuffer = req.body.file; // Assuming the file is sent as a buffer
    const options = {
      pinataMetadata: {
        name: req.body.name || 'file', // Optional: Add metadata
      },
    };

    const result = await pinata.pinFileToIPFS(fileBuffer, options);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
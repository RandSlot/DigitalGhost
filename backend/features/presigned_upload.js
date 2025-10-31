const express = require('express')
const router = express.Router()
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials:{
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
})

router.get('/presigned', async (req,res)=>{
  try{
    const { filename, contentType } = req.query
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: filename,
      ContentType: contentType
    })
    const url = await s3.getSignedUrl(command, { expiresIn: 60*5 })
    res.json({ ok:true, url })
  } catch(e){ console.error(e); res.status(500).json({ok:false, error:e.message}) }
})

module.exports = router
const express = require('express')
const router = express.Router()

router.post('/init', (req,res)=>{
  // Example invoice structure for Telegram Payments API
  const { title, price, currency, payload } = req.body
  res.json({
    ok:true,
    invoice:{
      title: title || 'Demo Car Sale',
      description: 'Invoice for car purchase',
      payload: payload || 'demo_payload',
      currency: currency || 'RUB',
      prices:[{label:'Car', amount: price || 1000000}]
    }
  })
})

module.exports = router
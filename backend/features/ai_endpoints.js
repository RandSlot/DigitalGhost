const express = require('express')
const router = express.Router()
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

router.post('/price', async (req, res) => {
  try {
    const { title, km, description } = req.body
    const prompt = `Предложи рыночную цену в рублях для автомобиля с названием: ${title}, пробег: ${km} км, описание: ${description}`
    const gpt = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
    res.json({ ok:true, suggested_price: gpt.choices[0].message.content.trim() })
  } catch(e){ console.error(e); res.status(500).json({ ok:false, error: e.message }) }
})

router.post('/description', async (req,res)=>{
  try{
    const { title, price, km } = req.body
    const prompt = `Составь короткое продающее описание для автомобиля "${title}", цена: ${price} ₽, пробег: ${km} км.`
    const gpt = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages:[{role:'user', content:prompt}],
      temperature:0.7
    })
    res.json({ ok:true, description: gpt.choices[0].message.content.trim() })
  } catch(e){ console.error(e); res.status(500).json({ok:false, error:e.message}) }
})

module.exports = router
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { Pool } = require('pg')
const upload = multer({ dest: 'uploads/' })
const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/autospace'
})

// simple endpoints
app.get('/health', (req,res)=> res.json({ ok:true }))

app.post('/auth/telegram', (req,res) => {
  // demo: accept payload and respond with user
  return res.json({ ok:true, user: { id: 1, name: req.body.name || 'Demo User', telegram_id: req.body.telegram_id || 0 }})
})

app.get('/cars', async (req,res) => {
  try {
    const r = await pool.query('SELECT id, title, price, km, created_at FROM cars ORDER BY created_at DESC LIMIT 100')
    res.json({ ok:true, cars: r.rows })
  } catch (e) {
    console.error(e); res.status(500).json({ ok:false, error: 'db error' })
  }
})

app.get('/cars/:id', async (req,res) => {
  try {
    const r = await pool.query('SELECT * FROM cars WHERE id=$1', [req.params.id])
    if(r.rows.length===0) return res.status(404).json({ ok:false })
    res.json({ ok:true, car: r.rows[0] })
  } catch (e) { console.error(e); res.status(500).json({ ok:false }) }
})

app.post('/cars', upload.array('media'), async (req,res) => {
  try {
    const { title, price, km, description } = req.body
    const r = await pool.query('INSERT INTO cars(title, price, km, description) VALUES($1,$2,$3,$4) RETURNING id', [title, price || 0, km || 0, description || ''])
    res.json({ ok:true, id: r.rows[0].id })
  } catch (e) {
    console.error(e); res.status(500).json({ ok:false, error: 'insert error' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, ()=> console.log('Backend listening on http://localhost:'+port))

import React, { useState } from 'react'

export default function CreateListing({ apiBase }) {
  const [title, setTitle] = useState('')
  const [km, setKm] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  const handleGenerateAI = async () => {
    setStatus('Запрос AI...')
    try {
      const priceRes = await fetch(`${apiBase}/ai/price`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({title, km, description})
      })
      const priceData = await priceRes.json()
      setPrice(priceData.suggested_price)

      const descRes = await fetch(`${apiBase}/ai/description`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({title, price: priceData.suggested_price, km})
      })
      const descData = await descRes.json()
      setDescription(descData.description)
      setStatus('AI подсказка готова!')
    } catch(e){ setStatus('Ошибка AI: '+e.message) }
  }

  const handleUpload = async () => {
    if(!file) return alert('Выберите файл')
    setStatus('Генерируем presigned URL...')
    try {
      const res = await fetch(`${apiBase}/media/presigned?filename=${file.name}&contentType=${file.type}`)
      const data = await res.json()
      if(!data.ok) throw new Error('Presigned URL ошибка')
      await fetch(data.url, { method:'PUT', body:file, headers:{'Content-Type':file.type} })
      setStatus('Файл загружен!')
    } catch(e){ setStatus('Ошибка загрузки: '+e.message) }
  }

  const handleSubmit = async () => {
    setStatus('Создание объявления...')
    try {
      const res = await fetch(`${apiBase}/cars`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ title, km, price, description })
      })
      const data = await res.json()
      if(data.ok) setStatus('Объявление создано! ID: '+data.id)
    } catch(e){ setStatus('Ошибка создания: '+e.message) }
  }

  return (
    <div style={{padding:20, maxWidth:500, margin:'auto', background:'#111', color:'#fff', borderRadius:10}}>
      <h3>Создать объявление</h3>
      <input placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', marginBottom:8}}/>
      <input placeholder="Пробег" value={km} onChange={e=>setKm(e.target.value)} style={{width:'100%', marginBottom:8}}/>
      <textarea placeholder="Описание (опционально)" value={description} onChange={e=>setDescription(e.target.value)} style={{width:'100%', marginBottom:8}}/>
      <input type="file" onChange={e=>setFile(e.target.files[0])} style={{marginBottom:8}}/>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <button onClick={handleGenerateAI}>AI Подсказка</button>
        <button onClick={handleUpload}>Загрузить файл</button>
        <button onClick={handleSubmit}>Создать</button>
      </div>
      <div style={{opacity:0.8}}>{status}</div>
      <div style={{marginTop:12}}>
        <strong>Цена:</strong> {price}<br/>
        <strong>Описание:</strong> {description}
      </div>
    </div>
  )
}
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Reflector, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'

function CarPlaceholder({ color }) {
  return (
    <group>
      <mesh position={[0,0.4,0]}>
        <boxGeometry args={[2.2,0.8,1]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0,0.75,0]}>
        <boxGeometry args={[1.6,0.02,0.9]} />
        <meshStandardMaterial color={'#000'} />
      </mesh>
    </group>
  )
}

function Platform({ index, activeIndex, xOffset }) {
  const ref = useRef()
  useFrame((state, delta) => {
    if(ref.current) ref.current.rotation.y += 0.25 * delta
    const targetY = activeIndex === index ? 0.12 : 0
    ref.current.position.y += (targetY - ref.current.position.y) * 0.12
    ref.current.position.x += (xOffset - ref.current.position.x) * 0.12
  })
  const colors = ['#ff3b30','#4b5563','#7c3aed','#00d4ff']
  return (
    <group ref={ref} position={[index*3,0,0]}>
      <mesh rotation-x={-Math.PI/2} position={[0,-0.02,0]}>
        <cylinderGeometry args={[1.6,1.6,0.2,64]} />
        <meshStandardMaterial metalness={0.6} roughness={0.2} color={'#0b1220'} />
      </mesh>
      <group position={[0,0,0]}>
        <CarPlaceholder color={colors[index % colors.length]} />
      </group>
    </group>
  )
}

function Scene({ activeIndex, xOffset }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <spotLight intensity={1.2} angle={0.4} position={[5,8,5]} penumbra={0.5} />
      <pointLight intensity={0.5} position={[-5,3,-5]} />
      <Reflector blur={[400,100]} resolution={1024} args={[20,20]} mirror={0.2} mixBlur={2} rotation-x={-Math.PI/2} position={[0,-0.001,0]}>
        {(Material, props) => <Material color="#0f1724" metalness={0.5} roughness={0.6} {...props} />}
      </Reflector>
      <group position={[0,0,0]}>
        <Platform index={0} activeIndex={activeIndex} xOffset={xOffset} />
        <Platform index={1} activeIndex={activeIndex} xOffset={xOffset} />
        <Platform index={2} activeIndex={activeIndex} xOffset={xOffset} />
        <Platform index={3} activeIndex={activeIndex} xOffset={xOffset} />
      </group>
    </>
  )
}

export default function App(){
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState('race') // 'race' or 'list'
  const [audioOn, setAudioOn] = useState(true)
  const [xOffset, setXOffset] = useState(0)
  const tg = typeof window !== 'undefined' && window.Telegram ? window.Telegram.WebApp : null

  useEffect(()=>{
    // animate camera-like offset on active change
    gsap.to({}, {duration:0.5, onUpdate: ()=> setXOffset(-active*3)})
  }, [active])

  useEffect(()=>{
    // Telegram WebApp init if present
    if(tg && tg.init) {
      try { tg.expand(); tg.MainButton.hide(); } catch(e){}
    }
  }, [tg])

  // simple keyboard swipe handlers
  useEffect(()=>{
    function onKey(e){
      if(e.key === 'ArrowRight') setActive(v => Math.min(3, v+1))
      if(e.key === 'ArrowLeft') setActive(v => Math.max(0, v-1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // touch swipe
  useEffect(()=>{
    let startX = null
    function onTouchStart(e){ startX = e.touches[0].clientX }
    function onTouchEnd(e){
      if(startX === null) return
      const endX = e.changedTouches[0].clientX
      const dx = endX - startX
      if(dx < -40) setActive(v => Math.min(3, v+1))
      if(dx > 40) setActive(v => Math.max(0, v-1))
      startX = null
    }
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  // background audio simple loop using oscillators as placeholder (no external assets)
  useEffect(()=>{
    let ctx, o1
    if(audioOn){
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      o1 = ctx.createOscillator()
      const g = ctx.createGain()
      o1.type = 'sine'
      o1.frequency.value = 110
      g.gain.value = 0.0009
      o1.connect(g)
      g.connect(ctx.destination)
      o1.start()
    }
    return () => {
      if(o1){ try{ o1.stop() }catch(e){} }
      if(ctx){ try{ ctx.close() }catch(e){} }
    }
  }, [audioOn])

  const cars = [
    { id:1, title: 'BMW M5 Competition 2020', price: '6 900 000 ₽', km:'45 000', scene:'sport' },
    { id:2, title: 'Audi RS6 Avant 2021', price: '7 200 000 ₽', km:'35 000', scene:'lux' },
    { id:3, title: 'Porsche 911 Carrera 2019', price: '12 500 000 ₽', km:'22 000', scene:'sport' },
    { id:4, title: 'Tesla Model S 2022', price: '9 800 000 ₽', km:'18 000', scene:'tech' }
  ]

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="title">AutoSpace 3D — Full App Demo</div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <div className="mode-toggle small">{mode === 'race' ? '🎮 Race Select' : '📋 Speed List'}</div>
            <button className="btn" onClick={()=>setMode(m=> m==='race' ? 'list' : 'race')}>Переключить</button>
            <button className="btn" onClick={()=>setAudioOn(a=>!a)}>{audioOn ? '🔈' : '🔇'}</button>
          </div>
        </div>

        <div className="canvas-wrap">
          {mode === 'race' ? (
            <Canvas camera={{ position: [0, 3.5, 6], fov: 35 }}>
              <Scene activeIndex={active} xOffset={xOffset} />
              <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
            </Canvas>
          ) : (
            <div style={{padding:20}}>
              {cars.map((c, i) => (
                <div key={c.id} style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8, marginBottom:10}}>
                  <div style={{fontWeight:700}}>{c.title}</div>
                  <div className="small">{c.km} • {c.price}</div>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div style={{fontWeight:800, fontSize:16}}>{cars[active].title}</div>
            <div style={{opacity:0.85, marginTop:6}} className="small">{cars[active].km} • {cars[active].price}</div>
            <div className="controls">
              <button className="btn" onClick={()=>setActive(i=>Math.max(0,i-1))}>◀</button>
              <button className="btn" onClick={()=>setActive(i=>Math.min(3,i+1))}>▶</button>
              <button className="btn" onClick={()=>alert('Открыть карточку: '+cars[active].title)}>Подробнее</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

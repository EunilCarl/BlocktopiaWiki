import { useState } from 'react'
import './App.css'
import BlocktopiaWiki from './Blocktopia.jsx'

function App() {
  const [count, setCount] = useState(0)



  return (

   <>
    <BlocktopiaWiki></BlocktopiaWiki>
   </>
    

  )
}

export default App

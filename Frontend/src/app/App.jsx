import "./App.css"
import { Editor } from "@monaco-editor/react"
import {useRef,useMemo,useState,useEffect} from "react"
import {MonacoBinding} from "y-monaco"
import * as Y from "yjs"
import {SocketIOProvider} from "y-socket.io"

function App() {
  const editorRef=useRef(null)
  const [userName,setName]=useState(()=>{
    return new URLSearchParams(window.location.search).get("userName") || ""
  })

  const [users,setUsers]=useState([])
 // In React, useMemo is a hook used to optimize performance by caching (memoizing) the result of expensive computations so they don’t run on every render.
  const ydoc=useMemo(()=> new Y.Doc(),[])
  const yText=useMemo(()=> ydoc.getText("monoco"),[ydoc])

  const handleMount=(editor)=>{
    editorRef.current=editor
     new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    )
  }
  const handleSubmit=(e)=>{
    e.preventDefault()
    setName(e.target.userName.value)
    window.history.pushState({}, "" , "?userName=" + e.target.userName.value)
  }
  useEffect(()=>{
    if(userName){
       const provider=new SocketIOProvider("http://localhost:3000","monaco",ydoc,{
      autoConnect:true
    })
      
    provider.awareness.setLocalStateField("user",{userName})
    const states=Array.from(provider.awareness.getStates().values())
    setUsers(states.filter(state=>state.user && state.user.userName).map(state=>state.user))
    provider.awareness.on("change",()=>{
      const states=Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state=> state.user && state.user.userName).map(state=>state.user))
    })
     console.log(states)
    function handleBeforeUnload(){
      provider.awareness.setLocalStateField("user",null)
    }

    window.addEventListener("beforeunload",handleBeforeUnload)
    return ()=>{
      provider.disconnect()
      window.removeEventListener("beforeunload",handleBeforeUnload)
    }
    }
  
  },[
    userName
  ])

  if(!userName){
     return (
       <>
       <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
          <form onSubmit={handleSubmit}
          className="flex flex-col gap-4">
            <input
             type="text"
             placeholder="Enter your name"
             className="p-2 rounded-lg bg-gray-800 text-white"
             name="userName"
             />
             <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font bold"> join</button>
          </form>
       </main>
       </>
     )
  }
   

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 rounded-lg bg-amber-50 ">
      <h2 className="text-2xl font-bold p-4 bordewr-b border-gray-300">Users</h2>
      <ul className="p-4">
       {users.map((user, index) => (
      <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
    {user.userName}
     </li>
     ))}
      </ul>
      </aside>
       <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
       <Editor 
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
       </section>
    </main>
  )
}

export default App

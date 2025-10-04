import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../src_auth';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
const googleProvider = new GoogleAuthProvider();

export default function SignAuth(){
  const nav = useNavigate();
  const [tab, setTab] = useState('signin');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const doGoogle = async ()=>{
    try{
      await signInWithPopup(auth, googleProvider);
      nav('/dashboard');
    }catch(e){ alert('Google sign-in failed: '+e.message) }
  };

  const doSignUp = async (e)=>{
    e.preventDefault();
    try{
      await createUserWithEmailAndPassword(auth, email, password);
      nav('/dashboard');
    }catch(e){ alert(e.message) }
  };
  const doSignIn = async (e)=>{
    e.preventDefault();
    try{
      await signInWithEmailAndPassword(auth, email, password);
      nav('/dashboard');
    }catch(e){ alert(e.message) }
  };

  return (
    <div style={{fontFamily:'Inter, sans-serif',display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'#f6f8fb'}}>
      <div style={{width:920,display:'flex',boxShadow:'0 10px 30px rgba(20,20,50,0.08)',borderRadius:12,overflow:'hidden'}}>
        <div style={{flex:1,padding:40,background:'linear-gradient(180deg,#6b8cff,#89b0ff)',color:'white'}}>
          <h1 style={{fontSize:28,marginBottom:10}}>Smart EdTech-1</h1>
          <p style={{opacity:0.95}}>Personalized learning — MVP for presentation</p>
          <div style={{marginTop:30}}>
            <button onClick={doGoogle} style={{padding:'10px 16px',borderRadius:8,background:'white',color:'#2b3a67',border:'none',cursor:'pointer'}}>Continue with Google</button>
          </div>
          <div style={{marginTop:24,opacity:0.9}}>
            <div style={{fontSize:13}}>Demo username/password: test@example.com / password</div>
          </div>
        </div>
        <div style={{flex:1.1,background:'white',padding:28}}>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button onClick={()=>setTab('signin')} style={{flex:1,padding:10,borderRadius:8,background: tab==='signin' ? '#eef4ff' : '#fff',border:'1px solid #eee'}}>Sign In</button>
            <button onClick={()=>setTab('signup')} style={{flex:1,padding:10,borderRadius:8,background: tab==='signup' ? '#eef4ff' : '#fff',border:'1px solid #eee'}}>Sign Up</button>
          </div>
          {tab==='signin' ? (
            <form onSubmit={doSignIn}>
              <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,marginBottom:8}} />
              <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:10,marginBottom:8}} />
              <button type='submit' style={{width:'100%',padding:10,borderRadius:8,background:'#2b3a67',color:'white',border:'none'}}>Sign In</button>
            </form>
          ) : (
            <form onSubmit={doSignUp}>
              <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,marginBottom:8}} />
              <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:10,marginBottom:8}} />
              <button type='submit' style={{width:'100%',padding:10,borderRadius:8,background:'#2b3a67',color:'white',border:'none'}}>Create Account</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

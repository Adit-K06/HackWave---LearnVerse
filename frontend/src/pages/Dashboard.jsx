import React, {useState, useEffect} from 'react';
import { auth } from '../src_auth';
import { signOut } from 'firebase/auth';
import Profile from './dashboard_components/Profile';
import Quiz from './dashboard_components/Quiz';
import Videos from './dashboard_components/Videos';
import Learn from './dashboard_components/Learn'; // 1. Import
import axios from 'axios';

export default function Dashboard(){
  const [tab, setTab] = useState('learn'); // Default to the learn tab
  const [profile, setProfile] = useState(null);

  useEffect(()=>{
    const fetchProfile = async ()=>{
      try{
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get('http://localhost:8000/api/profile', { headers: { Authorization: 'Bearer '+token }});
        setProfile(res.data);
      }catch(e){
        console.log('Could not reach backend (ok for MVP)', e.message);
        setProfile({name: auth.currentUser.email || 'Student', progress: 42, suggestions:['Revise Chapter 3','Practice more quizzes']});
      }
    };
    if(auth.currentUser) fetchProfile();
  },[]);

  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'Inter, sans-serif'}}>
      <div style={{width:260,background:'#0f1724',color:'white',padding:20}}>
        <h3>Smart EdTech</h3>
        <div style={{marginTop:20}}>
          <button onClick={()=>setTab('dashboard')} style={btnStyle(tab==='dashboard')}>Dashboard</button>
          <button onClick={()=>setTab('learn')} style={btnStyle(tab==='learn')}>Learn a Topic</button> {/* 2. Add button */}
          <button onClick={()=>setTab('profile')} style={btnStyle(tab==='profile')}>Profile</button>
          {/* You can integrate the quiz into the Learn page or keep it separate */}
        </div>
        <div style={{position:'absolute',bottom:30,left:20}}>
          <div style={{marginBottom:8}}>Signed in as</div>
          <div style={{fontWeight:700}}>{profile ? profile.name : 'Guest'}</div>
          <div style={{marginTop:10}}>
            <button onClick={()=>signOut(auth).then(()=>window.location='/')} style={{padding:8,borderRadius:6,background:'#ef4444',border:'none',color:'white'}}>Sign Out</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,padding:24,background:'#f3f6fb'}}>
        {tab==='dashboard' && <MainDashboard profile={profile} />}
        {tab==='learn' && <Learn />} {/* 3. Render component */}
        {tab==='profile' && <Profile profile={profile} />}
      </div>
    </div>
  )
}

const btnStyle = (active)=>({
  display:'block',width:'100%',textAlign:'left',padding:10,borderRadius:8,marginBottom:8,background: active ? '#1f2937' : 'transparent',border:'none',color:'white',cursor:'pointer'
});

function MainDashboard({profile}){ /* ... unchanged ... */ 
  return (
    <div>
      <h2>Overview</h2>
      <div style={{marginTop:12,display:'flex',gap:16}}>
        <div style={{flex:1,background:'white',padding:16,borderRadius:12,boxShadow:'0 6px 18px rgba(20,20,50,0.05)'}}>
          <h4>Progress</h4>
          <div style={{fontSize:28,fontWeight:700}}>{profile ? profile.progress : '--'}%</div>
        </div>
        <div style={{flex:2,background:'white',padding:16,borderRadius:12}}>
          <h4>Recommendations</h4>
          <ul>
            {(profile && profile.suggestions ? profile.suggestions : ['Take initial assessment']).map((s,i)=><li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
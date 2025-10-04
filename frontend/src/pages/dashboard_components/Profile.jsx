import React from 'react';
export default function Profile({profile}){
  return (
    <div style={{background:'white',padding:20,borderRadius:12}}>
      <h3>Profile</h3>
      <div style={{marginTop:12}}>
        <div><strong>Name:</strong> {profile ? profile.name : 'N/A'}</div>
        <div><strong>Progress:</strong> {profile ? profile.progress+'%' : 'N/A'}</div>
        <div style={{marginTop:8}}><strong>Notes:</strong></div>
        <ul>
          {(profile && profile.suggestions ? profile.suggestions : ['No notes yet']).map((n,i)=><li key={i}>{n}</li>)}
        </ul>
      </div>
    </div>
  )
}

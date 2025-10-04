import React from 'react';
export default function Videos(){
  const demos = [
    {title:'Motion of Planets', desc:'Animated simulation (placeholder)'},
    {title:'Chemical Reaction', desc:'Animated simulation (placeholder)'}
  ];
  return (
    <div style={{background:'white',padding:20,borderRadius:12}}>
      <h3>Animated Videos (MVP)</h3>
      <div style={{marginTop:12}}>
        {demos.map((d,i)=>
          <div key={i} style={{padding:12,borderRadius:8,marginBottom:8,background:'#f8fafc'}}>
            <strong>{d.title}</strong>
            <div>{d.desc}</div>
            <div style={{marginTop:8}}><button style={{padding:8,borderRadius:6}}>Play (placeholder)</button></div>
          </div>
        )}
      </div>
    </div>
  )
}

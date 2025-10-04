import React, {useState} from 'react';
export default function Quiz(){
  const [qnum,setQnum]=useState(0);
  const questions = [
    {q:'What is 2+2?', options:[2,3,4,5], ans:2},
    {q:'Capital of India?', options:['Delhi','Mumbai','Kolkata'], ans:0}
  ];
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);

  const choose = (i)=> {
    if(done) return;
    if(i===questions[qnum].ans) setScore(s=>s+1);
    if(qnum+1<questions.length) setQnum(qnum+1)
    else setDone(true);
  }

  return (
    <div style={{background:'white',padding:20,borderRadius:12}}>
      <h3>Quiz</h3>
      {!done ? (
        <div>
          <div style={{marginTop:12,fontWeight:700}}>{questions[qnum].q}</div>
          <div style={{marginTop:10}}>
            {questions[qnum].options.map((o,idx)=>
              <button key={idx} onClick={()=>choose(idx)} style={{display:'block',marginTop:8,padding:8}}>{o}</button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h4>Completed</h4>
          <div>Score: {score}/{questions.length}</div>
        </div>
      )}
    </div>
  )
}

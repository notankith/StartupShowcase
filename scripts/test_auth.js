import fetch from 'node-fetch'

async function signup(){
  const res = await fetch('http://localhost:3000/api/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tester2@example.com', password: 'Password123!', fullName: 'Tester2' }),
  })
  const txt = await res.text()
  console.log('signup status', res.status, txt)
}

async function signin(){
  const res = await fetch('http://localhost:3000/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tester2@example.com', password: 'Password123!' }),
    redirect: 'manual'
  })
  const txt = await res.text()
  console.log('signin status', res.status, txt)
}

signup().then(()=> signin()).catch(console.error)

import Head from 'next/head'

export default function Index() {
  return (
    <>
      <Head>
        <title>fairplay</title>
      </Head>
      <Main />
    </>
  )
}

function Main() {
  return (
    <main style={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
      <div id="main-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>featured videos</h1>
        <div className="video" style={{
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
        </div>
      </div>
    </main>
  )
}

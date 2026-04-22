import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../stores/AuthContext'

interface AuthProps {
  initialMode?: 'login' | 'signup'
  onBack?: () => void
}

export default function Auth({ initialMode = 'login', onBack: _onBack }: AuthProps) {
  const { signIn, signInWithGoogle, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode) // login | signup
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
        setDone(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      // Redirect handled by onAuthStateChange listener in AuthContext.
    } catch (err) {
      // Swallow the popup-closed case — it's just the user dismissing the dialog.
      const code = (err as { code?: string })?.code
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    }
    setGoogleLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#3b82f6,#818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 12px',
            }}
          >
            ◈
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e8e6e1', letterSpacing: 1 }}>
            LIFE OS
          </div>
          <div style={{ fontSize: 11, color: '#444', letterSpacing: 2, marginTop: 4 }}>
            YOUR PERSONAL OPERATING SYSTEM
          </div>
        </div>

        {done ? (
          <div
            style={{
              background: '#0a1a0a',
              border: '1px solid #22c55e44',
              borderRadius: 12,
              padding: 24,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 14, color: '#22c55e', marginBottom: 8 }}>Account created!</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              Check your email to confirm, then log in.
            </div>
            <button
              className="btn"
              onClick={() => {
                setMode('login')
                setDone(false)
              }}
              style={{
                background: '#818cf8',
                color: '#fff',
                padding: '8px 20px',
                marginTop: 16,
                fontFamily: 'inherit',
                width: '100%',
              }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                background: '#13131a',
                color: '#e8e6e1',
                border: '1px solid #1e1e2e',
                padding: '10px',
                width: '100%',
                fontFamily: 'inherit',
                fontSize: 13,
                opacity: googleLoading ? 0.6 : 1,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  color: '#3b82f6',
                  fontWeight: 700,
                  lineHeight: '18px',
                  marginRight: 8,
                  fontSize: 12,
                }}
              >
                G
              </span>
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            {googleError && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: 11,
                  marginTop: 8,
                  padding: '7px 10px',
                  background: '#2a1010',
                  borderRadius: 6,
                }}
              >
                {googleError}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '16px 0',
              }}
            >
              <div style={{ flex: 1, borderTop: '1px solid #1e1e2e' }} />
              <span style={{ fontSize: 10, color: '#555', letterSpacing: 2 }}>OR</span>
              <div style={{ flex: 1, borderTop: '1px solid #1e1e2e' }} />
            </div>
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#13131a',
                border: '1px solid #1e1e2e',
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#e8e6e1' }}>
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </div>

              {mode === 'signup' && (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: '#555',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      marginBottom: 5,
                    }}
                  >
                    Your Name
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arjun"
                    required
                  />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: '#555',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 5,
                  }}
                >
                  Email
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: '#555',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 5,
                  }}
                >
                  Password
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div
                  style={{
                    color: '#ef4444',
                    fontSize: 11,
                    marginBottom: 12,
                    padding: '7px 10px',
                    background: '#2a1010',
                    borderRadius: 6,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                className="btn"
                type="submit"
                disabled={loading}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  padding: '10px',
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login')
                    setError('')
                  }}
                  style={{
                    background: 'transparent',
                    color: '#818cf8',
                    padding: '2px 8px',
                    fontSize: 11,
                    fontFamily: 'inherit',
                  }}
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

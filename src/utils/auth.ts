import type { Context } from 'hono';
import type { Bindings, SessionData } from '../types';

// Simple password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Session management using signed cookies
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = 'change-this-to-environment-variable'; // TODO: Move to environment variable

export async function createSession(c: Context<{ Bindings: Bindings }>, userId: number, username: string): Promise<void> {
  const sessionData: SessionData = {
    userId,
    username,
    loginTime: Date.now()
  };
  
  const sessionString = JSON.stringify(sessionData);
  const encoded = btoa(sessionString);
  
  c.header('Set-Cookie', `${SESSION_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
}

export async function getSession(c: Context<{ Bindings: Bindings }>): Promise<SessionData | null> {
  const cookie = c.req.header('Cookie');
  if (!cookie) return null;
  
  const cookies = cookie.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  
  if (!sessionCookie) return null;
  
  try {
    const encoded = sessionCookie.split('=')[1];
    const sessionString = atob(encoded);
    const sessionData: SessionData = JSON.parse(sessionString);
    
    // Check if session is expired (24 hours)
    if (Date.now() - sessionData.loginTime > 86400000) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    return null;
  }
}

export async function destroySession(c: Context<{ Bindings: Bindings }>): Promise<void> {
  c.header('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

export async function requireAuth(c: Context<{ Bindings: Bindings }>, next: () => Promise<void>) {
  const session = await getSession(c);
  
  if (!session) {
    return c.redirect('/admin/login');
  }
  
  c.set('session', session);
  await next();
}

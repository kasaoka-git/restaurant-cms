import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// Get store info
app.get('/store-info', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM store_info LIMIT 1'
  ).first();
  
  return c.json(result || {});
})

// Get main images
app.get('/main-images', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM main_images ORDER BY display_order ASC LIMIT 3'
  ).all();
  
  return c.json(results);
})

// Get commitment items
app.get('/commitment-items', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM commitment_items WHERE is_visible = 1 ORDER BY display_order ASC'
  ).all();
  
  return c.json(results);
})

// Get greeting
app.get('/greeting', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM greeting LIMIT 1'
  ).first();
  
  return c.json(result || {});
})

// Get menu images
app.get('/menu-images', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM menu_images ORDER BY display_order ASC'
  ).all();
  
  return c.json(results);
})

// Get banquet courses
app.get('/banquet-courses', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM banquet_courses WHERE is_visible = 1 ORDER BY display_order ASC'
  ).all();
  
  return c.json(results);
})

// Get news
app.get('/news', async (c) => {
  const limit = c.req.query('limit') || '5';
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM news WHERE is_visible = 1 ORDER BY published_at DESC LIMIT ?`
  ).bind(parseInt(limit)).all();
  
  return c.json(results);
})

// Get gallery
app.get('/gallery', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM gallery ORDER BY display_order ASC'
  ).all();
  
  return c.json(results);
})

// Get FAQ
app.get('/faq', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM faq ORDER BY display_order ASC'
  ).all();
  
  return c.json(results);
})

// Get site settings
app.get('/settings/:key', async (c) => {
  const key = c.req.param('key');
  const result = await c.env.DB.prepare(
    'SELECT setting_value FROM site_settings WHERE setting_key = ?'
  ).bind(key).first();
  
  return c.json(result || {});
})

export default app

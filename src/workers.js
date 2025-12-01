// Cloudflare Worker for Productivity App
// Handles API requests and serves the static site

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // Serve static assets
    return handleStaticRequest(request, env);
  }
};

// Handle API requests
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Health check endpoint
    if (pathname === '/api/health') {
      return Response.json(
        { status: 'ok', timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }
    
    // User data endpoints (using KV storage)
    if (pathname.startsWith('/api/users/')) {
      return handleUserData(request, env, corsHeaders);
    }
    
    // Tasks endpoints
    if (pathname.startsWith('/api/tasks/')) {
      return handleTasksData(request, env, corsHeaders);
    }
    
    // Notes endpoints
    if (pathname.startsWith('/api/notes/')) {
      return handleNotesData(request, env, corsHeaders);
    }
    
    // Events endpoints
    if (pathname.startsWith('/api/events/')) {
      return handleEventsData(request, env, corsHeaders);
    }
    
    // 404 for unknown API routes
    return Response.json(
      { error: 'API endpoint not found' },
      { status: 404, headers: corsHeaders }
    );
    
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle static file requests
async function handleStaticRequest(request, env) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  
  // Default to index.html for SPA routing
  if (pathname === '/' || !pathname.includes('.')) {
    pathname = '/index.html';
  }
  
  try {
    // Try to get the asset from Cloudflare's static assets
    const asset = await env.ASSETS.fetch(`${url.origin}${pathname}`);
    
    if (asset.status === 404 && !pathname.includes('.')) {
      // Fallback to index.html for SPA routes
      return await env.ASSETS.fetch(`${url.origin}/index.html`);
    }
    
    return asset;
  } catch (error) {
    // Fallback to index.html
    return await env.ASSETS.fetch(`${url.origin}/index.html`);
  }
}

// Handle user data operations
async function handleUserData(request, env, corsHeaders) {
  const url = new URL(request.url);
  const method = request.method;
  
  if (method === 'GET') {
    // Get user preferences
    const userId = url.pathname.split('/').pop();
    const userData = await env.PRODUCTIVITY_KV.get(`user:${userId}`);
    
    if (!userData) {
      return Response.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return Response.json(JSON.parse(userData), { headers: corsHeaders });
  }
  
  if (method === 'POST' || method === 'PUT') {
    // Save user preferences
    const userId = url.pathname.split('/').pop();
    const userData = await request.json();
    
    await env.PRODUCTIVITY_KV.put(`user:${userId}`, JSON.stringify(userData));
    
    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  }
  
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: corsHeaders }
  );
}

// Handle tasks data operations
async function handleTasksData(request, env, corsHeaders) {
  const url = new URL(request.url);
  const method = request.method;
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return Response.json(
      { error: 'User ID required' },
      { status: 400, headers: corsHeaders }
    );
  }
  
  const tasksKey = `tasks:${userId}`;
  
  if (method === 'GET') {
    const tasks = await env.PRODUCTIVITY_KV.get(tasksKey);
    return Response.json(
      tasks ? JSON.parse(tasks) : [],
      { headers: corsHeaders }
    );
  }
  
  if (method === 'POST' || method === 'PUT') {
    const tasks = await request.json();
    await env.PRODUCTIVITY_KV.put(tasksKey, JSON.stringify(tasks));
    
    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  }
  
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: corsHeaders }
  );
}

// Handle notes data operations
async function handleNotesData(request, env, corsHeaders) {
  const url = new URL(request.url);
  const method = request.method;
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return Response.json(
      { error: 'User ID required' },
      { status: 400, headers: corsHeaders }
    );
  }
  
  const notesKey = `notes:${userId}`;
  
  if (method === 'GET') {
    const notes = await env.PRODUCTIVITY_KV.get(notesKey);
    return Response.json(
      notes ? JSON.parse(notes) : [],
      { headers: corsHeaders }
    );
  }
  
  if (method === 'POST' || method === 'PUT') {
    const notes = await request.json();
    await env.PRODUCTIVITY_KV.put(notesKey, JSON.stringify(notes));
    
    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  }
  
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: corsHeaders }
  );
}

// Handle events data operations
async function handleEventsData(request, env, corsHeaders) {
  const url = new URL(request.url);
  const method = request.method;
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return Response.json(
      { error: 'User ID required' },
      { status: 400, headers: corsHeaders }
    );
  }
  
  const eventsKey = `events:${userId}`;
  
  if (method === 'GET') {
    const events = await env.PRODUCTIVITY_KV.get(eventsKey);
    return Response.json(
      events ? JSON.parse(events) : [],
      { headers: corsHeaders }
    );
  }
  
  if (method === 'POST' || method === 'PUT') {
    const events = await request.json();
    await env.PRODUCTIVITY_KV.put(eventsKey, JSON.stringify(events));
    
    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  }
  
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: corsHeaders }
  );
}
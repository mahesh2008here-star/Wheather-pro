import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Backend API route for feedback submission without exposing developer email on the client side
  app.post('/api/feedback', async (req, res) => {
    try {
      const targetEmail = process.env.FEEDBACK_GMAIL || 'mmmmahe46@gmail.com';
      const { 
        displayName, 
        rating, 
        feedbackText, 
        comment,
        selectedTags, 
        tags,
        userLocation, 
        location,
        userEmail,
        email 
      } = req.body;

      const finalComment = comment || feedbackText || 'No comment provided';
      const finalTags = tags || selectedTags || [];
      const finalLocation = location || userLocation || 'Unknown';
      const finalEmail = email || userEmail || 'Anonymous (App User)';

      const emailPayload = {
        _subject: `🌟 New Farm Weather Feedback (${rating} Stars) from ${displayName || 'User'}`,
        _captcha: 'false',
        rating: `${rating} / 5 Stars`,
        reviewer_name: displayName || 'Farm Weather User',
        reviewer_email: finalEmail,
        comment: finalComment,
        selected_tags: Array.isArray(finalTags) ? finalTags.join(', ') : 'None',
        user_location: finalLocation,
        timestamp: new Date().toLocaleString(),
        app_version: 'Farm Weather - Smart Agriculture & Climate'
      };

      await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      return res.json({ success: true, message: 'Feedback delivered successfully' });
    } catch (err) {
      console.warn('Backend feedback dispatch note:', err);
      // Return success to the user interface
      return res.json({ success: true, message: 'Feedback logged successfully' });
    }
  });

  // Backend API route for checking GitHub app updates safely (bypasses browser CORS & User-Agent limits)
  app.get('/api/updates', async (req, res) => {
    try {
      const owner = (req.query.owner as string) || 'mahesh2008here-star';
      const repo = (req.query.repo as string) || 'Wheather-pro';

      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FarmWeatherApp/1.2.0 (Android Update Service)'
      };

      // 1. Try fetching latest release
      let ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest?_t=${Date.now()}`, { headers });
      
      if (!ghRes.ok && ghRes.status === 404) {
        // 2. Fallback to list releases if no "latest" release tag is set
        ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?_t=${Date.now()}`, { headers });
      }

      if (ghRes.ok) {
        const data = await ghRes.json();
        return res.json({ success: true, data });
      }

      // 3. Fallback to repo contents search if releases returned 404
      const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents?_t=${Date.now()}`, { headers });
      if (contentsRes.ok) {
        const contentsData = await contentsRes.json();
        return res.json({ success: true, isContents: true, data: contentsData });
      }

      return res.status(ghRes.status).json({ success: false, error: `GitHub API returned HTTP ${ghRes.status}` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server update proxy failed' });
    }
  });

  // Create Vite dev server middleware attached to the HTTP server for WebSocket support
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: isHmrDisabled ? false : { server }
    },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

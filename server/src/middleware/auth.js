import { supabaseClient } from '../config/supabase.js';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token && token !== 'demo_token' && supabaseClient) {
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        if (user && !error) {
          req.user = {
            id: user.id,
            email: user.email,
            isGuest: false
          };
          return next();
        }
      }
    }

    // Fallback to local default / demo farmer profile when token is absent or demo_token
    req.user = {
      id: DEMO_USER_ID,
      email: 'farmer@agrisahayak.local',
      isGuest: true
    };
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    req.user = {
      id: DEMO_USER_ID,
      email: 'farmer@agrisahayak.local',
      isGuest: true
    };
    next();
  }
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - vc-phoenix.svg (Logo)
     * - og-image.png (Open Graph Image)
     */
    '/((?!favicon.ico|manifest.json|vc-phoenix.svg|og-image.png).*)',
  ],
};

export default async function middleware(req) {
  const url = new URL(req.url);

  // 1. If already authenticated via cookie, let them pass
  const cookie = req.headers.get('cookie') || '';
  if (cookie.includes('auth=volleyball-secure-token')) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  // 2. Handle form submission
  if (req.method === 'POST') {
    const formData = await req.formData();
    const password = formData.get('password');

    if (password === 'volleyball') {
      // Set secure cookie and redirect back to the page
      return new Response(null, {
        status: 302,
        headers: {
          'Location': url.pathname,
          'Set-Cookie': 'auth=volleyball-secure-token; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000'
        }
      });
    }
  }

  // 3. Serve the custom password-only HTML page
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - VC Phönix</title>
    <meta property="og:title" content="VC Phönix Vereinskalender">
    <meta property="og:description" content="Alle Termine, Spiele und Events des VC Phönix. (Intern)">
    <meta property="og:image" content="https://phoenix-calendar.vercel.app/og-image.png">
    <meta property="og:type" content="website">
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@400;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            background-color: #ff5800;
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .login-card {
            background: #ffffff;
            color: #111827;
            padding: 3rem 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
            text-align: center;
            width: 100%;
            max-width: 400px;
            box-sizing: border-box;
            margin: 1rem;
            animation: fadeInUp 0.5s ease-out;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            margin: 0 0 1.5rem 0;
            text-transform: uppercase;
        }
        input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 1.5rem;
            box-sizing: border-box;
            transition: border-color 0.2s;
            font-family: 'Inter', sans-serif;
            text-align: center;
        }
        input:focus {
            outline: none;
            border-color: #ff5800;
        }
        button {
            width: 100%;
            padding: 1rem;
            background: #111827;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            text-transform: uppercase;
            font-family: 'Inter', sans-serif;
        }
        button:hover {
            background: #374151;
        }
        .error {
            color: #dc2626;
            font-size: 0.9rem;
            margin-top: -1rem;
            margin-bottom: 1rem;
            display: block;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h1>Vereinskalender</h1>
        <form method="POST">
            ${req.method === 'POST' ? '<span class="error">Falsches Passwort</span>' : ''}
            <input type="password" name="password" placeholder="Passwort eingeben" required autofocus>
            <button type="submit">Eintreten</button>
        </form>
    </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

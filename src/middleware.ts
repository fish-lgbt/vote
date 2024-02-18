import { NextRequest, NextResponse } from 'next/server';

export const middleware = async (request: NextRequest) => {
  // Check if the session cookie exists
  if (!request.cookies.get('sessionId')) {
    const response = NextResponse.redirect(request.url);
    const sessionId = crypto.randomUUID();

    // Correctly set the cookie on the response object
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return response;
  }

  // If the cookie exists, just pass through
  return NextResponse.next();
};

export const config = {
  matcher: '/api/:path*',
};

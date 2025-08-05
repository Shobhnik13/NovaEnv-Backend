const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

const requireAuth = ClerkExpressWithAuth({
    onError: (error) => {
        console.error('Middleware auth error:', error);
        return { status: 401, message: 'Unauthorized' };
    }
});

module.exports = requireAuth;
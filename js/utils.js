// Polyfill localStorage if it's blocked (private mode, opaque origins, etc.)
// This must run BEFORE DOMContentLoaded to prevent any uncaught SecurityErrors.
(function() {
    try {
        window.localStorage.setItem('__test', '1');
        window.localStorage.removeItem('__test');
    } catch (e) {
        console.warn('localStorage unavailable, using in-memory fallback');
        const mem = {};
        try {
            Object.defineProperty(window, 'localStorage', {
                configurable: true,
                value: {
                    getItem(k) { return mem[k] === undefined ? null : mem[k]; },
                    setItem(k, v) { mem[k] = String(v); },
                    removeItem(k) { delete mem[k]; },
                    clear() { for (const k in mem) delete mem[k]; },
                    key(i) { return Object.keys(mem)[i] || null; },
                    get length() { return Object.keys(mem).length; }
                }
            });
        } catch (e2) {
            // If we can't even redefine, individual try/catch in code will handle it
        }
    }
})();

// Helper function to show notifications
function showNotification(message, color) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 2000);
}

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}


window.__gqParts = [];
